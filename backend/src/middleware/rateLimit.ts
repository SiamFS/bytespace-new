import type { Request, RequestHandler } from "express";
import { AppError } from "../lib/errors.js";
import type { RateLimitStore } from "../services/rateLimit.store.js";

export type RateLimitRule = {
  /** Distinguishes counters of different rules in the store. */
  name: string;
  limit: number;
  windowSeconds: number;
  /** What to count per — e.g. the client IP, or IP + email. */
  key: (req: Request) => string;
};

/**
 * Fixed-window rate limit. Over the limit → 429 RATE_LIMITED with `Retry-After`.
 * If the store is down (Redis outage) the request is allowed and the error logged:
 * an outage of the limiter must not lock everyone out of their accounts.
 */
export function rateLimit(store: RateLimitStore, rule: RateLimitRule): RequestHandler {
  return async (req, res, next) => {
    let result;
    try {
      result = await store.hit(`${rule.name}:${rule.key(req)}`, rule.windowSeconds);
    } catch (err) {
      req.log.error({ err, rule: rule.name }, "Rate limit store unavailable — allowing request");
      next();
      return;
    }
    if (result.count > rule.limit) {
      res.set("Retry-After", String(result.resetSeconds));
      throw new AppError(429, "RATE_LIMITED", "Too many attempts. Please try again later.");
    }
    next();
  };
}
