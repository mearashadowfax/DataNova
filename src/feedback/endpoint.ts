import type { APIRoute } from 'astro';
import { z } from 'zod';
import { docCollectionNames, type DocRef } from '@/support/collections';
import { apiError, type ApiError } from '@/utils/api-error';
import { rateLimiter, type RateLimiter } from '@/utils/rate-limit';
import {
  getFeedbackStore,
  type FeedbackCounts,
  type FeedbackStore,
} from './store';

/**
 * The feedback endpoint: rate limit, parse, validate, check the document
 * exists, read or record. Request in, Response out – the route file only
 * wires in the app's dependencies.
 */

export type FeedbackSuccess = { ok: true } & FeedbackCounts;

/** What both feedback routes answer with; `PostFeedback.svelte` reads this shape. */
export type FeedbackResponse = FeedbackSuccess | ApiError;

export interface FeedbackDeps {
  store: FeedbackStore;
  limiter: RateLimiter;
  /** Whether a document exists, so feedback is never kept for one that doesn't. */
  documentExists: (doc: DocRef) => Promise<boolean>;
}

const readPolicy = { name: 'feedback-read', limit: 60, windowMs: 60_000 };
const recordPolicy = { name: 'feedback-record', limit: 20, windowMs: 60_000 };

const docRefSchema = z.object({
  collection: z.enum(docCollectionNames),
  // Any shape Astro's loader can produce (nested, Unicode); `documentExists`
  // is what rejects ids that name no document.
  id: z.string().trim().min(1).max(200),
});

const recordSchema = docRefSchema.extend({
  type: z.enum(['helpful', 'notHelpful']),
});

async function answer(
  doc: DocRef,
  deps: FeedbackDeps,
  action: () => Promise<FeedbackCounts>
): Promise<Response> {
  try {
    if (!(await deps.documentExists(doc))) {
      return apiError('No such document.', 404);
    }
    const body: FeedbackSuccess = { ok: true, ...(await action()) };
    return Response.json(body);
  } catch (error) {
    console.error('[feedback] Error handling feedback:', error);
    return apiError('Internal server error', 500);
  }
}

/** `GET ?collection=…&id=…`: the document's feedback counts. */
export async function readFeedback(
  request: Request,
  deps: FeedbackDeps
): Promise<Response> {
  const limited = await deps.limiter.enforce(readPolicy, request);
  if (limited) return limited;

  const params = new URL(request.url).searchParams;
  const parsed = docRefSchema.safeParse({
    collection: params.get('collection'),
    id: params.get('id'),
  });
  if (!parsed.success) {
    return apiError(
      'Valid collection and id query parameters are required.',
      400
    );
  }

  return answer(parsed.data, deps, () => deps.store.counts(parsed.data));
}

/** `POST { collection, id, type }`: count one piece of feedback. */
export async function recordFeedback(
  request: Request,
  deps: FeedbackDeps
): Promise<Response> {
  const limited = await deps.limiter.enforce(recordPolicy, request);
  if (limited) return limited;

  const body = await request.json().catch(() => undefined);
  const parsed = recordSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Invalid feedback payload.', 400);
  }

  const { type, ...doc } = parsed.data;
  return answer(doc, deps, () => deps.store.record(doc, type));
}

/** The Astro routes, wired to the app's store and rate limiter. */
export function feedbackRoutes({
  documentExists,
}: Pick<FeedbackDeps, 'documentExists'>): { GET: APIRoute; POST: APIRoute } {
  const deps = (): FeedbackDeps => ({
    store: getFeedbackStore(),
    limiter: rateLimiter,
    documentExists,
  });
  return {
    GET: ({ request }) => readFeedback(request, deps()),
    POST: ({ request }) => recordFeedback(request, deps()),
  };
}
