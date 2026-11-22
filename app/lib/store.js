import { promises as fs } from 'fs';
import path from 'path';

// Durable on Vercel (Upstash Redis), zero-setup locally (data/*.json).
// Redis is used strictly when its env vars exist; otherwise the file
// fallback keeps `npm run dev` working with no credentials.

const DATA_DIR = path.join(process.cwd(), 'data');

function redisConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function redisClient() {
  const { Redis } = await import('@upstash/redis');
  return Redis.fromEnv();
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

async function appendToFile(file, row) {
  const list = await readListFile(file);
  list.push(row);
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(list, null, 2));
  return row;
}

async function readList(file) {
  if (!redisConfigured()) return readListFile(file);
  const redis = await redisClient();
  const val = await redis.get(keyFor(file));
  return Array.isArray(val) ? val : [];
}

async function appendTo(file, entry) {
  const row = makeRow(entry);
  if (!redisConfigured()) return appendToFile(file, row);
  const redis = await redisClient();
  const key = keyFor(file);
  const current = await readList(file);
  current.push(row);
  await redis.set(key, current);
  return row;
}

// --- Atomic RSVP writes (capacity + duplicate enforcement) ---
//
// Redis path: one Lua script runs check-and-append atomically against the
// same JSON-array value the rest of the store uses (Upstash serializes
// arrays as JSON, so Lua sees plain JSON text via GET).
// File path: an in-process promise-chain mutex serializes writers.
// Best-effort only across processes — production uses Redis.

const RSVP_LUA = `
local list = {}
local raw = redis.call('GET', KEYS[1])
if raw then
  list = cjson.decode(raw)
end
local event_id = ARGV[1]
local contact = ARGV[2]
local capacity = tonumber(ARGV[3])
local count = 0
for _, r in ipairs(list) do
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
table.insert(list, cjson.decode(ARGV[4]))
redis.call('SET', KEYS[1], cjson.encode(list))
return {'ok', count + 1}
`;

const fileLocks = new Map();

function withFileLock(file, fn) {
  const prev = fileLocks.get(file) || Promise.resolve();
  const next = prev.then(fn, fn);
  fileLocks.set(file, next.catch(() => {}));
  return next;
}

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
    await fs.writeFile(path.join(DATA_DIR, 'rsvps.json'), JSON.stringify(list, null, 2));
    return { ...res, row };
  });
}

async function appendRsvpRedis(eventId, row, capacity) {
  const redis = await redisClient();
  const res = await redis.eval(
    RSVP_LUA,
    [keyFor('rsvps.json')],
    [eventId, String(row.contact).toLowerCase(), String(capacity), JSON.stringify(row)]
  );
  const [outcome, count] = Array.isArray(res) ? res : [];
  return { outcome, count: Number(count), row: outcome === 'ok' ? row : null };
}

async function appendRsvp(eventId, entry, capacity) {
  const row = makeRow({ eventId, ...entry });
  if (!redisConfigured()) return appendRsvpFile(eventId, row, capacity);
  return appendRsvpRedis(eventId, row, capacity);
}

export const store = { readList, appendTo, appendRsvp, redisConfigured };
