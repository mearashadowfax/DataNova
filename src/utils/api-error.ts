/** The shape every JSON route answers with when it cannot fulfil a request. */
export interface ApiError {
  ok: false;
  error: string;
  /** Seconds until a rate-limited client may retry. */
  retryAfterSec?: number;
}

/** A JSON error response; `extra` carries fields like `retryAfterSec`. */
export function apiError(
  message: string,
  status: number,
  extra: Omit<ApiError, 'ok' | 'error'> = {},
  headers?: HeadersInit
): Response {
  const body: ApiError = { ok: false, error: message, ...extra };
  return Response.json(body, { status, headers });
}
