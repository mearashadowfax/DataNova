import { describe, expect, it } from 'vitest';
import { createRateLimiter, getClientIp } from './rate-limit';

const policy = { name: 'test', limit: 2, windowMs: 60_000 };

function clock(start = 0) {
  let t = start;
  return { now: () => t, advance: (ms: number) => (t += ms) };
}

function request(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/test', { method: 'POST', headers });
}

describe('rate limiter', () => {
  it('allows requests under the limit', () => {
    const limiter = createRateLimiter();
    expect(limiter.hit(policy, 'ip')).toEqual({ ok: true, remaining: 1 });
    expect(limiter.hit(policy, 'ip')).toEqual({ ok: true, remaining: 0 });
  });

  it('blocks requests over the limit with the seconds until reset', () => {
    const c = clock();
    const limiter = createRateLimiter(c);
    limiter.hit(policy, 'ip');
    limiter.hit(policy, 'ip');
    c.advance(10_000);
    expect(limiter.hit(policy, 'ip')).toEqual({ ok: false, retryAfterSec: 50 });
  });

  it('starts a fresh window once the previous one expires', () => {
    const c = clock();
    const limiter = createRateLimiter(c);
    limiter.hit(policy, 'ip');
    limiter.hit(policy, 'ip');
    c.advance(policy.windowMs);
    expect(limiter.hit(policy, 'ip').ok).toBe(true);
  });

  it('keeps separate buckets per policy name and per key', () => {
    const limiter = createRateLimiter();
    limiter.hit(policy, 'ip');
    limiter.hit(policy, 'ip');
    expect(limiter.hit({ ...policy, name: 'other' }, 'ip').ok).toBe(true);
    expect(limiter.hit(policy, 'other-ip').ok).toBe(true);
  });

  it('enforce() returns null while under the limit', () => {
    const limiter = createRateLimiter();
    expect(limiter.enforce(policy, request())).toBeNull();
  });

  it('enforce() returns a 429 with Retry-After once over the limit', async () => {
    const limiter = createRateLimiter(clock());
    const req = request({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' });
    limiter.enforce(policy, req);
    limiter.enforce(policy, req);

    const response = limiter.enforce(policy, req);
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
