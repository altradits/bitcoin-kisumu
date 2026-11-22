// Rate limiting for the public POST endpoints (contact, newsletter, rsvp).
//
// Two backends, one contract (5 requests/minute per key+IP):
// - Redis (production): atomic INCR + EXPIRE counters in aligned 60s windows,
//   shared across serverless instances and surviving cold starts.
// - Memory (local dev, zero credentials): per-instance token bucket.
// A Redis hiccup fails open to the memory limiter so the forms never die
// with the cache.

const LIMIT = 5;
const WINDOW_SECONDS = 60;

// --- memory fallback (local dev) ---
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

function checkMemory(req, key) {
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

function redisConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function redisClient() {
  const { Redis } = await import('@upstash/redis');
  return Redis.fromEnv();
}

async function checkRedis(req, key) {
  const windowId = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  const bucketKey = `bk:rl:${key}:${clientIp(req)}:${windowId}`;
  const redis = await redisClient();
  const count = await redis.incr(bucketKey);
  if (count === 1) await redis.expire(bucketKey, WINDOW_SECONDS * 2);
  if (count > LIMIT) {
    const ttl = await redis.ttl(bucketKey);
    return { ok: false, retryAfter: ttl > 0 ? ttl : WINDOW_SECONDS };
  }
  return { ok: true, retryAfter: 0 };
}

export async function checkRateLimit(req, key) {
  if (!redisConfigured()) return checkMemory(req, key);
  try {
    return await checkRedis(req, key);
  } catch {
    return checkMemory(req, key);
  }
}

export function tooManyRequests(retryAfter) {
  return new Response(JSON.stringify({ error: 'Too many requests. Please try again shortly.' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) }
  });
}
