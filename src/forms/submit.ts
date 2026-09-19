import type { APIRoute } from 'astro';
import { getConfig } from '@/config';
import { rateLimiter, type RateLimiter } from '@/utils/rate-limit';
import { formSchema, HONEYPOT_FIELD, type FormDefinition } from './definition';
import { delivererFor, type Deliver } from './deliver';

/** What every form endpoint answers with; `form-client.ts` reads this shape. */
export type FormResponse =
  | { ok: true; demo: boolean; message: string }
  | { ok: false; error: string; retryAfterSec?: number };

export interface SubmitDeps {
  deliver: Deliver;
  limiter: RateLimiter;
}

function reply(body: FormResponse, status = 200): Response {
  return Response.json(body, { status });
}

/**
 * Run a submission through the whole pipeline: rate limit, JSON parse,
 * validation, honeypot, delivery. Request in, Response out – no env, no HTTP.
 */
export async function submitForm(
  form: FormDefinition,
  request: Request,
  deps: SubmitDeps
): Promise<Response> {
  const limited = deps.limiter.enforce(form.rateLimit, request);
  if (limited) return limited;

  const body = await request.json().catch(() => undefined);
  const parsed = formSchema(form).safeParse(body);
  if (!parsed.success) {
    return reply({ ok: false, error: form.messages.invalid }, 400);
  }

  const { [HONEYPOT_FIELD]: honeypot, ...payload } = parsed.data;
  if (honeypot) {
    // Bots get the same answer as humans so they cannot tell they were dropped.
    return reply({ ok: true, demo: false, message: form.messages.sent });
  }

  try {
    const { demo } = await deps.deliver({ ...payload, form: form.name });
    return reply({
      ok: true,
      demo,
      message: demo
        ? `${form.messages.sent} (Demo mode – set FORMSPREE_${form.deliverTo.toUpperCase()}_ENDPOINT to deliver.)`
        : form.messages.sent,
    });
  } catch (error) {
    console.error(`[forms] Error delivering ${form.name} form:`, error);
    return reply({ ok: false, error: 'Internal server error' }, 500);
  }
}

/** An Astro route for `form`, wired to the app's config and rate limiter. */
export function formEndpoint(form: FormDefinition): APIRoute {
  return ({ request }) =>
    submitForm(form, request, {
      deliver: delivererFor(getConfig().forms[form.deliverTo]),
      limiter: rateLimiter,
    });
}
