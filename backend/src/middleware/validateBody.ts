import type { RequestHandler } from "express";
import type { z } from "zod";
import { AppError } from "../lib/errors.js";

/**
 * Validates `req.body` with a Zod object schema and replaces it with the parsed value
 * (trimmed, lowercased, unknown keys stripped). Failure → 400 VALIDATION_ERROR with the first
 * message per field, the same messages the frontend shows.
 */
export function validateBody(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    // Express 5: req.body is undefined when there is no (JSON) body.
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0] ?? "body");
        fields[field] ??= issue.message;
      }
      throw new AppError(400, "VALIDATION_ERROR", "Please check the highlighted fields.", fields);
    }
    req.body = result.data;
    next();
  };
}
