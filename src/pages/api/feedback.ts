import type { APIRoute } from 'astro';
import { z } from 'zod';
import {
  feedbackKindSchema,
  feedbackSlugSchema,
  getFeedbackStore,
} from '@/feedback/store';
import { apiError } from '@/utils/api-error';
import { rateLimiter } from '@/utils/rate-limit';

const readPolicy = { name: 'feedback-read', limit: 60, windowMs: 60_000 };
const recordPolicy = { name: 'feedback-record', limit: 20, windowMs: 60_000 };

const feedbackSchema = z.object({
  slug: feedbackSlugSchema,
  type: feedbackKindSchema,
});

/** Read feedback counts for a slug. */
export const GET: APIRoute = async ({ url, request }) => {
  const limited = await rateLimiter.enforce(readPolicy, request);
  if (limited) return limited;

  const slug = feedbackSlugSchema.safeParse(url.searchParams.get('slug'));
  if (!slug.success) {
    return apiError('A valid slug query parameter is required.', 400);
  }

  try {
    return Response.json(await getFeedbackStore().counts(slug.data));
  } catch (error) {
    console.error('Error reading feedback:', error);
    return apiError('Internal server error', 500);
  }
};

/** Record helpful / notHelpful feedback for a slug. */
export const POST: APIRoute = async ({ request }) => {
  const limited = await rateLimiter.enforce(recordPolicy, request);
  if (limited) return limited;

  const body = await request.json().catch(() => undefined);
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Invalid feedback payload.', 400);
  }

  try {
    const { slug, type } = parsed.data;
    return Response.json(await getFeedbackStore().record(slug, type));
  } catch (error) {
    console.error('Error handling feedback:', error);
    return apiError('Internal server error', 500);
  }
};
