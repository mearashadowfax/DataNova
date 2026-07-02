import type { APIRoute } from 'astro';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { feedback } from '@/db/schema';

/**
 * Handles POST requests to submit or retrieve feedback data for a specific `slug`.
 *
 * The function processes the request body to extract the `slug` and optional `type` values.
 * If `slug` is missing or `type` is invalid, it retrieves existing feedback data for the `slug`.
 * If a valid `type` is provided ("helpful" or "notHelpful"), it updates the feedback data
 * by incrementing the respective count.
 *
 * Returns the feedback data in JSON format with appropriate success or error response status.
 *
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { slug, type } = data;

    if (!slug || (type && type !== 'helpful' && type !== 'notHelpful')) {
      // If there is no 'type', return feedback data instead of submitting
      const row = await db
        .select()
        .from(feedback)
        .where(eq(feedback.slug, slug))
        .then(rows => rows[0] || { helpful: 0, notHelpful: 0 });

      return new Response(JSON.stringify(row), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // If type exists, handle feedback submission as before
    let updatedFeedback;

    if (type === 'helpful') {
      updatedFeedback = await db
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
        .then(res => res[0]);
    } else {
      updatedFeedback = await db
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
    }

    return new Response(JSON.stringify(updatedFeedback), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error handling feedback:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
