import { env } from "../config/env.js";
import { MemoryRateLimitStore, RedisRateLimitStore, type RateLimitStore } from "../services/rateLimit.store.js";
import { logger } from "./logger.js";
import { createRedis } from "./redis.js";

let store: RateLimitStore | undefined;
let redis: ReturnType<typeof createRedis> | undefined;

/** Process-wide rate-limit store: Redis when REDIS_URL is set, otherwise in memory. */
export function getRateLimitStore(): RateLimitStore {
  if (!store) {
    if (env.REDIS_URL) {
      redis = createRedis(env.REDIS_URL);
      store = new RedisRateLimitStore(redis);
    } else {
      if (env.NODE_ENV === "production") {
        logger.warn("REDIS_URL not set — rate limits are per instance and reset on restart");
      }
      store = new MemoryRateLimitStore();
    }
  }
  return store;
}

/** Closes the Redis connection on shutdown (no-op without Redis). */
export async function closeRateLimitStore() {
  await redis?.quit().catch(() => undefined);
}
