// Inflows integration test: real routes + real Postgres. Covers gating,
// validation (zero amounts rejected), audit writes, metrics ratios +
// bucket totals with zero PII, and inflows/quarterly CSV exports.
// Needs DATABASE_URL (CI service or local Docker); otherwise skips green.
//
// Usage: npm run test:inflows
import { register } from 'node:module';

if (!process.env.DATABASE_URL) {
  console.log('SKIP test:inflows: DATABASE_URL unset (no local Postgres).');
  process.exit(0);
}

register('./test-shim-loader.mjs', import.meta.url);
const lib = await import(new URL('../app/lib/adminAuth.js', import.meta.url).href);
const inflows = await import(new URL('../app/api/admin/inflows/route.js', import.meta.url).href);
const exp = await import(new URL('../app/api/admin/export/route.js', import.meta.url).href);
const { getPilotMetrics } = await import(new URL('../app/lib/pilotMetrics.js', import.meta.url).href);
const { Pool } = await import('pg');

process.env.GITHUB_CLIENT_ID = 'test-client';
process.env.GITHUB_CLIENT_SECRET = 'test-secret';
process.env.AUTH_SECRET = 'test-auth-secret-that-is-long-enough';
process.env.ADMIN_GITHUB_LOGINS = 'alice';

const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
};
const req = (url, body, cookie) => ({
  url,
  headers: { get: (k) => (String(k).toLowerCase() === 'cookie' ? cookie || null : null) },
  json: async () => body
});
const alice = `bk_admin=${lib.signSession('alice')}`;
const mallory = `bk_admin=${lib.signSession('mallory')}`;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const created = [];
try {
  // Gating + validation.
  let r = await inflows.GET(req('http://t/x', null, null));
  check(r.status === 401, `inflows GET signed-out must 401, got ${r.status}`);
  r = await inflows.POST(req('http://t/x', {}, mallory));
  check(r.status === 403, `inflows POST non-admin must 403, got ${r.status}`);
  const post = (body) => inflows.POST(req('http://t/x', body, alice));
  r = await post({ category: 'grant_donation', origin: 'external', bucket: 'runway', sats_amount: 0, kes_equivalent: 0, source_note: 'Zero' });
  check(r.status === 400, `zero amounts must 400, got ${r.status}`);
  r = await post({ category: 'nope', origin: 'external', bucket: 'runway', sats_amount: 1, source_note: 'Xx' });
  check(r.status === 400, `bad category must 400, got ${r.status}`);

  // Valid grant + earned inflows, one with a hostile note for CSV escaping.
  r = await post({
    inflow_date: '2026-11-20', category: 'grant_donation', origin: 'external', bucket: 'reserve',
    sats_amount: 100000, kes_equivalent: 15000, source_note: 'TestHarbor Geyser payout', payment_reference: 'hash-1'
  });
  let b = await r.json();
  check(r.status === 201 && b.inflow?.id, `grant inflow must 201, got ${r.status}`);
  created.push(b.inflow.id);
  r = await post({
    inflow_date: '2026-11-21', category: 'earned_merch', origin: 'local', bucket: 'runway',
    sats_amount: 21000, kes_equivalent: 0, source_note: '=cmd|calc', payment_reference: ''
  });
  b = await r.json();
  check(r.status === 201, `earned inflow must 201, got ${r.status}`);
  created.push(b.inflow.id);

  // Audit trail.
  const audit = await pool.query(
    "SELECT COUNT(*)::int AS n FROM audit_log WHERE entity = 'inflows' AND entity_id = ANY($1)",
    [created]
  );
  check(audit.rows[0].n === 2, 'both inflows must hit audit_log');

  // Metrics: ratios + buckets, zero PII.
  const m = await getPilotMetrics();
  check(m.totalSatsIn >= 121000, `totalSatsIn wrong: ${m.totalSatsIn}`);
  check(m.earnedSatsIn >= 21000 && m.grantSatsIn >= 100000, 'earned/grant split wrong');
  check(m.externalSatsIn >= 100000 && m.localSatsIn >= 21000, 'external/local split wrong');
  check(m.bucketInflows.reserve >= 100000 && m.bucketInflows.runway >= 21000, 'bucket totals wrong');
  const blob = JSON.stringify(m);
  check(!blob.includes('Geyser') && !blob.includes('hash-1'), 'PII-ish note/reference leak in metrics');

  // Inflows CSV: gated, escaped, matches rows.
  r = await exp.GET(req('http://t/api/admin/export?type=inflows', null, null));
  check(r.status === 401, `inflows CSV signed-out must 401, got ${r.status}`);
  r = await exp.GET(req('http://t/api/admin/export?type=inflows', null, alice));
  const csv = await r.text();
  check(r.status === 200 && csv.includes('TestHarbor Geyser payout'), 'inflows CSV must list rows');
  check(csv.includes("'=cmd|calc"), 'inflows CSV must neutralize formulas');

  // Quarterly CSV: aggregates + ratios.
  r = await exp.GET(req('http://t/api/admin/export?type=quarterly', null, alice));
  const q = await r.text();
  check(r.status === 200, `quarterly must 200, got ${r.status}`);
  for (const key of ['total_grants_sats', 'earned_revenue_ratio', 'net_sats_inflow_ratio', 'bucket_reserve_in']) {
    check(q.includes(key), `quarterly missing ${key}`);
  }
} finally {
  if (created.length) {
    await pool.query('DELETE FROM inflows WHERE id = ANY($1)', [created]).catch(() => {});
  }
  await pool.end();
}

if (failures.length) {
  console.error(`INFLOWS TEST FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('Inflows test passed: gating, validation, audit, metrics, CSV exports.');
