import type { APIRoute } from "astro";
import { db, Feedback, eq, sql } from "astro:db";

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

    if (!slug || (type && type !== "helpful" && type !== "notHelpful")) {
      // If there is no 'type', return feedback data instead of submitting
      const feedback = await db
        .select()
        .from(Feedback)
        .where(eq(Feedback.slug, slug))
        .then((rows) => rows[0] || { helpful: 0, notHelpful: 0 });

      return new Response(JSON.stringify(feedback), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // If type exists, handle feedback submission as before
    let updatedFeedback;

    if (type === "helpful") {
      updatedFeedback = await db
        .insert(Feedback)
        .values({ slug, helpful: 1 })
        .onConflictDoUpdate({
          target: Feedback.slug,
          set: { helpful: sql`helpful + 1` },
        })
        .returning({
          helpful: Feedback.helpful,
          notHelpful: Feedback.notHelpful,
        })
        .then((res) => res[0]);
    } else {
      updatedFeedback = await db
        .insert(Feedback)
        .values({ slug, notHelpful: 1 })
        .onConflictDoUpdate({
          target: Feedback.slug,
          set: { notHelpful: sql`notHelpful + 1` },
        })
        .returning({
          helpful: Feedback.helpful,
          notHelpful: Feedback.notHelpful,
        })
        .then((res) => res[0]);
    }

    return new Response(JSON.stringify(updatedFeedback), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error handling feedback:", error);
    return new Response("Internal server error", { status: 500 });
  }
};
