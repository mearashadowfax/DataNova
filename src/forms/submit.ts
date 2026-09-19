import type { APIRoute } from 'astro';
import { deliveryEnvVar, getConfig } from '@/config';
import { apiError, type ApiError } from '@/utils/api-error';
import { rateLimiter, type RateLimiter } from '@/utils/rate-limit';
import { formSchema, HONEYPOT_FIELD, type FormDeclaration } from './declare';
import { delivererFor, type Deliver } from './deliver';

export interface FormSuccess {
  ok: true;
  demo: boolean;
  message: string;
}

/** What every form endpoint answers with; `form-client.ts` reads this shape. */
export type FormResponse = FormSuccess | ApiError;

export interface SubmitDeps {
  deliver: Deliver;
  limiter: RateLimiter;
}

function success(body: FormSuccess): Response {
  return Response.json(body);
}

/**
 * Run a submission through the whole pipeline: rate limit, JSON parse,
 * validation, honeypot, delivery. Request in, Response out – no env, no HTTP.
 */
export async function submitForm(
  form: FormDeclaration,
  request: Request,
  deps: SubmitDeps
): Promise<Response> {
  const limited = await deps.limiter.enforce(form.rateLimit, request);
  if (limited) return limited;

  const body = await request.json().catch(() => undefined);
  const parsed = formSchema(form).safeParse(body);
  if (!parsed.success) {
    return apiError(form.messages.invalid, 400);
  }

  const { [HONEYPOT_FIELD]: honeypot, ...payload } = parsed.data;
  if (honeypot) {
    // Bots get the same answer as humans so they cannot tell they were dropped.
    return success({ ok: true, demo: false, message: form.messages.sent });
  }

  try {
    const { demo } = await deps.deliver({ ...payload, form: form.name });
    return success({
      ok: true,
      demo,
      message: demo
        ? `${form.messages.sent} (Demo mode – set ${deliveryEnvVar[form.deliverTo]} to deliver.)`
        : form.messages.sent,
    });
  } catch (error) {
    console.error(`[forms] Error delivering ${form.name} form:`, error);
    return apiError('Internal server error', 500);
  }
}

/** An Astro route for `form`, wired to the app's config and rate limiter. */
export function formEndpoint(form: FormDeclaration): APIRoute {
  return ({ request }) =>
    submitForm(form, request, {
      deliver: delivererFor(getConfig().forms[form.deliverTo]),
      limiter: rateLimiter,
    });
}
