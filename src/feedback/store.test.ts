import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  createFeedbackStore,
  feedbackSlug,
  feedbackSlugSchema,
  type FeedbackStore,
} from './store';

let store: FeedbackStore;

beforeEach(async () => {
  const db = drizzle(createClient({ url: ':memory:' }));
  await migrate(db, { migrationsFolder: 'drizzle' });
  store = createFeedbackStore(db);
});

describe('feedback store', () => {
  it('reports zero counts for a document nobody has given feedback on', async () => {
    expect(await store.counts('articles/new')).toEqual({
      helpful: 0,
      notHelpful: 0,
    });
  });

  it('creates the row on the first feedback and increments after', async () => {
    expect(await store.record('articles/a', 'helpful')).toEqual({
      helpful: 1,
      notHelpful: 0,
    });
    expect(await store.record('articles/a', 'notHelpful')).toEqual({
      helpful: 1,
      notHelpful: 1,
    });
    expect(await store.record('articles/a', 'helpful')).toEqual({
      helpful: 2,
      notHelpful: 1,
    });
    expect(await store.counts('articles/a')).toEqual({
      helpful: 2,
      notHelpful: 1,
    });
  });

  it('keeps documents with the same id in different collections apart', async () => {
    await store.record(feedbackSlug('articles', 'guide'), 'helpful');
    expect(await store.counts(feedbackSlug('reference', 'guide'))).toEqual({
      helpful: 0,
      notHelpful: 0,
    });
  });
});

describe('feedbackSlugSchema', () => {
  it('requires the collection namespace', () => {
    expect(feedbackSlugSchema.safeParse('articles/my-post').success).toBe(true);
    expect(feedbackSlugSchema.safeParse('my-post').success).toBe(false);
    expect(feedbackSlugSchema.safeParse('articles/../etc').success).toBe(false);
  });
});
