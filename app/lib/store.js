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

export const store = { readList, appendTo, redisConfigured };
