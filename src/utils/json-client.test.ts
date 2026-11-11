import { describe, expect, it, vi } from 'vitest';
import { requestJson } from './json-client';

type Hello = { ok: true; greeting: string };

function respond(body: unknown, status = 200) {
  return vi.fn(async () =>
    typeof body === 'string'
      ? new Response(body, { status })
      : Response.json(body, { status })
  );
}

describe('requestJson', () => {
  it('returns the success body', async () => {
    const fetchImpl = respond({ ok: true, greeting: 'hi' });
    expect(await requestJson<Hello>('/x', {}, fetchImpl)).toEqual({
      ok: true,
      greeting: 'hi',
    });
  });

  it('sends a JSON body only when one is given', async () => {
    const fetchImpl = respond({ ok: true, greeting: 'hi' });
    await requestJson<Hello>(
      '/x',
      { method: 'POST', body: { a: 1 } },
      fetchImpl
    );
    await requestJson<Hello>('/x', {}, fetchImpl);

    const [[, post], [, get]] = fetchImpl.mock.calls as unknown as [
      string,
      RequestInit,
    ][];
    expect(post).toMatchObject({ method: 'POST', body: '{"a":1}' });
    expect(post.headers).toMatchObject({ 'Content-Type': 'application/json' });
    expect(get).toMatchObject({ method: 'GET', body: undefined });
    expect(get.headers).not.toHaveProperty('Content-Type');
  });

  it("passes through the route's ApiError", async () => {
    const fetchImpl = respond(
      { ok: false, error: 'Too many requests.', retryAfterSec: 30 },
      429
    );
    expect(await requestJson<Hello>('/x', {}, fetchImpl)).toEqual({
      ok: false,
      error: 'Too many requests.',
      retryAfterSec: 30,
    });
  });

  it('treats a non-JSON or shapeless response as a failure', async () => {
    expect(await requestJson<Hello>('/x', {}, respond('<html>', 502))).toEqual({
      ok: false,
      error: 'Request failed (502).',
    });
    expect(await requestJson<Hello>('/x', {}, respond({ helpful: 1 }))).toEqual(
      { ok: false, error: 'Request failed (200).' }
    );
  });

  it('turns a network failure into an error instead of throwing', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    expect(await requestJson<Hello>('/x', {}, fetchImpl)).toMatchObject({
      ok: false,
    });
  });
});
