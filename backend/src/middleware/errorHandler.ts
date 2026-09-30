import type { ErrorRequestHandler } from "express";
import { AppError, type ErrorBody, type ErrorCode } from "../lib/errors.js";

// Errors raised by express.json() (body-parser) carry a `type` and an HTTP `status`.
type BodyParserError = Error & { type?: string; status?: number; expose?: boolean };

const bodyParserErrors: Record<string, { status: number; code: ErrorCode; message: string }> = {
  "entity.parse.failed": { status: 400, code: "INVALID_JSON", message: "Request body is not valid JSON." },
  "entity.too.large": { status: 413, code: "PAYLOAD_TOO_LARGE", message: "Request body is too large." },
  "charset.unsupported": { status: 415, code: "UNSUPPORTED_MEDIA_TYPE", message: "Unsupported charset." },
  "encoding.unsupported": { status: 415, code: "UNSUPPORTED_MEDIA_TYPE", message: "Unsupported content encoding." },
};

function send(res: Parameters<ErrorRequestHandler>[2], status: number, body: ErrorBody) {
  res.status(status).json(body);
}

/**
 * Last middleware: turns every error into the `{ error: { code, message } }` shape.
 * Unexpected errors are logged and answered with a generic 500 — no stack traces or
 * internal messages ever reach the client.
 */
export const errorHandler: ErrorRequestHandler = (err: unknown, req, res, next) => {
  // Express docs: if the response already started, delegate to the default handler,
  // which closes the connection.
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    send(res, err.status, {
      error: { code: err.code, message: err.message, ...(err.fields && { fields: err.fields }) },
    });
    return;
  }

  const parserError = err as BodyParserError;
  const known = parserError.type ? bodyParserErrors[parserError.type] : undefined;
  if (known) {
    send(res, known.status, { error: { code: known.code, message: known.message } });
    return;
  }
  // Any other client error body-parser marks as safe to show (e.g. malformed content-length).
  if (parserError.expose && parserError.status && parserError.status < 500) {
    send(res, parserError.status, { error: { code: "BAD_REQUEST", message: "Bad request." } });
    return;
  }

  req.log.error({ err }, "Unhandled error");
  send(res, 500, { error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." } });
};
