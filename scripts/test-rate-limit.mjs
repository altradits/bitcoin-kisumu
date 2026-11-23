// Rate limiter test: a burst of N requests hits the limit with a Retry-After,
// while other IPs and keys stay unaffected. Forces the memory path by
// clearing Upstash env (the Redis path shares the same 5/min contract).
//
// Usage: npm run test:ratelimit
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

const { checkRateLimit } = await import(new URL('../app/lib/rateLimit.js', import.meta.url).href);

const req = (ip) => ({
  headers: { get: (k) => (String(k).toLowerCase() === 'x-forwarded-for' ? ip : null) }
});

const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
};

const results = [];
for (let i = 0; i < 8; i++) {
  results.push(await checkRateLimit(req('10.9.8.1'), 'contact'));
}
const allowed = results.filter((r) => r.ok).length;
const limited = results.filter((r) => !r.ok);
check(allowed === 5, `burst of 8 should allow 5, allowed ${allowed}`);
check(limited.length === 3, `burst of 8 should limit 3, limited ${limited.length}`);
check(
  limited.every((r) => Number.isInteger(r.retryAfter) && r.retryAfter >= 1 && r.retryAfter <= 60),
  `limited responses need Retry-After 1..60, got ${JSON.stringify(limited)}`
);

const otherIp = await checkRateLimit(req('10.9.8.2'), 'contact');
check(otherIp.ok === true, 'a different IP must be unaffected');
const otherKey = await checkRateLimit(req('10.9.8.1'), 'newsletter');
check(otherKey.ok === true, 'a different key must be unaffected');

// KV fallback: unreachable Redis fails open to memory (still limits).
process.env.KV_REST_API_URL = 'http://127.0.0.1:9';
process.env.KV_REST_API_TOKEN = 'test';
const kvBurst = [];
for (let i = 0; i < 6; i++) kvBurst.push(await checkRateLimit(req('10.9.8.9'), 'contact'));
check(kvBurst.filter((r) => r.ok).length === 5, 'KV fail-open must still limit after 5');
delete process.env.KV_REST_API_URL;
delete process.env.KV_REST_API_TOKEN;

if (failures.length) {
  console.error(`RATE LIMIT TEST FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('Rate limit test passed: 5 allowed, 3 limited with Retry-After, neighbours unaffected.');
