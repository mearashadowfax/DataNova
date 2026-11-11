import { describe, expect, it, vi } from 'vitest';
import type { DocRef } from '@/support/collections';
import { createRateLimiter } from '@/utils/rate-limit';
import {
  readFeedback,
  recordFeedback,
  type FeedbackDeps,
  type FeedbackResponse,
} from './endpoint';
import type { FeedbackCounts, FeedbackKind, FeedbackStore } from './store';

/** An in-memory store, so these tests cover the endpoint, not SQL. */
function memoryStore(): FeedbackStore {
  const rows = new Map<string, FeedbackCounts>();
  const key = (doc: DocRef) => `${doc.collection}:${doc.id}`;
  return {
    async counts(doc) {
      return rows.get(key(doc)) ?? { helpful: 0, notHelpful: 0 };
    },
    async record(doc, kind: FeedbackKind) {
      const next = { ...(await this.counts(doc)) };
      next[kind] += 1;
      rows.set(key(doc), next);
      return next;
    },
  };
}

const existing = new Set([
  'articles:intro',
  'articles:café',
  'reference:guides/install',
]);

function deps(overrides: Partial<FeedbackDeps> = {}): FeedbackDeps {
  return {
    store: memoryStore(),
    limiter: createRateLimiter(),
    documentExists: async doc => existing.has(`${doc.collection}:${doc.id}`),
    ...overrides,
  };
}

function get(query: string, ip = '203.0.113.1') {
  return new Request(`http://localhost/api/feedback?${query}`, {
    headers: { 'x-forwarded-for': ip },
  });
}

function post(body: unknown, ip = '203.0.113.1') {
  return new Request('http://localhost/api/feedback', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function read(response: Response) {
  return {
    status: response.status,
    body: (await response.json()) as FeedbackResponse,
  };
}

describe('feedback endpoint', () => {
  it('records feedback and reads it back', async () => {
    const d = deps();
    const doc = { collection: 'articles', id: 'intro' };

    expect(
      await read(await recordFeedback(post({ ...doc, type: 'helpful' }), d))
    ).toEqual({ status: 200, body: { ok: true, helpful: 1, notHelpful: 0 } });

    expect(
      await read(await readFeedback(get('collection=articles&id=intro'), d))
    ).toEqual({ status: 200, body: { ok: true, helpful: 1, notHelpful: 0 } });
  });

  it.each([
    ['nested', 'reference', 'guides/install'],
    ['Unicode', 'articles', 'café'],
  ])('accepts %s content ids', async (_, collection, id) => {
    const params = new URLSearchParams({ collection, id });
    const { status } = await read(await readFeedback(get(`${params}`), deps()));
    expect(status).toBe(200);
  });

  it.each(['nope', '../etc'])(
    'answers 404 and stores nothing for a document that does not exist (%s)',
    async id => {
      const d = deps();
      const record = vi.spyOn(d.store, 'record');
      const { status } = await read(
        await recordFeedback(
          post({ collection: 'articles', id, type: 'helpful' }),
          d
        )
      );
      expect(status).toBe(404);
      expect(record).not.toHaveBeenCalled();
    }
  );

  it.each([
    ['an unknown collection', { collection: 'junk', id: 'intro' }],
    ['an empty id', { collection: 'articles', id: '' }],
    [
      'a missing type',
      { collection: 'articles', id: 'intro', type: undefined },
    ],
  ])('rejects %s with 400', async (_, body) => {
    const d = deps();
    const exists = vi.spyOn(d, 'documentExists');
    const { status } = await read(
      await recordFeedback(post({ type: 'helpful', ...body }), d)
    );
    expect(status).toBe(400);
    expect(exists).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON and missing query parameters with 400', async () => {
    expect((await recordFeedback(post('{nope'), deps())).status).toBe(400);
    expect(
      (await readFeedback(get('collection=articles'), deps())).status
    ).toBe(400);
  });

  it('answers 429 once the record policy is exceeded', async () => {
    const d = deps();
    const body = { collection: 'articles', id: 'intro', type: 'helpful' };
    for (let i = 0; i < 20; i++) await recordFeedback(post(body), d);
    const { status, body: answer } = await read(
      await recordFeedback(post(body), d)
    );
    expect(status).toBe(429);
    expect(answer).toMatchObject({ ok: false, retryAfterSec: 60 });
  });

  it('answers 500 when the store fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const d = deps();
    vi.spyOn(d.store, 'counts').mockRejectedValueOnce(new Error('db down'));
    expect(
      await read(await readFeedback(get('collection=articles&id=intro'), d))
    ).toEqual({
      status: 500,
      body: { ok: false, error: 'Internal server error' },
    });
  });
});
