// RSVP atomicity test: exercises the REAL route + store (file backend) with
// concurrent bursts. Asserts capacity is never exceeded, duplicates are
// rejected atomically, statuses/shapes hold, and validation still works.
//
// Usage: npm run test:rsvp
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { register } from 'node:module';

// Isolate: sandbox data dir + force the file backend even if Redis env exists.
process.chdir(mkdtempSync(path.join(tmpdir(), 'bk-rsvp-')));
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

register('./test-shim-loader.mjs', import.meta.url);
const { POST, GET } = await import(new URL('../app/api/rsvp/route.js', import.meta.url).href);
const { events } = await import(new URL('../app/lib/site.js', import.meta.url).href);

const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
};

// Distinct IP per request: isolates the atomicity test from rate limiting.
const req = (body, ip) => ({
  url: 'http://test/api/rsvp',
  headers: { get: (k) => (String(k).toLowerCase() === 'x-forwarded-for' ? ip : null) },
  json: async () => body
});

// Phase A — duplicate storm on a non-full event (workshop-wallet, cap 30).
const small = events.find((e) => e.id === 'workshop-wallet');
const first = await POST(req({ eventId: small.id, name: 'First', contact: 'first@example.com' }, '10.0.0.1'));
check(first.status === 201, `first booking should 201, got ${first.status}`);
const dupBurst = await Promise.all(
  Array.from({ length: 10 }, (_, i) =>
    POST(req({ eventId: small.id, name: 'Dup', contact: 'FIRST@example.com' }, `10.0.1.${i + 1}`))
  )
);
for (const r of dupBurst) {
  const b = await r.json();
  check(r.status === 409 && b.duplicate === true, `dup storm: expected 409+duplicate flag, got ${r.status} ${JSON.stringify(b).slice(0, 100)}`);
}
const smallCount = await (await GET({ url: `http://test/api/rsvp?eventId=${small.id}` })).json();
check(smallCount.count === 1, `dup storm must leave count at 1, got ${smallCount.count}`);

// Phase B — 2x capacity burst of unique contacts (meetup-001, cap 60).
const big = events.find((e) => e.id === 'meetup-001');
const burst = await Promise.all(
  Array.from({ length: big.capacity * 2 }, (_, i) =>
    POST(
      req({ eventId: big.id, name: `User ${i}`, contact: `user${i}@example.com` }, `10.0.${(i >> 8) + 2}.${(i % 250) + 1}`)
    )
  )
);
let ok = 0;
let full = 0;
let shapesOk = true;
for (const r of burst) {
  const b = await r.json();
  if (r.status === 201) {
    ok += 1;
    if (!(b.ok === true && typeof b.rsvp?.name === 'string' && typeof b.count === 'number')) shapesOk = false;
  } else if (r.status === 409) {
    full += 1;
  } else {
    failures.push(`burst: unexpected status ${r.status} ${JSON.stringify(b).slice(0, 120)}`);
  }
}
check(ok === big.capacity, `expected ${big.capacity} successes, got ${ok}`);
check(full === big.capacity, `expected ${big.capacity} full-rejections, got ${full}`);
check(shapesOk, 'success JSON shape broken (ok/rsvp/count)');
const bigCount = await (await GET({ url: `http://test/api/rsvp?eventId=${big.id}` })).json();
check(bigCount.count === big.capacity, `GET count ${bigCount.count} !== capacity ${big.capacity}`);

// Phase C — validation intact.
const badEvent = await POST(req({ eventId: 'nope', name: 'Xx', contact: 'x@y.zz' }, '10.9.9.1'));
check(badEvent.status === 400, 'unknown event should 400');
const shortName = await POST(req({ eventId: big.id, name: 'X', contact: 'x@y.zz' }, '10.9.9.2'));
check(shortName.status === 400, 'short name should 400');

if (failures.length) {
  console.error(`RSVP CONCURRENCY TEST FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log(`RSVP concurrency test passed: ${ok}/${big.capacity * 2} booked, dups + overflow all 409, counts exact.`);
