// One-command test runner: runs every suite and prints a crisp summary.
// Postgres-backed suites self-skip green when DATABASE_URL is unset, and
// run for real (locally or in CI) when it is set.
//
// Usage: npm test
import { execFileSync } from 'node:child_process';

const SUITES = [
  'test:rsvp',
  'test:ratelimit',
  'test:admin',
  'test:forms',
  'test:verify',
  'test:db',
  'test:earners',
  'test:results',
  'test:export',
  'test:pilot',
  'test:merchants-payouts',
  'test:inflows',
  'test:metrics',
  'test:smoke'
];

if (!process.env.DATABASE_URL) {
  console.log('DATABASE_URL unset: DB suites will self-skip.\n');
}
const results = [];
for (const s of SUITES) {
  try {
    const out = execFileSync('npm', ['run', '--silent', s], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    const lines = out.split('\n');
    const passLine = lines.find((l) => /passed/.test(l));
    const skipLine = lines.find((l) => /SKIP/.test(l));
    if (passLine) {
      results.push({ s, ok: true, skipped: false, line: passLine.trim() });
      console.log(`PASS ${s}: ${passLine.trim()}`);
    } else {
      const line = (skipLine || 'done').trim();
      results.push({ s, ok: true, skipped: true, line });
      console.log(`SKIP ${s}: ${line}`);
    }
  } catch (err) {
    const detail = String((err && err.stdout) || err.message || err)
      .split('\n')
      .filter(Boolean)
      .slice(-3)
      .join(' | ');
    results.push({ s, ok: false, skipped: false, line: detail });
    console.log(`FAIL ${s}: ${detail}`);
  }
}
const passed = results.filter((r) => r.ok && !r.skipped).length;
const skipped = results.filter((r) => r.skipped).length;
const failed = results.filter((r) => !r.ok);
console.log(`\n${passed} passed, ${skipped} skipped, ${failed.length} failed (${results.length} suites).`);
if (failed.length) {
  console.log('Failed:', failed.map((r) => r.s).join(', '));
  process.exit(1);
}
