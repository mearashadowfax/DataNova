/**
 * Per-IP rate limiting, declared as a policy and enforced against a Request.
 *
 * A route says *that* it is limited and by how much; this module owns key
 * derivation (policy name + client IP), the 429 response with its
 * `Retry-After` header, window rollover and pruning of expired buckets.
 *
 * Buckets live in memory, so limits are per server instance. To share limits
 * across instances, replace `createRateLimiter` with one backed by a KV store.
 */

export interface RateLimitPolicy {
  /** Namespaces the bucket so two policies never share a counter. */
  name: string;
  limit: number;
  windowMs: number;
}

export type RateLimitResult =
  { ok: true; remaining: number } | { ok: false; retryAfterSec: number };

export interface RateLimiter {
  /** Count one hit for `key` under `policy`. */
  hit(policy: RateLimitPolicy, key: string): RateLimitResult;
  /** Returns a 429 Response when `request`'s client is over `policy`, else `null`. */
  enforce(policy: RateLimitPolicy, request: Request): Response | null;
}

type Bucket = { count: number; resetAt: number };

const PRUNE_THRESHOLD = 1000;

export function createRateLimiter({
  now = () => Date.now(),
}: { now?: () => number } = {}): RateLimiter {
  const buckets = new Map<string, Bucket>();

  function prune(at: number) {
    if (buckets.size < PRUNE_THRESHOLD) return;
    for (const [key, bucket] of buckets) {
      if (at >= bucket.resetAt) buckets.delete(key);
    }
  }

  function hit(policy: RateLimitPolicy, key: string): RateLimitResult {
    const at = now();
    prune(at);

    const bucketKey = `${policy.name}:${key}`;
    const bucket = buckets.get(bucketKey);

    if (!bucket || at >= bucket.resetAt) {
      buckets.set(bucketKey, { count: 1, resetAt: at + policy.windowMs });
      return { ok: true, remaining: policy.limit - 1 };
    }

    if (bucket.count >= policy.limit) {
      return {
        ok: false,
        retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - at) / 1000)),
      };
    }

    bucket.count += 1;
    return { ok: true, remaining: policy.limit - bucket.count };
  }

  function enforce(policy: RateLimitPolicy, request: Request): Response | null {
    const result = hit(policy, getClientIp(request));
    if (result.ok) return null;

    return Response.json(
      {
        ok: false,
        error: 'Too many requests. Please try again later.',
        retryAfterSec: result.retryAfterSec,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(result.retryAfterSec) },
      }
    );
  }

  return { hit, enforce };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/** The app-wide limiter shared by every route. */
export const rateLimiter: RateLimiter = createRateLimiter();
