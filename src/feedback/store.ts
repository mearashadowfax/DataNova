import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { getDb, type Database } from '@/db/client';
import { feedback } from '@/db/schema';

/**
 * Helpful / not-helpful feedback on a support document.
 *
 * Feedback is keyed by a namespaced slug (`articles/my-post`) so two
 * collections can hold documents with the same id without sharing a counter.
 * The Svelte widget imports `FeedbackCounts` as its wire type; nothing outside
 * this module knows the table.
 */

export type FeedbackKind = 'helpful' | 'notHelpful';

export interface FeedbackCounts {
  helpful: number;
  notHelpful: number;
}

/** The slug feedback is keyed by: the document's collection and id together. */
export function feedbackSlug(collection: string, id: string): string {
  return `${collection}/${id}`;
}

export const feedbackSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9/_-]+$/, 'Invalid slug format');

export const feedbackKindSchema = z.enum(['helpful', 'notHelpful']);

export interface FeedbackStore {
  counts(slug: string): Promise<FeedbackCounts>;
  /** Count one piece of feedback and return the new totals. */
  record(slug: string, kind: FeedbackKind): Promise<FeedbackCounts>;
}

const NONE: FeedbackCounts = { helpful: 0, notHelpful: 0 };
const columns = { helpful: feedback.helpful, notHelpful: feedback.notHelpful };

/** A feedback store over any Drizzle handle – Turso in production, `:memory:` in tests. */
export function createFeedbackStore(db: Database): FeedbackStore {
  return {
    async counts(slug) {
      const [row] = await db
        .select(columns)
        .from(feedback)
        .where(eq(feedback.slug, slug));
      return row ?? NONE;
    },

    async record(slug, kind) {
      const delta = {
        helpful: kind === 'helpful' ? 1 : 0,
        notHelpful: kind === 'notHelpful' ? 1 : 0,
      };
      const [row] = await db
        .insert(feedback)
        .values({ slug, ...delta })
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
