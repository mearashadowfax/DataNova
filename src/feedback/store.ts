import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { getDb, type Database } from '@/db/client';
import { feedback } from '@/db/schema';

/**
 * Helpful / not-helpful votes on a support document.
 *
 * Votes are keyed by a namespaced slug (`articles/my-post`) so two collections
 * can hold documents with the same id without sharing a counter. The Svelte
 * widget imports `FeedbackCounts` as its wire type; nothing outside this module
 * knows the table.
 */

export type FeedbackKind = 'helpful' | 'notHelpful';

export interface FeedbackCounts {
  helpful: number;
  notHelpful: number;
}

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
  vote(slug: string, kind: FeedbackKind): Promise<FeedbackCounts>;
  /** Resolves when the database answers; rejects when it is unreachable. */
  ping(): Promise<void>;
}

const NONE: FeedbackCounts = { helpful: 0, notHelpful: 0 };
const columns = { helpful: feedback.helpful, notHelpful: feedback.notHelpful };

export function createFeedbackStore(db: Database): FeedbackStore {
  return {
    async counts(slug) {
      const [row] = await db
        .select(columns)
        .from(feedback)
        .where(eq(feedback.slug, slug));
      return row ?? NONE;
    },

    async vote(slug, kind) {
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

    async ping() {
      await db.select({ slug: feedback.slug }).from(feedback).limit(1);
    },
  };
}

let cached: FeedbackStore | undefined;

/** The app's feedback store, backed by the configured database. */
export function getFeedbackStore(): FeedbackStore {
  cached ??= createFeedbackStore(getDb());
  return cached;
}
