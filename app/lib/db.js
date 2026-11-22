// Postgres access (Neon on Vercel, Docker locally). Optional by design:
// public pages and the Redis/file-backed forms never touch this module,
// so everything keeps working when DATABASE_URL is unset. Callers must
// check isDbConfigured() before querying.
import { Pool } from 'pg';

let pool = null;

export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!isDbConfigured()) throw new Error('DATABASE_URL is not set.');
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}
