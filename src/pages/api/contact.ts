import type { APIRoute } from 'astro';
import { z } from 'zod';
import { deliverFormPayload, errorResponse, jsonResponse } from '@/utils/api';
import { getClientIp, rateLimit } from '@/utils/rate-limit';

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  message: z.string().trim().min(1).max(5000),
  company: z.string().trim().max(200).optional(),
  licenseType: z.string().trim().max(100).optional(),
  // Honeypot – bots fill this; humans leave it empty
  website: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60_000 });
    if (!limited.ok) {
      return errorResponse('Too many requests. Please try again later.', 429, {
        retryAfterSec: limited.retryAfterSec,
      });
    }

    const data = await request.json();
    const parsed = contactSchema.safeParse(data);

    if (!parsed.success) {
      return errorResponse('Invalid form data.', 400, {
        issues: z.treeifyError(parsed.error),
      });
    }

    if (parsed.data.website) {
      // Silent success for honeypot hits
      return jsonResponse({ ok: true });
    }

    const { website: _honeypot, ...payload } = parsed.data;
    const webhook =
      import.meta.env.FORMSPREE_CONTACT_ENDPOINT ??
      import.meta.env.FORM_WEBHOOK_CONTACT;

    const result = await deliverFormPayload(webhook, {
      ...payload,
      form: 'contact',
    });

    return jsonResponse({
      ok: true,
      demo: result.demo,
      message: result.demo
        ? 'Thanks! (Demo mode – configure FORMSPREE_CONTACT_ENDPOINT to deliver emails.)'
        : 'Thanks! Your message has been sent.',
    });
  } catch (error) {
    console.error('Error handling contact form:', error);
    return errorResponse('Internal server error', 500);
  }
};
