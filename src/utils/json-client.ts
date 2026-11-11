import type { ApiError } from './api-error';

/**
 * The browser side of the app's JSON routes. Every route answers
 * `{ ok: true, ... }` or an `ApiError`; this turns any request into one of
 * those two, so callers branch on `result.ok` and never parse, cast or catch.
 */

export interface JsonRequest {
  method?: 'GET' | 'POST';
  /** Sent as JSON. */
  body?: unknown;
}

export async function requestJson<T extends { ok: true }>(
  url: string,
  { method = 'GET', body }: JsonRequest = {},
  fetchImpl: typeof fetch = fetch
): Promise<T | ApiError> {
  let response: Response;
  try {
    response = await fetchImpl(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return {
      ok: false,
      error: 'Could not reach the server. Check your connection.',
    };
  }

  const data: unknown = await response.json().catch(() => null);
  const isObject = typeof data === 'object' && data !== null;

  if (response.ok && isObject && (data as { ok?: unknown }).ok === true) {
    return data as T;
  }
  if (isObject && typeof (data as { error?: unknown }).error === 'string') {
    return { ...(data as ApiError), ok: false };
  }
  return { ok: false, error: `Request failed (${response.status}).` };
}
