// Migration test: runs the real migrate script twice against a real Postgres
// (idempotent), then asserts schema, the segregation-of-duties CHECK and the
// append-only audit trigger behave. Needs DATABASE_URL (CI service or local
// Docker); without it the test skips green so zero-credential dev stays green.
//
// Usage: npm run test:db
import { execFileSync } from 'node:child_process';

if (!process.env.DATABASE_URL) {
  console.log('SKIP test:db: DATABASE_URL unset (no local Postgres).');
  process.exit(0);
}

const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
};

// Migrate twice: second run must be a clean no-op.
const run1 = execFileSync(process.execPath, ['scripts/db-migrate.mjs'], { encoding: 'utf8' });
const run2 = execFileSync(process.execPath, ['scripts/db-migrate.mjs'], { encoding: 'utf8' });
check(/applied 001_initial_schema.sql|up to date/.test(run1), `first migrate unexpected: ${run1}`);
check(/up to date/.test(run2), `second migrate must be no-op, got: ${run2}`);

const { Pool } = await import('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  const tables = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('earners','results','audit_log','schema_migrations')"
  );
  check(tables.rows.length === 4, `expected 4 tables, found ${tables.rows.map((r) => r.tablename)}`);

  // Segregation of duties: verifier == logger must fail, different verifier passes.
  const earner = await pool.query(
    "INSERT INTO earners (name, role, payroll_tier) VALUES ('Migration Test', 'tester', 1) RETURNING id"
  );
  const eid = earner.rows[0].id;
  let selfVerifyFailed = false;
  try {
    await pool.query(
      "INSERT INTO results (earner_id, result_type, logged_by, verified_by) VALUES ($1, 'test', 'alice', 'alice')",
      [eid]
    );
  } catch {
    selfVerifyFailed = true;
  }
  check(selfVerifyFailed, 'CHECK must reject verified_by == logged_by');
  await pool.query(
    "INSERT INTO results (earner_id, result_type, logged_by, verified_by) VALUES ($1, 'test', 'alice', 'bob')",
    [eid]
  );

  // audit_log is append-only at the database level.
  const audit = await pool.query(
    "INSERT INTO audit_log (actor, action, entity) VALUES ('migration-test', 'insert', 'results') RETURNING id"
  );
  const aid = audit.rows[0].id;
  let updateFailed = false;
  try {
    await pool.query('UPDATE audit_log SET action = $1 WHERE id = $2', ['mutated', aid]);
  } catch {
    updateFailed = true;
  }
  check(updateFailed, 'audit_log UPDATE must be rejected by trigger');
  let deleteFailed = false;
  try {
    await pool.query('DELETE FROM audit_log WHERE id = $1', [aid]);
  } catch {
    deleteFailed = true;
  }
  check(deleteFailed, 'audit_log DELETE must be rejected by trigger');

  // Cleanup test rows (the one audit row stays by design: append-only).
  await pool.query('DELETE FROM results WHERE earner_id = $1', [eid]);
  await pool.query('DELETE FROM earners WHERE id = $1', [eid]);
} finally {
  await pool.end();
}

if (failures.length) {
  console.error(`DB MIGRATE TEST FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('DB migrate test passed: idempotent, CHECK + append-only trigger enforced.');
