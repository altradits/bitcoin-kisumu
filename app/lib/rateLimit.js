// Dependency-free in-memory token-bucket rate limiter for the public
// POST endpoints (contact, newsletter, rsvp).
//
// Follow-up: move to Redis-backed limiting (Upstash is already wired for
// storage in app/lib/store.js) so limits hold across serverless
// instances and process restarts. This in-memory version only limits
// per running instance.

const CAPACITY = 5; // max burst per key
const REFILL_MS = 12_000; // one token every 12s ≈ 5 requests/minute
const MAX_BUCKETS = 5000; // opportunistic prune guard

// key -> { tokens: number, updated: number }
const buckets = new Map();

function clientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim() || 'unknown';
  return req.headers.get('x-real-ip') || 'unknown';
}

function prune(now) {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [k, b] of buckets) {
    if (now - b.updated > CAPACITY * REFILL_MS) buckets.delete(k);
  }
}

export function checkRateLimit(req, key) {
  const bucketKey = `${key}:${clientIp(req)}`;
  const now = Date.now();
  let bucket = buckets.get(bucketKey);
  if (!bucket) {
    bucket = { tokens: CAPACITY, updated: now };
    buckets.set(bucketKey, bucket);
    prune(now);
  }
  const elapsed = now - bucket.updated;
  const refill = Math.floor(elapsed / REFILL_MS);
  if (refill > 0) {
    bucket.tokens = Math.min(CAPACITY, bucket.tokens + refill);
    bucket.updated += refill * REFILL_MS;
  }
  if (bucket.tokens < 1) {
    const retryAfter = Math.ceil((REFILL_MS - (now - bucket.updated)) / 1000);
    return { ok: false, retryAfter: Math.max(retryAfter, 1) };
  }
  bucket.tokens -= 1;
  return { ok: true, retryAfter: 0 };
}

export function tooManyRequests(retryAfter) {
  return new Response(JSON.stringify({ error: 'Too many requests. Please try again shortly.' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) }
  });
}
