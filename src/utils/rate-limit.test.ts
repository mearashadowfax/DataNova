import { describe, expect, it } from 'vitest';
import {
  createMemoryStore,
  createRateLimiter,
  getClientIp,
  type Bucket,
  type RateLimitStore,
} from './rate-limit';

const policy = { name: 'test', limit: 2, windowMs: 60_000 };

function clock(start = 0) {
  let t = start;
  return { now: () => t, advance: (ms: number) => (t += ms) };
}

function request(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/test', { method: 'POST', headers });
}

describe('rate limiter', () => {
  it('allows requests under the limit', async () => {
    const limiter = createRateLimiter();
    expect(await limiter.hit(policy, 'ip')).toEqual({ ok: true, remaining: 1 });
    expect(await limiter.hit(policy, 'ip')).toEqual({ ok: true, remaining: 0 });
  });

  it('blocks requests over the limit with the seconds until reset', async () => {
    const c = clock();
    const limiter = createRateLimiter(c);
    await limiter.hit(policy, 'ip');
    await limiter.hit(policy, 'ip');
    c.advance(10_000);
    expect(await limiter.hit(policy, 'ip')).toEqual({
      ok: false,
      retryAfterSec: 50,
    });
  });

  it('starts a fresh window once the previous one expires', async () => {
    const c = clock();
    const limiter = createRateLimiter(c);
    await limiter.hit(policy, 'ip');
    await limiter.hit(policy, 'ip');
    c.advance(policy.windowMs);
    expect((await limiter.hit(policy, 'ip')).ok).toBe(true);
  });

  it('keeps separate buckets per policy name and per key', async () => {
    const limiter = createRateLimiter();
    await limiter.hit(policy, 'ip');
    await limiter.hit(policy, 'ip');
    expect((await limiter.hit({ ...policy, name: 'other' }, 'ip')).ok).toBe(
      true
    );
    expect((await limiter.hit(policy, 'other-ip')).ok).toBe(true);
  });

  it('works with an async store adapter', async () => {
    const backing = new Map<string, Bucket>();
    const store: RateLimitStore = {
      get: async key => backing.get(key),
      set: async (key, bucket) => {
        backing.set(key, bucket);
      },
      prune: async () => {},
    };
    const limiter = createRateLimiter({ store });
    await limiter.hit(policy, 'ip');
    await limiter.hit(policy, 'ip');
    expect((await limiter.hit(policy, 'ip')).ok).toBe(false);
    expect(backing.size).toBe(1);
  });

  it('prunes expired buckets once the memory store grows large', async () => {
    const c = clock();
    const store = createMemoryStore();
    const limiter = createRateLimiter({ store, now: c.now });
    for (let i = 0; i < 1000; i++) await limiter.hit(policy, `ip-${i}`);
    c.advance(policy.windowMs);
    await limiter.hit(policy, 'fresh');
    expect(await store.get('test:ip-0')).toBeUndefined();
    expect(await store.get('test:fresh')).toBeDefined();
  });

  it('enforce() resolves to null while under the limit', async () => {
    const limiter = createRateLimiter();
    expect(await limiter.enforce(policy, request())).toBeNull();
  });

  it('enforce() resolves to a 429 with Retry-After once over the limit', async () => {
    const limiter = createRateLimiter(clock());
    const req = request({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' });
    await limiter.enforce(policy, req);
    await limiter.enforce(policy, req);

    const response = await limiter.enforce(policy, req);
    expect(response?.status).toBe(429);
    expect(response?.headers.get('Retry-After')).toBe('60');
    await expect(response?.json()).resolves.toMatchObject({
      ok: false,
      retryAfterSec: 60,
    });
  });
});

describe('getClientIp', () => {
  it('takes the first x-forwarded-for hop', () => {
    expect(
      getClientIp(request({ 'x-forwarded-for': ' 1.1.1.1 , 2.2.2.2' }))
    ).toBe('1.1.1.1');
  });

  it('falls back to x-real-ip, then "unknown"', () => {
    expect(getClientIp(request({ 'x-real-ip': '3.3.3.3' }))).toBe('3.3.3.3');
    expect(getClientIp(request())).toBe('unknown');
  });
});
