// Results integration test: real routes + real Postgres. Covers gating,
// logging (logged_by forced from session), self-decision block at the API,
// second-admin verify/reject, re-decision conflict, and the audit trail.
// Needs DATABASE_URL (CI service or local Docker); otherwise skips green.
//
// Usage: npm run test:results
import { register } from 'node:module';

if (!process.env.DATABASE_URL) {
  console.log('SKIP test:results: DATABASE_URL unset (no local Postgres).');
  process.exit(0);
}

register('./test-shim-loader.mjs', import.meta.url);
const lib = await import(new URL('../app/lib/adminAuth.js', import.meta.url).href);
const route = await import(new URL('../app/api/admin/results/route.js', import.meta.url).href);
const { Pool } = await import('pg');

process.env.GITHUB_CLIENT_ID = 'test-client';
process.env.GITHUB_CLIENT_SECRET = 'test-secret';
process.env.AUTH_SECRET = 'test-auth-secret-that-is-long-enough';
process.env.ADMIN_GITHUB_LOGINS = 'alice,bob';

const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
};
const req = (body, cookie) => ({
  url: 'http://test/api/admin/results',
  headers: { get: (k) => (String(k).toLowerCase() === 'cookie' ? cookie || null : null) },
  json: async () => body
});
const alice = `bk_admin=${lib.signSession('alice')}`;
const bob = `bk_admin=${lib.signSession('bob')}`;
const mallory = `bk_admin=${lib.signSession('mallory')}`;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const createdEarners = [];
const createdResults = [];
try {
  // Gating.
  let r = await route.GET(req(null, null));
  check(r.status === 401, `GET signed-out must 401, got ${r.status}`);
  r = await route.POST(req({}, mallory));
  check(r.status === 403, `POST non-admin must 403, got ${r.status}`);

  // Setup: one active + one inactive earner, direct SQL.
  const a = await pool.query(
    "INSERT INTO earners (name, role) VALUES ('TestHarbor Active', 'peer_teacher') RETURNING id"
  );
  const activeId = a.rows[0].id;
  createdEarners.push(activeId);
  const d = await pool.query(
    "INSERT INTO earners (name, role, active) VALUES ('TestHarbor Gone', 'storyteller', false) RETURNING id"
  );
  createdEarners.push(d.rows[0].id);

  // Logging: server forces logged_by from the session.
  r = await route.POST(
    req({ earner_id: activeId, result_type: 'Shop signed up', evidence: 'photo-1', logged_by: 'mallory' }, alice)
  );
  let b = await r.json();
  check(r.status === 201 && b.result?.logged_by === 'alice', `log must 201 as alice, got ${r.status} ${JSON.stringify(b).slice(0, 120)}`);
  const rid = b.result.id;
  createdResults.push(rid);
  r = await route.POST(req({ earner_id: d.rows[0].id, result_type: 'Xx', evidence: '' }, alice));
  check(r.status === 400, `inactive earner must 400, got ${r.status}`);
  r = await route.POST(req({ earner_id: '00000000-0000-0000-0000-000000000000', result_type: 'Xx' }, alice));
  check(r.status === 400, `unknown earner must 400, got ${r.status}`);

  // Self-decision blocked; second admin succeeds.
  r = await route.PATCH(req({ id: rid, action: 'verify' }, alice));
  check(r.status === 403, `self-verify must 403, got ${r.status}`);
  r = await route.PATCH(req({ id: rid, action: 'verify' }, bob));
  b = await r.json();
  check(r.status === 200 && b.result.status === 'verified' && b.result.verified_by === 'bob', 'bob verify must succeed');
  r = await route.PATCH(req({ id: rid, action: 'verify' }, bob));
  check(r.status === 409, `re-decide must 409, got ${r.status}`);

  // Reject needs a reason; self-reject blocked too (DB CHECK agrees).
  r = await route.POST(req({ earner_id: activeId, result_type: 'Post published' }, alice));
  b = await r.json();
  const rid2 = b.result.id;
  createdResults.push(rid2);
  r = await route.PATCH(req({ id: rid2, action: 'reject' }, bob));
  check(r.status === 400, `reject without reason must 400, got ${r.status}`);
  r = await route.PATCH(req({ id: rid2, action: 'reject', rejection_reason: 'blurry' }, alice));
  check(r.status === 403, `self-reject must 403, got ${r.status}`);
  r = await route.PATCH(req({ id: rid2, action: 'reject', rejection_reason: 'No evidence attached.' }, bob));
  b = await r.json();
  check(r.status === 200 && b.result.status === 'rejected', 'bob reject must succeed');

  // Audit trail for log/verify/reject.
  const audit = await pool.query(
    "SELECT action FROM audit_log WHERE entity = 'results' AND entity_id = ANY($1) ORDER BY id",
    [createdResults]
  );
  const actions = audit.rows.map((x) => x.action).sort().join(',');
  check(
    actions === 'result.log,result.log,result.reject,result.verify',
    `audit actions wrong: ${actions}`
  );
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
  console.error(`RESULTS TEST FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('Results test passed: logging, two-person rule, reject flow, audit trail.');
