/** Error codes the API can return. The frontend switches on these, never on messages. */
export type ErrorCode =
  | "BAD_REQUEST"
  | "INVALID_JSON"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

/** Body of every error response: `{ "error": { code, message, fields? } }`. */
export type ErrorBody = {
  error: {
    code: ErrorCode;
    message: string;
    /** Per-field messages for validation errors (keys match request body fields). */
    fields?: Record<string, string>;
  };
};

/**
 * An expected failure with a known HTTP status. Throw it from services/controllers;
 * the error handler turns it into an `ErrorBody` response.
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly fields: Record<string, string> | undefined;

  constructor(status: number, code: ErrorCode, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}
