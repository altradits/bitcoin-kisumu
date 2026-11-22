// Applies db/migrations/*.sql in filename order, tracking applied files in
// schema_migrations so re-running is idempotent. Each file runs in its own
// transaction.
//
// Usage:
//   npm run db:migrate            # apply pending migrations (needs DATABASE_URL)
//   npm run db:migrate -- --dry-run  # list pending files (no DB needed if unset)
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'db/migrations');
const DRY_RUN = process.argv.includes('--dry-run');

const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.sql'))
  .sort();

if (!process.env.DATABASE_URL) {
  if (DRY_RUN) {
    console.log('dry-run (no DATABASE_URL): migration files that would be considered:');
    for (const f of files) console.log(' -', f);
    process.exit(0);
  }
  console.error('DATABASE_URL is not set. See README “Postgres” section to run Postgres locally.');
  process.exit(1);
}

const { Pool } = await import('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())'
  );
  const { rows } = await pool.query('SELECT filename FROM schema_migrations');
  const done = new Set(rows.map((r) => r.filename));
  const pending = files.filter((f) => !done.has(f));
  if (DRY_RUN) {
    console.log(pending.length ? `pending:\n - ${pending.join('\n - ')}` : 'up to date, nothing pending');
  } else {
    for (const f of pending) {
      const sql = readFileSync(path.join(DIR, f), 'utf8');
      await pool.query('BEGIN');
      try {
        await pool.query(sql);
        await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [f]);
        await pool.query('COMMIT');
        console.log('applied', f);
      } catch (err) {
        await pool.query('ROLLBACK');
        throw err;
      }
    }
    if (!pending.length) console.log('up to date, nothing pending');
  }
} finally {
  await pool.end();
}
