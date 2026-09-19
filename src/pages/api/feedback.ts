import type { APIRoute } from 'astro';
import { z } from 'zod';
import {
  feedbackKindSchema,
  feedbackSlugSchema,
  getFeedbackStore,
} from '@/feedback/store';
import { rateLimiter } from '@/utils/rate-limit';

const readPolicy = { name: 'feedback-get', limit: 60, windowMs: 60_000 };
const votePolicy = { name: 'feedback-post', limit: 20, windowMs: 60_000 };

const voteSchema = z.object({
  slug: feedbackSlugSchema,
  type: feedbackKindSchema,
});

/** Read feedback counts for a slug. */
export const GET: APIRoute = async ({ url, request }) => {
  const limited = rateLimiter.enforce(readPolicy, request);
  if (limited) return limited;

  const slug = feedbackSlugSchema.safeParse(url.searchParams.get('slug'));
  if (!slug.success) {
    return Response.json(
      { error: 'A valid slug query parameter is required.' },
      { status: 400 }
    );
  }

  try {
    return Response.json(await getFeedbackStore().counts(slug.data));
  } catch (error) {
    console.error('Error reading feedback:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};

/** Submit helpful / notHelpful feedback for a slug. */
export const POST: APIRoute = async ({ request }) => {
  const limited = rateLimiter.enforce(votePolicy, request);
  if (limited) return limited;

  const body = await request.json().catch(() => undefined);
  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid feedback payload.' },
      { status: 400 }
    );
  }

  try {
    const { slug, type } = parsed.data;
    return Response.json(await getFeedbackStore().vote(slug, type));
  } catch (error) {
    console.error('Error handling feedback:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
