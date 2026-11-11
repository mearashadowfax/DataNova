import { eq, sql } from 'drizzle-orm';
import { getDb, type Database } from '@/db/client';
import { feedback } from '@/db/schema';
import { docKey, type DocRef } from '@/support/collections';

/**
 * Helpful / not-helpful feedback on a support document, persisted.
 *
 * Callers name a document by its collection and id; rows are keyed by
 * `docKey` (`articles/my-post`), so two collections never share a counter.
 */

export type FeedbackKind = 'helpful' | 'notHelpful';

export interface FeedbackCounts {
  helpful: number;
  notHelpful: number;
}

export interface FeedbackStore {
  counts(doc: DocRef): Promise<FeedbackCounts>;
  /** Count one piece of feedback and return the new totals. */
  record(doc: DocRef, kind: FeedbackKind): Promise<FeedbackCounts>;
}

const NONE: FeedbackCounts = { helpful: 0, notHelpful: 0 };
const columns = { helpful: feedback.helpful, notHelpful: feedback.notHelpful };

/** A feedback store over any Drizzle handle – Turso in production, `:memory:` in tests. */
export function createFeedbackStore(db: Database): FeedbackStore {
  return {
    async counts(doc) {
      const [row] = await db
        .select(columns)
        .from(feedback)
        .where(eq(feedback.slug, docKey(doc)));
      return row ?? NONE;
    },

    async record(doc, kind) {
      const delta = {
        helpful: kind === 'helpful' ? 1 : 0,
        notHelpful: kind === 'notHelpful' ? 1 : 0,
      };
      const [row] = await db
        .insert(feedback)
        .values({ slug: docKey(doc), ...delta })
        .onConflictDoUpdate({
          target: feedback.slug,
          set: {
            helpful: sql`${feedback.helpful} + ${delta.helpful}`,
            notHelpful: sql`${feedback.notHelpful} + ${delta.notHelpful}`,
          },
        })
        .returning(columns);
      return row ?? NONE;
    },
  };
}

let cached: FeedbackStore | undefined;

/** The app's feedback store, backed by the configured database. */
export function getFeedbackStore(): FeedbackStore {
  cached ??= createFeedbackStore(getDb());
  return cached;
}
