// Public metrics API test: HTTP 200, CORS + cache headers, JSON schema, and
// zero PII leakage even against a populated database. Needs DATABASE_URL
// for the populated phase (CI service or local Docker); the empty-DB phase
// always runs.
//
// Usage: npm run test:metrics
import { register } from 'node:module';

register('./test-shim-loader.mjs', import.meta.url);
const route = await import(new URL('../app/api/metrics/route.js', import.meta.url).href);

const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
};

const r = await route.GET(new Request('http://test/api/metrics'));
check(r.status === 200, `metrics must 200, got ${r.status}`);
check(r.headers.get('access-control-allow-origin') === '*', 'CORS header missing');
check(String(r.headers.get('cache-control') || '').includes('max-age=60'), 'cache header missing');
const body = await r.json();
for (const k of ['community', 'repo', 'license', 'nonCustodial', 'specVersion', 'metrics']) {
  check(body[k] !== undefined, `missing metadata key: ${k}`);
}
check(body.license === 'MIT' && body.nonCustodial === true && body.specVersion === '1.0', 'metadata values wrong');
check(typeof body.metrics?.activeEarners === 'number', 'metrics shape wrong');

if (!process.env.DATABASE_URL) {
  console.log('SKIP test:metrics PII phase: DATABASE_URL unset (no local Postgres).');
} else {
  // Seed maximum-PII rows, then prove none of it appears in the response.
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const created = { earners: [], results: [], payouts: [], inflows: [], merchants: [] };
  try {
    const e = await pool.query(
      `INSERT INTO earners (name, role, phone, consent_date, lightning_address)
       VALUES ('PII Leakprobe', 'peer_teacher', '0711999888', '2026-11-01', 'leakprobe@blink.sv') RETURNING id`
    );
    const eid = e.rows[0].id;
    created.earners.push(eid);
    const v = await pool.query(
      `INSERT INTO results (earner_id, result_type, evidence, logged_by, status, verified_by)
       VALUES ($1, 'Shop signed up', 'leakprobe@example.com', 'alice', 'verified', 'bob') RETURNING id`,
      [eid]
    );
    created.results.push(v.rows[0].id);
    const p = await pool.query(
      `INSERT INTO payouts (result_id, earner_id, sats_amount, kes_equivalent, payroll_tier_snapshot, payment_reference, paid_by, bucket)
       VALUES ($1, $2, 21000, 3500, 2, 'leakprobe-receipt-9', 'alice', 'runway') RETURNING id`,
      [v.rows[0].id, eid]
    );
    created.payouts.push(p.rows[0].id);
    const i = await pool.query(
      `INSERT INTO inflows (category, origin, bucket, sats_amount, kes_equivalent, source_note, recorded_by)
       VALUES ('grant_donation', 'external', 'reserve', 100000, 15000, 'Leakprobe Donor Name', 'alice') RETURNING id`
    );
    created.inflows.push(i.rows[0].id);
    const m = await pool.query(
      `INSERT INTO merchants (name, category) VALUES ('Leakprobe Duka', 'Shops & Markets') RETURNING id`
    );
    created.merchants.push(m.rows[0].id);

    const r2 = await route.GET(new Request('http://test/api/metrics'));
    const blob = JSON.stringify(await r2.json());
    for (const secret of [
      'Leakprobe', '0711999888', 'leakprobe@blink.sv', 'leakprobe@example.com',
      'leakprobe-receipt-9', 'alice', 'bob'
    ]) {
      check(!blob.includes(secret), `PII leak in /api/metrics: ${secret}`);
    }
    for (const key of ['"name"', '"phone"', '"lightning_address"', '"email"', '"contact"', '"evidence"', '"source_note"']) {
      check(!blob.includes(key), `PII key leak in /api/metrics: ${key}`);
    }
  } finally {
    if (created.payouts.length) {
      await pool.query('DELETE FROM payouts WHERE id = ANY($1)', [created.payouts]).catch(() => {});
    }
    if (created.results.length) {
      await pool.query('DELETE FROM results WHERE id = ANY($1)', [created.results]).catch(() => {});
    }
    if (created.inflows.length) {
      await pool.query('DELETE FROM inflows WHERE id = ANY($1)', [created.inflows]).catch(() => {});
    }
    if (created.merchants.length) {
      await pool.query('DELETE FROM merchants WHERE id = ANY($1)', [created.merchants]).catch(() => {});
    }
    if (created.earners.length) {
      await pool.query('DELETE FROM earners WHERE id = ANY($1)', [created.earners]).catch(() => {});
    }
    await pool.end();
  }
}

if (failures.length) {
  console.error(`METRICS API TEST FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('Metrics API test passed: 200, CORS, schema, zero PII.');
