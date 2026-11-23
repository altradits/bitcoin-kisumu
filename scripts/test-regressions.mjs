// Audit regression tests: pg DATE formatting under Africa/Nairobi time,
// no-store headers on admin surfaces, and graceful /api/events fallback
// when storage throws. No database needed.
//
// Usage: npm run test:regressions
import { execFileSync, execSync } from 'node:child_process';
import { mkdtempSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { register } from 'node:module';

register('./test-shim-loader.mjs', import.meta.url);

const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
};

// 1. fmtPgDate preserves the local calendar day under Africa/Nairobi (UTC+3),
// where .toISOString().slice(0, 10) would slip back a day near midnight.
const dbUrl = new URL('../app/lib/db.js', import.meta.url).href;
const tzOut = execFileSync(
  process.execPath,
  [
    '--input-type=module',
    '-e',
    "import(process.argv[1]).then((db) => {" +
      "const d = new Date(2026, 10, 23); console.log(db.fmtPgDate(d) + '|' + d.toISOString().slice(0, 10)); })",
    dbUrl
  ],
  { encoding: 'utf8', env: { ...process.env, TZ: 'Africa/Nairobi' } }
).trim();
const [fmt, iso] = tzOut.split('|');
check(fmt === '2026-11-23', `fmtPgDate must keep local day, got ${fmt}`);
check(iso === '2026-11-22', `sanity: UTC slice must differ here, got ${iso}`);

// 2. Admin no-store headers present; global + NIP-05 rules intact.
const require = createRequire(path.join(process.cwd(), 'package.json'));
const config = require(path.join(process.cwd(), 'next.config.js'));
const rules = await config.headers();
const find = (source) => rules.find((r) => r.source === source);
const hasNoStore = (rule) =>
  rule && rule.headers.some((h) => h.key === 'Cache-Control' && h.value === 'private, no-store');
check(hasNoStore(find('/admin/:path*')), 'admin pages must send private, no-store');
check(hasNoStore(find('/api/admin/:path*')), 'admin APIs must send private, no-store');
const global = find('/:path*');
check(Boolean(global && global.headers.some((h) => h.key === 'Content-Security-Policy')), 'global CSP must survive');
const nostr = find('/.well-known/nostr.json');
check(
  Boolean(nostr && nostr.headers.some((h) => h.key === 'Access-Control-Allow-Origin' && h.value === '*')),
  'NIP-05 CORS must survive'
);

// 3. /api/events degrades gracefully when storage throws.
const route = await import(new URL('../app/api/events/route.js', import.meta.url).href);
const sandbox = mkdtempSync(path.join(tmpdir(), 'bk-events-ro-'));
const prevCwd = process.cwd();
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;
delete process.env.KV_REST_API_URL;
delete process.env.KV_REST_API_TOKEN;
delete process.env.VERCEL;
process.chdir(sandbox);
chmodSync(sandbox, 0o555);
try {
  const r = await route.GET();
  const b = await r.json();
  check(r.status === 200, `events fallback must 200, got ${r.status}`);
  check(Array.isArray(b.events) && b.events.length > 0, 'events fallback must list events');
  check(b.events.every((e) => e.reserved === 0), 'events fallback must zero the counts');
} finally {
  process.chdir(prevCwd);
  chmodSync(sandbox, 0o755);
}
execSync(`rm -rf ${sandbox}`);

if (failures.length) {
  console.error(`REGRESSION TEST FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('Regression test passed: Nairobi dates, admin no-store, events fallback.');
