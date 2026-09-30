import type { RequestHandler } from "express";
import type { ErrorBody } from "../lib/errors.js";

/**
 * Catch-all after every route. Express docs: a 404 isn't an error, so the error handler
 * never sees it — it needs its own middleware at the bottom of the stack.
 */
export const notFound: RequestHandler = (_req, res) => {
  const body: ErrorBody = { error: { code: "NOT_FOUND", message: "Route not found." } };
  res.status(404).json(body);
};
