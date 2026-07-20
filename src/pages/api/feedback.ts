import type { APIRoute } from 'astro';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/client';
import { feedback } from '@/db/schema';
import { errorResponse, jsonResponse } from '@/utils/api';
import { getClientIp, rateLimit } from '@/utils/rate-limit';

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[a-zA-Z0-9/_-]+$/, 'Invalid slug format');

const voteSchema = z.object({
  slug: slugSchema,
  type: z.enum(['helpful', 'notHelpful']),
});

async function getFeedbackCounts(slug: string) {
  const row = await db
    .select()
    .from(feedback)
    .where(eq(feedback.slug, slug))
    .then(rows => rows[0] || { helpful: 0, notHelpful: 0 });

  return {
    helpful: row.helpful ?? 0,
    notHelpful: row.notHelpful ?? 0,
  };
}

/** Read feedback counts for a slug. */
export const GET: APIRoute = async ({ url, request }) => {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`feedback-get:${ip}`, {
      limit: 60,
      windowMs: 60_000,
    });
    if (!limited.ok) {
      return errorResponse('Too many requests.', 429, {
        retryAfterSec: limited.retryAfterSec,
      });
    }

    const slugResult = slugSchema.safeParse(url.searchParams.get('slug'));
    if (!slugResult.success) {
      return errorResponse('A valid slug query parameter is required.', 400);
    }

    const counts = await getFeedbackCounts(slugResult.data);
    return jsonResponse(counts);
  } catch (error) {
    console.error('Error reading feedback:', error);
    return errorResponse('Internal server error', 500);
  }
};

/** Submit helpful / notHelpful feedback for a slug. */
export const POST: APIRoute = async ({ request }) => {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`feedback-post:${ip}`, {
      limit: 20,
      windowMs: 60_000,
    });
    if (!limited.ok) {
      return errorResponse('Too many requests.', 429, {
        retryAfterSec: limited.retryAfterSec,
      });
    }

    const data = await request.json();
    const parsed = voteSchema.safeParse(data);

    if (!parsed.success) {
      return errorResponse('Invalid feedback payload.', 400, {
        issues: z.treeifyError(parsed.error),
      });
    }

    const { slug, type } = parsed.data;

    const updatedFeedback =
      type === 'helpful'
        ? await db
            .insert(feedback)
            .values({ slug, helpful: 1 })
            .onConflictDoUpdate({
              target: feedback.slug,
              set: { helpful: sql`${feedback.helpful} + 1` },
            })
            .returning({
              helpful: feedback.helpful,
              notHelpful: feedback.notHelpful,
            })
            .then(res => res[0])
        : await db
            .insert(feedback)
            .values({ slug, notHelpful: 1 })
            .onConflictDoUpdate({
              target: feedback.slug,
              set: { notHelpful: sql`${feedback.notHelpful} + 1` },
            })
            .returning({
              helpful: feedback.helpful,
              notHelpful: feedback.notHelpful,
            })
            .then(res => res[0]);

    return jsonResponse(updatedFeedback);
  } catch (error) {
    console.error('Error handling feedback:', error);
    return errorResponse('Internal server error', 500);
  }
};
