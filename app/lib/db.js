// Postgres access (Neon on Vercel, Docker locally). Optional by design:
// public pages and the Redis/file-backed forms never touch this module,
// so everything keeps working when DATABASE_URL is unset. Callers must
// check isDbConfigured() before querying.
import { Pool } from 'pg';

const pools = new Map();

export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!isDbConfigured()) throw new Error('DATABASE_URL is not set.');
  const url = process.env.DATABASE_URL;
  if (!pools.has(url)) pools.set(url, new Pool({ connectionString: url }));
  return pools.get(url);
}

// pg DATE arrives as local-midnight; format local calendar components.
// NEVER .toISOString().slice(0, 10) on these: UTC conversion shifts the
// calendar day on UTC+ servers (e.g. Africa/Nairobi).
export function fmtPgDate(v) {
  if (v === null || v === undefined) return v;
  if (v instanceof Date) {
    return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;
  }
  return String(v).slice(0, 10);
}
