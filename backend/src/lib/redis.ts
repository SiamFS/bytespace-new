import { Redis } from "ioredis";
import { logger } from "./logger.js";

/**
 * Redis client for rate limiting. Fails fast instead of queueing commands while disconnected
 * (a rate-limit check must never hang a login), and keeps reconnecting in the background.
 */
export function createRedis(url: string) {
  const redis = new Redis(url, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 5000,
  });
  redis.on("error", (err) => logger.warn({ err }, "Redis error"));
  return redis;
}
