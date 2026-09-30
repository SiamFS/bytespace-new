import type { RequestHandler } from "express";
import { AppError } from "../lib/errors.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF defence for cookie-authenticated writes, on top of SameSite=Lax:
 * - the body must be JSON — HTML forms can't send `application/json` cross-site without a
 *   CORS preflight, which our CORS allow-list refuses;
 * - if the browser sends an `Origin` header, it must be one of our frontend origins.
 * Requests without `Origin` (curl, server-to-server) are not CSRF and pass.
 */
export function blockCrossSiteWrites(allowedOrigins: readonly string[]): RequestHandler {
  const allowed = new Set(allowedOrigins);
  return (req, _res, next) => {
    if (SAFE_METHODS.has(req.method)) {
      next();
      return;
    }
    const origin = req.get("Origin");
    if (origin && !allowed.has(origin)) {
      throw new AppError(403, "FORBIDDEN", "Cross-site request blocked.");
    }
    if (!req.is("application/json")) {
      throw new AppError(415, "UNSUPPORTED_MEDIA_TYPE", "Send the request body as JSON.");
    }
    next();
  };
}
