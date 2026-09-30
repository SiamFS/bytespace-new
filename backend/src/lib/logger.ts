import { pino } from "pino";
import { env } from "../config/env.js";

/**
 * App-wide logger. Express docs recommend Pino over console.* (console writes are synchronous).
 * Cookies, auth headers and Set-Cookie are redacted so sessions never end up in logs.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: ["req.headers.cookie", "req.headers.authorization", 'res.headers["set-cookie"]'],
    censor: "[redacted]",
  },
});
