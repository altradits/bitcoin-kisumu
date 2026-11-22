// Pilot metrics test: live aggregates are verified-only counts with zero PII,
// and an empty database honestly reports the Day-0 baseline. Needs a
// Postgres server (CI service or local); otherwise skips green.
//
// Usage: npm run test:pilot
import { execFileSync } from 'node:child_process';
import { register } from 'node:module';

register('./test-shim-loader.mjs', import.meta.url);

if (!process.env.DATABASE_URL) {
  console.log('SKIP test:pilot: DATABASE_URL unset (no local Postgres).');
  process.exit(0);
}

const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
};
const MAIN_DB = process.env.DATABASE_URL;
const EMPTY_DB = MAIN_DB.replace(/\/[^/]*$/, '/bk_pilot_empty');

const { Pool } = await import('pg');
// Fresh empty database for the baseline phase (idempotent reuse).
{
  const admin = new Pool({ connectionString: MAIN_DB });
  await admin.query('DROP DATABASE IF EXISTS bk_pilot_empty');
  await admin.query('CREATE DATABASE bk_pilot_empty');
  await admin.end();
  execFileSync(process.execPath, ['scripts/db-migrate.mjs'], {
    encoding: 'utf8',
    env: { ...process.env, DATABASE_URL: EMPTY_DB }
  });
}

process.env.DATABASE_URL = EMPTY_DB;
const { getPilotMetrics } = await import(new URL('../app/lib/pilotMetrics.js', import.meta.url).href);
const baseline = await getPilotMetrics();
check(baseline.source === 'baseline', `empty DB must report baseline, got ${baseline.source}`);
check(baseline.activeEarners === 0 && baseline.verifiedResults === 0, 'baseline counts must be zero');

// Live phase on the main test database.
process.env.DATABASE_URL = MAIN_DB;
const pool = new Pool({ connectionString: MAIN_DB });
const createdEarners = [];
const createdResults = [];
try {
  const a = await pool.query(
    "INSERT INTO earners (name, role, phone, consent_date, lightning_address) VALUES ('TestHarbor Metrics', 'peer_teacher', '0711222333', '2026-11-01', 'metrics@blink.sv') RETURNING id"
  );
  const b = await pool.query("INSERT INTO earners (name, role, active) VALUES ('TestHarbor Resting', 'storyteller', false) RETURNING id");
  createdEarners.push(a.rows[0].id, b.rows[0].id);
  for (const [status, type, date] of [
    ['verified', 'Shop signed up', '2026-11-10'],
    ['verified', 'Post published', '2026-11-17'],
    ['submitted', 'Draft work', '2026-11-17'],
    ['rejected', 'Bad work', '2026-11-17']
  ]) {
    const r = await pool.query(
      `INSERT INTO results (earner_id, result_type, result_date, status, logged_by, verified_by)
       VALUES ($1, $2, $3, $4, 'alice', CASE WHEN $4 = 'verified' THEN 'bob' ELSE NULL END) RETURNING id`,
      [a.rows[0].id, type, date, status]
    );
    createdResults.push(r.rows[0].id);
  }

  const m = await getPilotMetrics();
  check(m.source === 'live', `seeded DB must report live, got ${m.source}`);
  check(m.activeEarners === 1, `active earners must be 1, got ${m.activeEarners}`);
  check(m.verifiedResults === 2, `verified results must be 2, got ${m.verifiedResults}`);
  check(m.byRole.peer_teacher === 2, `byRole wrong: ${JSON.stringify(m.byRole)}`);
  check(m.weekly.length === 2, `weekly must span 2 weeks, got ${JSON.stringify(m.weekly)}`);

  // Zero PII: neither values nor keys may leak personal data.
  const blob = JSON.stringify(m);
  for (const secret of ['TestHarbor Metrics', '0711222333', 'metrics@blink.sv', 'alice', 'bob']) {
    check(!blob.includes(secret), `PII leak in metrics: ${secret}`);
  }
  for (const key of ['"name"', '"phone"', '"lightning_address"', '"email"', '"contact"']) {
    check(!blob.includes(key), `PII key leak in metrics: ${key}`);
  }
} finally {
  if (createdResults.length) {
    await pool.query('DELETE FROM results WHERE id = ANY($1)', [createdResults]).catch(() => {});
  }
  if (createdEarners.length) {
    await pool.query('DELETE FROM earners WHERE id = ANY($1)', [createdEarners]).catch(() => {});
  }
  await pool.end();
}

if (failures.length) {
  console.error(`PILOT METRICS TEST FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('Pilot metrics test passed: verified-only aggregates, baseline fallback, zero PII.');
