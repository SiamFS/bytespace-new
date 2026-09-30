import type { Request } from "express";
import type { RateLimitRule } from "../middleware/rateLimit.js";
import { env } from "./env.js";

// `req.ip` is the real client only with the right TRUST_PROXY hop count (see env.ts).
const ip = (req: Request) => req.ip ?? "unknown";
// Runs after body validation, so the email is already trimmed and lowercased.
const ipAndEmail = (req: Request) => `${ip(req)}:${String((req.body as { email?: unknown }).email)}`;

export type RateLimitRules = {
  login: RateLimitRule[];
  register: RateLimitRule[];
};

/**
 * Login: 5 tries per minute for one account from one IP (stops password guessing), plus 20 per
 * minute per IP across accounts (stops spraying). Register: REGISTER_LIMIT_PER_HOUR (5) per IP.
 */
export const defaultRateLimits: RateLimitRules = {
  login: [
    { name: "login-account", limit: 5, windowSeconds: 60, key: ipAndEmail },
    { name: "login-ip", limit: 20, windowSeconds: 60, key: ip },
  ],
  register: [{ name: "register-ip", limit: env.REGISTER_LIMIT_PER_HOUR, windowSeconds: 60 * 60, key: ip }],
};
