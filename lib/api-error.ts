// §17.9 uniform API error body.
export interface ApiErrorBody {
  code: string;
  message: string;
  request_id: string;
  retryable: boolean;
}

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "CAPTCHA_FAILED"
  | "RATE_LIMITED"
  | "OUTSIDE_REGION"
  | "MEDIA_REJECTED"
  | "SOURCE_UNAVAILABLE"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export function apiError(
  code: ApiErrorCode | string,
  message: string,
  retryable = false,
): ApiErrorBody {
  return {
    code,
    message,
    request_id: crypto.randomUUID(),
    retryable,
  };
}

/** Minimal observability seam (DEC-15): structured JSON, no logger framework. */
export function logApiError(route: string, body: ApiErrorBody): void {
  console.error(
    JSON.stringify({
      request_id: body.request_id,
      route,
      code: body.code,
    }),
  );
}
