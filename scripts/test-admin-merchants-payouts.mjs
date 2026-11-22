// Merchants + payouts integration test: real routes + real Postgres. Covers
// merchant CRUD, payout gating/validation, verified-only + no-double-pay
// (API and DB UNIQUE), payouts CSV, and live shop/sats metrics with zero PII.
// Needs DATABASE_URL (CI service or local Docker); otherwise skips green.
//
// Usage: npm run test:merchants-payouts
import { register } from 'node:module';

if (!process.env.DATABASE_URL) {
  console.log('SKIP test:merchants-payouts: DATABASE_URL unset (no local Postgres).');
  process.exit(0);
}

register('./test-shim-loader.mjs', import.meta.url);
const lib = await import(new URL('../app/lib/adminAuth.js', import.meta.url).href);
const merchants = await import(new URL('../app/api/admin/merchants/route.js', import.meta.url).href);
const payouts = await import(new URL('../app/api/admin/payouts/route.js', import.meta.url).href);
const exp = await import(new URL('../app/api/admin/export/route.js', import.meta.url).href);
const { getPilotMetrics } = await import(new URL('../app/lib/pilotMetrics.js', import.meta.url).href);
const { Pool } = await import('pg');

process.env.GITHUB_CLIENT_ID = 'test-client';
process.env.GITHUB_CLIENT_SECRET = 'test-secret';
process.env.AUTH_SECRET = 'test-auth-secret-that-is-long-enough';
process.env.ADMIN_GITHUB_LOGINS = 'alice,bob';

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
const created = { merchants: [], earners: [], results: [], payouts: [] };
try {
  // Merchants: gating + validation + CRUD.
  let r = await merchants.GET(req('http://t/x', null, null));
  check(r.status === 401, `merchants GET signed-out must 401, got ${r.status}`);
  r = await merchants.POST(req('http://t/x', {}, mallory));
  check(r.status === 403, `merchants POST non-admin must 403, got ${r.status}`);
  r = await merchants.POST(req('http://t/x', { name: 'X', role: 'z', category: 'Nope' }, alice));
  check(r.status === 400, `bad category must 400, got ${r.status}`);
  r = await merchants.POST(
    req('http://t/x', { name: 'TestHarbor Duka', category: 'Shops & Markets', accepts: ['Lightning'], area: 'Dunga Beach', status: 'live', last_verified_payment_date: '2026-11-20', btcmap_url: 'https://btcmap.org/map#1' }, alice)
  );
  let b = await r.json();
  check(r.status === 201 && b.merchant?.id, `merchant create must 201, got ${r.status}`);
  const shop = b.merchant.id;
  created.merchants.push(shop);
  r = await merchants.PATCH(req('http://t/x', { id: shop, status: 'inactive' }, alice));
  b = await r.json();
  check(r.status === 200 && b.merchant.status === 'inactive', 'merchant PATCH must update status');
  r = await merchants.PATCH(req('http://t/x', { id: shop, status: 'live' }, alice));
  check(r.status === 200, 'merchant PATCH back to live');

  // Payouts: setup earner + verified/submitted/rejected results.
  const e = await pool.query(
    "INSERT INTO earners (name, role, payroll_tier, lightning_address) VALUES ('TestHarbor Paid', 'peer_teacher', 2, 'paid@blink.sv') RETURNING id"
  );
  const eid = e.rows[0].id;
  created.earners.push(eid);
  const mk = async (status) => {
    const v = await pool.query(
      `INSERT INTO results (earner_id, result_type, logged_by, status, verified_by)
       VALUES ($1, 'Shop signed up', 'alice', $2, CASE WHEN $2 = 'verified' THEN 'bob' ELSE NULL END) RETURNING id`,
      [eid, status]
    );
    created.results.push(v.rows[0].id);
    return v.rows[0].id;
  };
  const verifiedId = await mk('verified');
  const submittedId = await mk('submitted');
  const rejectedId = await mk('rejected');

  r = await payouts.POST(req('http://t/x', {}, null));
  check(r.status === 401, `payouts signed-out must 401, got ${r.status}`);
  r = await payouts.POST(req('http://t/x', { result_id: verifiedId }, mallory));
  check(r.status === 403, `payouts non-admin must 403, got ${r.status}`);
  const pay = (body, cookie = alice) => payouts.POST(req('http://t/x', body, cookie));
  r = await pay({ result_id: submittedId, sats_amount: 1000, kes_equivalent: 150, payment_reference: 'ref-submitted', bucket: 'runway' });
  check(r.status === 409, `submitted result must 409, got ${r.status}`);
  r = await pay({ result_id: rejectedId, sats_amount: 1000, kes_equivalent: 150, payment_reference: 'ref-rejected', bucket: 'runway' });
  check(r.status === 409, `rejected result must 409, got ${r.status}`);
  r = await pay({ result_id: verifiedId, sats_amount: 0, kes_equivalent: 150, payment_reference: 'x', bucket: 'runway' });
  check(r.status === 400, `zero sats must 400, got ${r.status}`);
  r = await pay({ result_id: verifiedId, sats_amount: 21000, kes_equivalent: 3500, payment_reference: '=cmd|calc', bucket: 'pilot_capex' });
  b = await r.json();
  check(r.status === 201 && b.payout?.id, `payout must 201, got ${r.status}`);
  check(
    b.payout.earner_id === eid && b.payout.payroll_tier_snapshot === 2 && b.payout.lightning_address_snapshot === 'paid@blink.sv',
    'payout must snapshot earner fields server-side'
  );
  created.payouts.push(b.payout.id);
  r = await pay({ result_id: verifiedId, sats_amount: 1, kes_equivalent: 1, payment_reference: 'again', bucket: 'runway' });
  check(r.status === 409, `double-pay must 409, got ${r.status}`);
  let uniqueFired = false;
  try {
    await pool.query(
      `INSERT INTO payouts (result_id, earner_id, sats_amount, kes_equivalent, payroll_tier_snapshot, payment_reference, paid_by, bucket)
       VALUES ($1, $2, 100, 10, 1, 'direct', 'alice', 'runway')`,
      [verifiedId, eid]
    );
  } catch (err) {
    uniqueFired = err && err.code === '23505';
  }
  check(uniqueFired, 'DB UNIQUE must block double-pay at the constraint level');

  // Payouts CSV: rows match, formulas neutralized, gated.
  r = await exp.GET(req('http://t/api/admin/export?type=payouts', null));
  check(r.status === 401, `payouts CSV signed-out must 401, got ${r.status}`);
  r = await exp.GET(req('http://t/api/admin/export?type=payouts', null, alice));
  b = await r.text();
  const lines = b.split('\r\n').filter(Boolean);
  check(lines[0].replace(/^\uFEFF/, '').startsWith('date,earner_name,role,'), `payouts header wrong: ${lines[0]}`);
  const row = lines.find((l) => l.includes('TestHarbor Paid'));
  check(Boolean(row) && row.includes('21000') && row.includes('pilot_capex'), `payout row missing data: ${row}`);
  check(row.includes("'=cmd|calc"), `formula reference must be neutralized: ${row}`);

  // Live metrics: shops + sats, zero PII.
  const m = await getPilotMetrics();
  check(m.source === 'live', 'metrics must be live with seeded data');
  check(m.shopsLive >= 1 && m.shopsActive30d >= 1, `shop counts wrong: live=${m.shopsLive} active=${m.shopsActive30d}`);
  check(typeof m.totalSatsPaidOut === 'number' && m.totalSatsPaidOut >= 21000, `sats paid wrong: ${m.totalSatsPaidOut}`);
  const blob = JSON.stringify(m);
  for (const secret of ['TestHarbor Paid', 'TestHarbor Duka', 'paid@blink.sv']) {
    check(!blob.includes(secret), `PII leak in metrics: ${secret}`);
  }
} finally {
  if (created.payouts.length) {
    await pool.query('DELETE FROM payouts WHERE id = ANY($1)', [created.payouts]).catch(() => {});
  }
  if (created.results.length) {
    await pool.query('DELETE FROM results WHERE id = ANY($1)', [created.results]).catch(() => {});
  }
  if (created.earners.length) {
    await pool.query('DELETE FROM earners WHERE id = ANY($1)', [created.earners]).catch(() => {});
  }
  if (created.merchants.length) {
    await pool.query('DELETE FROM merchants WHERE id = ANY($1)', [created.merchants]).catch(() => {});
  }
  await pool.end();
}

if (failures.length) {
  console.error(`MERCHANTS+PAYOUTS TEST FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('Merchants+payouts test passed: registry, no-double-pay, KRA CSV, live metrics.');
