import type { APIRoute } from 'astro';
import { z } from 'zod';
import { deliverFormPayload, errorResponse, jsonResponse } from '@/utils/api';
import { getClientIp, rateLimit } from '@/utils/rate-limit';

const newsletterSchema = z.object({
  email: z.email().max(254),
  website: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`newsletter:${ip}`, {
      limit: 5,
      windowMs: 60_000,
    });
    if (!limited.ok) {
      return errorResponse('Too many requests. Please try again later.', 429, {
        retryAfterSec: limited.retryAfterSec,
      });
    }

    const data = await request.json();
    const parsed = newsletterSchema.safeParse(data);

    if (!parsed.success) {
      return errorResponse('Please enter a valid email address.', 400, {
        issues: z.treeifyError(parsed.error),
      });
    }

    if (parsed.data.website) {
      return jsonResponse({ ok: true });
    }

    const webhook =
      import.meta.env.FORMSPREE_NEWSLETTER_ENDPOINT ??
      import.meta.env.FORM_WEBHOOK_NEWSLETTER;

    const result = await deliverFormPayload(webhook, {
      email: parsed.data.email,
      form: 'newsletter',
    });

    return jsonResponse({
      ok: true,
      demo: result.demo,
      message: result.demo
        ? 'Subscribed! (Demo mode – configure FORMSPREE_NEWSLETTER_ENDPOINT to deliver.)'
        : 'Thanks for subscribing!',
    });
  } catch (error) {
    console.error('Error handling newsletter form:', error);
    return errorResponse('Internal server error', 500);
  }
};
