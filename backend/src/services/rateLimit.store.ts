import type { Redis } from "ioredis";

export type HitResult = {
  /** Requests counted in the current window, including this one. */
  count: number;
  /** Seconds until the window resets. */
  resetSeconds: number;
};

/** Fixed-window counter: `hit` counts a request for `key` and reports the window state. */
export type RateLimitStore = {
  hit(key: string, windowSeconds: number): Promise<HitResult>;
};

/** In-process store — for development, tests, and single-instance deploys without Redis. */
export class MemoryRateLimitStore implements RateLimitStore {
  private readonly windows = new Map<string, { count: number; resetAt: number }>();

  async hit(key: string, windowSeconds: number): Promise<HitResult> {
    const now = Date.now();
    let window = this.windows.get(key);
    if (!window || window.resetAt <= now) {
      window = { count: 0, resetAt: now + windowSeconds * 1000 };
      this.windows.set(key, window);
      this.sweep(now);
    }
    window.count += 1;
    return { count: window.count, resetSeconds: Math.ceil((window.resetAt - now) / 1000) };
  }

  /** Drop expired windows so the map can't grow without bound. */
  private sweep(now: number) {
    if (this.windows.size < 10_000) return;
    for (const [key, window] of this.windows) if (window.resetAt <= now) this.windows.delete(key);
  }
}

/**
 * Redis store (Upstash in production). One MULTI transaction: create the key with its expiry
 * only if missing (SET NX EX — so a key can never live without a TTL), increment, read the TTL.
 */
export class RedisRateLimitStore implements RateLimitStore {
  constructor(
    private readonly redis: Redis,
    private readonly prefix = "rl:",
  ) {}

  async hit(key: string, windowSeconds: number): Promise<HitResult> {
    const fullKey = this.prefix + key;
    const results = await this.redis
      .multi()
      .set(fullKey, 0, "EX", windowSeconds, "NX")
      .incr(fullKey)
      .ttl(fullKey)
      .exec();
    if (!results) throw new Error("Rate limit transaction was aborted");
    for (const [error] of results) if (error) throw error;
    const count = Number(results[1]![1]);
    const ttl = Number(results[2]![1]);
    return { count, resetSeconds: ttl > 0 ? ttl : windowSeconds };
  }
}
