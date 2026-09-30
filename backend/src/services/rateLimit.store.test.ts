import { randomUUID } from "node:crypto";
import { Redis } from "ioredis";
import { afterAll, describe, expect, it, vi } from "vitest";
import { MemoryRateLimitStore, RedisRateLimitStore, type RateLimitStore } from "./rateLimit.store.js";

function behavesLikeAFixedWindow(makeStore: () => RateLimitStore) {
  it("counts hits per key within the window", async () => {
    const store = makeStore();
    const key = randomUUID();
    expect((await store.hit(key, 60)).count).toBe(1);
    expect((await store.hit(key, 60)).count).toBe(2);
    expect((await store.hit(`${key}-other`, 60)).count).toBe(1);
  });

  it("reports when the window resets", async () => {
    const result = await makeStore().hit(randomUUID(), 60);
    expect(result.resetSeconds).toBeGreaterThan(0);
    expect(result.resetSeconds).toBeLessThanOrEqual(60);
  });
}

describe("MemoryRateLimitStore", () => {
  behavesLikeAFixedWindow(() => new MemoryRateLimitStore());

  it("starts a new window after it expires", async () => {
    vi.useFakeTimers();
    try {
      const store = new MemoryRateLimitStore();
      await store.hit("k", 1);
      await store.hit("k", 1);
      vi.advanceTimersByTime(1001);
      expect((await store.hit("k", 1)).count).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });
});

// Runs when a Redis is available (CI service, or `docker compose up -d redis` + REDIS_URL).
const redisUrl = process.env.TEST_REDIS_URL;
describe.skipIf(!redisUrl)("RedisRateLimitStore", () => {
  const redis = new Redis(redisUrl ?? "", { lazyConnect: true });
  afterAll(() => redis.quit());

  behavesLikeAFixedWindow(() => new RedisRateLimitStore(redis, `test:${randomUUID()}:`));

  it("always gives the key an expiry (never a permanent lockout)", async () => {
    const prefix = `test:${randomUUID()}:`;
    await new RedisRateLimitStore(redis, prefix).hit("k", 30);
    const ttl = await redis.ttl(`${prefix}k`);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(30);
  });
});
