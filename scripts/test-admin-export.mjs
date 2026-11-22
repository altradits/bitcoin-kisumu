// Export integration test: real route + real Postgres. Covers gating,
// verified-only rows, role/date filters, formula-injection escaping,
// weekly aggregates, and download headers. Needs DATABASE_URL;
// otherwise skips green.
//
// Usage: npm run test:export
import { register } from 'node:module';

if (!process.env.DATABASE_URL) {
  console.log('SKIP test:export: DATABASE_URL unset (no local Postgres).');
  process.exit(0);
}

register('./test-shim-loader.mjs', import.meta.url);
const lib = await import(new URL('../app/lib/adminAuth.js', import.meta.url).href);
const route = await import(new URL('../app/api/admin/export/route.js', import.meta.url).href);
const { Pool } = await import('pg');

process.env.GITHUB_CLIENT_ID = 'test-client';
process.env.GITHUB_CLIENT_SECRET = 'test-secret';
process.env.AUTH_SECRET = 'test-auth-secret-that-is-long-enough';
process.env.ADMIN_GITHUB_LOGINS = 'alice';

const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
};
const req = (url, cookie) => ({
  url,
  headers: { get: (k) => (String(k).toLowerCase() === 'cookie' ? cookie || null : null) },
  json: async () => ({})
});
const admin = `bk_admin=${lib.signSession('alice')}`;
const mallory = `bk_admin=${lib.signSession('mallory')}`;

// Minimal RFC-4180 reader for assertions (handles quoted cells + "" escapes).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const s = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (c !== '\r') {
      cell += c;
    }
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const createdEarners = [];
const createdResults = [];
try {
  // Gating + validation.
  let r = await route.GET(req('http://t/api/admin/export?type=results', null));
  check(r.status === 401, `signed-out must 401, got ${r.status}`);
  r = await route.GET(req('http://t/api/admin/export?type=results', mallory));
  check(r.status === 403, `non-admin must 403, got ${r.status}`);
  r = await route.GET(req('http://t/api/admin/export?type=nope', admin));
  check(r.status === 400, `bad type must 400, got ${r.status}`);
  r = await route.GET(req('http://t/api/admin/export?type=results&role=nope', admin));
  check(r.status === 400, `bad role must 400, got ${r.status}`);
  r = await route.GET(req('http://t/api/admin/export?type=results&from=2026-13-99', admin));
  check(r.status === 400, `bad date must 400, got ${r.status}`);

  // Seed: teacher (verified ×1 with hostile evidence + comma name), teller
  // (verified ×1), plus submitted + rejected rows that must stay out.
  const t = await pool.query(
    "INSERT INTO earners (name, role, lightning_address, payroll_tier) VALUES ('TestHarbor, Ann', 'peer_teacher', 'ann@blink.sv', 2) RETURNING id"
  );
  const s = await pool.query(
    "INSERT INTO earners (name, role) VALUES ('TestHarbor Bob', 'storyteller') RETURNING id"
  );
  const teacher = t.rows[0].id;
  const teller = s.rows[0].id;
  createdEarners.push(teacher, teller);
  const seed = async (earner, type, status, evidence, date) => {
    const v = await pool.query(
      `INSERT INTO results (earner_id, result_type, result_date, evidence, status, logged_by, verified_by, verified_at)
       VALUES ($1, $2, $3, $4, $5, 'alice', CASE WHEN $5 = 'submitted' THEN NULL ELSE 'bob' END, CASE WHEN $5 = 'submitted' THEN NULL ELSE now() END)
       RETURNING id`,
      [earner, type, date, evidence, status]
    );
    createdResults.push(v.rows[0].id);
  };
  await seed(teacher, 'Learner finished course', 'verified', '=cmd|"/c calc"!A1', '2026-11-10');
  await seed(teller, 'Post published', 'verified', 'https://example.com/post', '2026-11-11');
  await seed(teacher, 'Draft result', 'submitted', '', '2026-11-12');
  await seed(teacher, 'Bad result', 'rejected', '', '2026-11-12');

  // Results CSV: verified only, escaped, downloadable.
  r = await route.GET(req('http://t/api/admin/export?type=results', admin));
  check(r.status === 200, `export must 200, got ${r.status}`);
  check(
    String(r.headers.get('content-type') || '').startsWith('text/csv'),
    `content-type must be text/csv, got ${r.headers.get('content-type')}`
  );
  check(
    String(r.headers.get('content-disposition') || '').includes('attachment'),
    'must download as attachment'
  );
  // Raw bytes: .text() strips a leading BOM per the encoding spec (in
  // production too), but download clients read bytes, where it must exist.
  const raw = Buffer.from(await r.arrayBuffer());
  check(raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf, 'must start with UTF-8 BOM for Excel');
  const csv = raw.toString('utf8');
  const rows = parseCsv(csv);
  check(rows.length === 3, `expected header + 2 verified rows, got ${rows.length}`);
  check(rows[0][0] === 'date' && rows[0][9] === 'verified_at', `header wrong: ${rows[0]}`);
  const ann = rows.find((x) => x[1] === 'TestHarbor, Ann');
  check(Boolean(ann), 'comma name must survive quoting');
  check(ann && ann[6] === "'=cmd|\"/c calc\"!A1", `formula cell must be neutralized, got ${ann && ann[6]}`);
  check(!rows.some((x) => x[5] === 'Draft result' || x[5] === 'Bad result'), 'submitted/rejected must stay out');

  // Filters.
  r = await route.GET(req('http://t/api/admin/export?type=results&role=storyteller', admin));
  const roleRows = parseCsv(await r.text());
  check(roleRows.length === 2 && roleRows[1][2] === 'storyteller', 'role filter must narrow');
  r = await route.GET(req('http://t/api/admin/export?type=results&from=2026-11-11&to=2026-11-11', admin));
  const dateRows = parseCsv(await r.text());
  check(dateRows.length === 2 && dateRows[1][0] === '2026-11-11', 'date filter must narrow');

  // Weekly aggregates.
  r = await route.GET(req('http://t/api/admin/export?type=weekly', admin));
  const weekly = parseCsv(await r.text());
  check(weekly[0].join(',') === 'week,role,verified_results,active_earners,shops_live,shops_active_30d', `weekly header wrong: ${weekly[0]}`);
  const teacherWeek = weekly.find((x) => x[1] === 'peer_teacher');
  check(
    Boolean(teacherWeek) && teacherWeek[2] === '1' && teacherWeek[3] === '1',
    `weekly aggregate wrong: ${JSON.stringify(weekly)}`
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
  console.error(`EXPORT TEST FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('Export test passed: gating, filters, escaping, weekly aggregates, headers.');
