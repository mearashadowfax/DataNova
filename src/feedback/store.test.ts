import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { beforeEach, describe, expect, it } from 'vitest';
import type { DocRef } from '@/support/collections';
import type { Database } from '@/db/client';
import { feedback } from '@/db/schema';
import { createFeedbackStore, type FeedbackStore } from './store';

const article = (id: string): DocRef => ({ collection: 'articles', id });

let store: FeedbackStore;
let db: Database;

beforeEach(async () => {
  db = drizzle(createClient({ url: ':memory:' }));
  await migrate(db, { migrationsFolder: 'drizzle' });
  store = createFeedbackStore(db);
});

describe('feedback store', () => {
  it('reports zero counts for a document nobody has given feedback on', async () => {
    expect(await store.counts(article('new'))).toEqual({
      helpful: 0,
      notHelpful: 0,
    });
  });

  it('creates the row on the first feedback and increments after', async () => {
    expect(await store.record(article('a'), 'helpful')).toEqual({
      helpful: 1,
      notHelpful: 0,
    });
    expect(await store.record(article('a'), 'notHelpful')).toEqual({
      helpful: 1,
      notHelpful: 1,
    });
    expect(await store.record(article('a'), 'helpful')).toEqual({
      helpful: 2,
      notHelpful: 1,
    });
    expect(await store.counts(article('a'))).toEqual({
      helpful: 2,
      notHelpful: 1,
    });
  });

  it('keeps documents with the same id in different collections apart', async () => {
    await store.record(article('guide'), 'helpful');
    expect(
      await store.counts({ collection: 'reference', id: 'guide' })
    ).toEqual({
      helpful: 0,
      notHelpful: 0,
    });
  });

  it('reads rows keyed `collection/id`, the format migration 0001 writes', async () => {
    await db
      .insert(feedback)
      .values({ slug: 'reference/install', helpful: 3, notHelpful: 1 });
    expect(
      await store.counts({ collection: 'reference', id: 'install' })
    ).toEqual({
      helpful: 3,
      notHelpful: 1,
    });
  });
});
