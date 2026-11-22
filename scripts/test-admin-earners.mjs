// Earners integration test: real routes + real Postgres. Covers gating,
// validation, edit/deactivate (history kept) and audit_log writes.
// Needs DATABASE_URL (CI service or local Docker); otherwise skips green.
//
// Usage: npm run test:earners
import { register } from 'node:module';

if (!process.env.DATABASE_URL) {
  console.log('SKIP test:earners: DATABASE_URL unset (no local Postgres).');
  process.exit(0);
}

register('./test-shim-loader.mjs', import.meta.url);
const lib = await import(new URL('../app/lib/adminAuth.js', import.meta.url).href);
const route = await import(new URL('../app/api/admin/earners/route.js', import.meta.url).href);
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
  url: 'http://test/api/admin/earners',
  headers: { get: (k) => (String(k).toLowerCase() === 'cookie' ? cookie || null : null) },
  json: async () => body
});
const adminCookie = `bk_admin=${lib.signSession('alice')}`;
const malloryCookie = `bk_admin=${lib.signSession('mallory')}`;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const created = [];
try {
  // Gating: 401 signed-out, 403 non-admin.
  let r = await route.GET(req(null, null));
  check(r.status === 401, `GET signed-out must 401, got ${r.status}`);
  r = await route.POST(req({}, `bk_admin=${lib.signSession('mallory')}`));
  check(r.status === 403, `POST non-admin must 403, got ${r.status}`);

  // 503 without DATABASE_URL (restore right after).
  const savedDb = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  r = await route.GET(req(null, adminCookie));
  check(r.status === 503, `GET without DATABASE_URL must 503, got ${r.status}`);
  process.env.DATABASE_URL = savedDb;

  // Validation errors.
  const bad = [
    [{ name: 'X', role: 'peer_teacher' }, 'short name'],
    [{ name: 'TestHarbor One', role: 'astronaut' }, 'bad role'],
    [{ name: 'TestHarbor One', role: 'peer_teacher', lightning_address: 'not-an-address' }, 'bad ln'],
    [{ name: 'TestHarbor One', role: 'peer_teacher', payroll_tier: 5 }, 'bad tier'],
    [{ name: 'TestHarbor One', role: 'peer_teacher', phone: '0711', consent_date: '' }, 'phone without consent']
  ];
  for (const [body, label] of bad) {
    r = await route.POST(req(body, adminCookie));
    check(r.status === 400, `${label} must 400, got ${r.status}`);
  }

  // Create → list → edit → deactivate (history kept).
  r = await route.POST(
    req(
      {
        name: 'TestHarbor One',
        role: 'peer_teacher',
        lightning_address: 'testharbor@blink.sv',
        payroll_tier: 2,
        ward_area: 'Dunga',
        phone: '0711000000',
        consent_date: '2026-11-01'
      },
      adminCookie
    )
  );
  let b = await r.json();
  check(r.status === 201 && b.earner?.id, `create must 201 with earner, got ${r.status}`);
  const id = b.earner.id;
  created.push(id);

  r = await route.GET(req(null, adminCookie));
  b = await r.json();
  check(r.status === 200 && b.earners.some((e) => e.id === id), 'GET must list the new earner');

  r = await route.PATCH(req({ id, ward_area: 'Kisumu CBD' }, adminCookie));
  b = await r.json();
  check(r.status === 200 && b.earner.ward_area === 'Kisumu CBD', 'PATCH must edit');

  r = await route.PATCH(req({ id, active: false }, adminCookie));
  b = await r.json();
  check(r.status === 200 && b.earner.active === false, 'PATCH must deactivate');
  r = await route.GET(req(null, adminCookie));
  b = await r.json();
  check(b.earners.some((e) => e.id === id), 'deactivated earner keeps history (still listed)');

  // Audit trail written for create/edit/deactivate.
  const audit = await pool.query(
    "SELECT action FROM audit_log WHERE entity = 'earners' AND entity_id = $1 ORDER BY id",
    [id]
  );
  const actions = audit.rows.map((x) => x.action);
  check(
    actions.join(',') === 'earner.create,earner.edit,earner.deactivate',
    `audit actions wrong: ${actions.join(',')}`
  );
} finally {
  for (const id of created) {
    await pool.query('DELETE FROM earners WHERE id = $1', [id]).catch(() => {});
  }
  await pool.end();
}

if (failures.length) {
  console.error(`EARNERS TEST FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('Earners test passed: gating, validation, edit/deactivate, audit trail.');
