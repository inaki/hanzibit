// In-memory sliding window rate limiter.
// Works per-process — suitable for single-instance deploys.
// For multi-instance production, replace with Redis (Upstash Ratelimit).
const store = new Map<string, { count: number; resetAt: number }>();

/**
 * Returns true if the request is allowed, false if the limit is exceeded.
 * @param key    Unique key per user+action (e.g. "gloss:user-123")
 * @param max    Maximum requests allowed in the window
 * @param windowMs  Window duration in milliseconds
 */
export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count++;
  return true;
}
