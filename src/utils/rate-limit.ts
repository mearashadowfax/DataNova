import { apiError } from './api-error';

/**
 * Per-IP rate limiting, declared as a policy and enforced against a Request.
 *
 * A route says *that* it is limited and by how much; this module owns key
 * derivation (policy name + client IP), the 429 response with its
 * `Retry-After` header, window rollover and pruning of expired buckets.
 *
 * Buckets live behind the `RateLimitStore` seam. The in-memory adapter is
 * per server instance; to share limits across instances, pass a store backed
 * by KV or Redis to `createRateLimiter`.
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
  hit(policy: RateLimitPolicy, key: string): Promise<RateLimitResult>;
  /** Resolves to a 429 Response when `request`'s client is over `policy`, else `null`. */
  enforce(policy: RateLimitPolicy, request: Request): Promise<Response | null>;
}

export interface Bucket {
  count: number;
  /** Epoch milliseconds at which the bucket's window ends. */
  resetAt: number;
}

/** Where buckets live. Methods may be sync or async so a KV adapter fits. */
export interface RateLimitStore {
  get(key: string): Bucket | undefined | Promise<Bucket | undefined>;
  set(key: string, bucket: Bucket): void | Promise<void>;
  /** Drop every bucket whose window ended before `now`. */
  prune(now: number): void | Promise<void>;
}

const PRUNE_THRESHOLD = 1000;

/** The default store: a Map, pruned once it holds more than a thousand buckets. */
export function createMemoryStore(): RateLimitStore {
  const buckets = new Map<string, Bucket>();
  return {
    get: key => buckets.get(key),
    set: (key, bucket) => {
      buckets.set(key, bucket);
    },
    prune: now => {
      if (buckets.size < PRUNE_THRESHOLD) return;
      for (const [key, bucket] of buckets) {
        if (now >= bucket.resetAt) buckets.delete(key);
      }
    },
  };
}

/**
 * A rate limiter over a store and a clock. Both default to production values;
 * tests pass a fresh store for isolation and a fake clock to move time.
 */
export function createRateLimiter({
  store = createMemoryStore(),
  now = () => Date.now(),
}: { store?: RateLimitStore; now?: () => number } = {}): RateLimiter {
  async function hit(
    policy: RateLimitPolicy,
    key: string
  ): Promise<RateLimitResult> {
    const at = now();
    await store.prune(at);

    const bucketKey = `${policy.name}:${key}`;
    const bucket = await store.get(bucketKey);

    if (!bucket || at >= bucket.resetAt) {
      await store.set(bucketKey, { count: 1, resetAt: at + policy.windowMs });
      return { ok: true, remaining: policy.limit - 1 };
    }

    if (bucket.count >= policy.limit) {
      return {
        ok: false,
        retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - at) / 1000)),
      };
    }

    bucket.count += 1;
    await store.set(bucketKey, bucket);
    return { ok: true, remaining: policy.limit - bucket.count };
  }

  async function enforce(
    policy: RateLimitPolicy,
    request: Request
  ): Promise<Response | null> {
    const result = await hit(policy, getClientIp(request));
    if (result.ok) return null;

    return apiError(
      'Too many requests. Please try again later.',
      429,
      { retryAfterSec: result.retryAfterSec },
      { 'Retry-After': String(result.retryAfterSec) }
    );
  }

  return { hit, enforce };
}

/** The client's IP as seen through the platform's proxy headers, or `'unknown'`. */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/** The app-wide limiter shared by every route. */
export const rateLimiter: RateLimiter = createRateLimiter();
