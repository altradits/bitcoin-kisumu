import { promises as fs } from 'fs';
import path from 'path';

// Durable on Vercel (Upstash Redis), zero-setup locally (data/*.json).
// Redis is used strictly when its env vars exist; otherwise the file
// fallback keeps `npm run dev` working with no credentials.
//
// Redis lists (RPUSH/LRANGE) make every append atomic — concurrent writers
// can never overwrite each other. A legacy single-JSON-string value (from
// before this change) is migrated to a list once, under a short lock.

const DATA_DIR = path.join(process.cwd(), 'data');

export class StorageUnavailable extends Error {}

// Upstash env vars first; Vercel's Upstash Marketplace integration names
// them KV_REST_API_* instead, so fall back to those automatically.
function redisEnv() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN };
  }
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return { url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN };
  }
  return null;
}

function redisConfigured() {
  return Boolean(redisEnv());
}

// Vercel's filesystem is read-only: without Redis there is nowhere to
// write, so writes must fail loudly (503) instead of pretending.
function vercelWithoutRedis() {
  return process.env.VERCEL === '1' && !redisConfigured();
}

async function redisClient() {
  const { Redis } = await import('@upstash/redis');
  const env = redisEnv();
  // Fail fast: one immediate retry, then the caller falls back — a slow
  // cache must never add seconds of latency to a request.
  return new Redis({ url: env.url, token: env.token, retry: { retries: 1, backoff: () => 0 } });
}

function keyFor(file) {
  return `bk:${file.replace(/\.json$/, '')}`;
}

function makeRow(entry) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    ...entry
  };
}

// --- file fallback (local dev): serialized + atomic renames ---

const fileLocks = new Map();

function withFileLock(file, fn) {
  const prev = fileLocks.get(file) || Promise.resolve();
  const next = prev.then(fn, fn);
  fileLocks.set(file, next.catch(() => {}));
  return next;
}

async function readListFile(file) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err && err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeListFile(file, list) {
  const target = path.join(DATA_DIR, file);
  const tmp = `${target}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2));
  await fs.rename(tmp, target); // atomic: readers never see a torn file
}

async function appendToFile(file, row) {
  return withFileLock(file, async () => {
    const list = await readListFile(file);
    list.push(row);
    await writeListFile(file, list);
    return row;
  });
}

// --- Redis lists ---

// Migrates a legacy single-JSON-string value to a list, once, under a lock.
// Corrupt values are quarantined (never deleted) so nothing is ever lost.
async function ensureList(redis, key) {
  const t = await redis.type(key);
  if (t === 'none' || t === 'list') return;
  const lockKey = `${key}:migrating`;
  const got = await redis.set(lockKey, `${Date.now()}`, { nx: true, ex: 15 });
  if (!got) {
    await new Promise((r) => setTimeout(r, 300));
    const retry = await redis.type(key);
    if (retry === 'list' || retry === 'none') return;
    throw new StorageUnavailable('Storage migration in progress, please retry.');
  }
  try {
    const raw = await redis.get(key);
    let list = [];
    let corrupt = false;
    if (raw) {
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) list = parsed;
        else corrupt = true;
      } catch {
        corrupt = true;
      }
    }
    const pipe = redis.pipeline();
    if (corrupt) pipe.rename(key, `${key}:corrupt:${Date.now()}`);
    else pipe.del(key);
    for (const row of list) pipe.rpush(key, JSON.stringify(row));
    await pipe.exec();
  } finally {
    await redis.del(lockKey);
  }
}

async function readListRedis(file) {
  const redis = await redisClient();
  const key = keyFor(file);
  await ensureList(redis, key);
  const items = await redis.lrange(key, 0, -1);
  const out = [];
  for (const raw of items) {
    try {
      out.push(typeof raw === 'string' ? JSON.parse(raw) : raw);
    } catch {
      // Skip a single corrupt row rather than failing the whole read.
    }
  }
  return out;
}

async function appendToRedis(file, row) {
  const redis = await redisClient();
  const key = keyFor(file);
  await ensureList(redis, key);
  await redis.rpush(key, JSON.stringify(row));
  return row;
}

async function readList(file) {
  if (vercelWithoutRedis()) return [];
  if (!redisConfigured()) return readListFile(file);
  return readListRedis(file);
}

async function appendTo(file, entry) {
  if (vercelWithoutRedis()) {
    throw new StorageUnavailable('Submissions are temporarily unavailable. Please try again soon.');
  }
  const row = makeRow(entry);
  if (!redisConfigured()) return appendToFile(file, row);
  return appendToRedis(file, row);
}

// --- Atomic RSVP writes (capacity + duplicate enforcement) ---
//
// Redis path: one Lua script runs check-and-append atomically over the
// LRANGE list. File path: the same promise-chain mutex serializes writers.
// Best-effort only across processes — production uses Redis.

const RSVP_LUA = `
local items = redis.call('LRANGE', KEYS[1], 0, -1)
local event_id = ARGV[1]
local contact = ARGV[2]
local capacity = tonumber(ARGV[3])
local count = 0
for _, raw in ipairs(items) do
  local r = cjson.decode(raw)
  if r.eventId == event_id then
    count = count + 1
    if r.contact ~= nil and string.lower(r.contact) == contact then
      return {'duplicate', count}
    end
  end
end
if count >= capacity then
  return {'full', count}
end
redis.call('RPUSH', KEYS[1], ARGV[4])
return {'ok', count + 1}
`;

function rsvpOutcome(list, eventId, contactLower, capacity) {
  let count = 0;
  for (const r of list) {
    if (r.eventId === eventId) {
      count += 1;
      if (String(r.contact || '').toLowerCase() === contactLower) {
        return { outcome: 'duplicate', count };
      }
    }
  }
  if (count >= capacity) return { outcome: 'full', count };
  return { outcome: 'ok', count: count + 1 };
}

async function appendRsvpFile(eventId, row, capacity) {
  return withFileLock('rsvps.json', async () => {
    const list = await readListFile('rsvps.json');
    const res = rsvpOutcome(list, eventId, String(row.contact).toLowerCase(), capacity);
    if (res.outcome !== 'ok') return { ...res, row: null };
    list.push(row);
    await writeListFile('rsvps.json', list);
    return { ...res, row };
  });
}

async function appendRsvpRedis(eventId, row, capacity) {
  const redis = await redisClient();
  const key = keyFor('rsvps.json');
  await ensureList(redis, key);
  const res = await redis.eval(
    RSVP_LUA,
    [key],
    [eventId, String(row.contact).toLowerCase(), String(capacity), JSON.stringify(row)]
  );
  const [outcome, count] = Array.isArray(res) ? res : [];
  return { outcome, count: Number(count), row: outcome === 'ok' ? row : null };
}

async function appendRsvp(eventId, entry, capacity) {
  if (vercelWithoutRedis()) {
    throw new StorageUnavailable('Submissions are temporarily unavailable. Please try again soon.');
  }
  const row = makeRow({ eventId, ...entry });
  if (!redisConfigured()) return appendRsvpFile(eventId, row, capacity);
  return appendRsvpRedis(eventId, row, capacity);
}

export const store = { readList, appendTo, appendRsvp, redisConfigured };
