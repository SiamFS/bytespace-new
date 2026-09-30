/**
 * Environment for the test run, shared by vitest.config.ts (workers) and globalSetup.ts
 * (migrations). DATABASE_URL / REDIS_URL can be overridden — CI points them at its services.
 */
export const testEnv: Record<string, string> = {
  NODE_ENV: "test",
  LOG_LEVEL: "silent",
  PORT: "4000",
  CORS_ORIGINS: "http://localhost:3000",
  TRUST_PROXY: "0",
  JWT_SECRET: "test-secret-that-is-at-least-32-characters-long",
  // Minimum cost: tests hash dozens of passwords.
  BCRYPT_ROUNDS: "4",
  DATABASE_URL:
    process.env.DATABASE_URL ?? "postgresql://bytespace:bytespace@localhost:5433/bytespace_test?schema=public",
  // Only the Redis store tests use this; the app under test gets an in-memory store.
  ...(process.env.REDIS_URL ? { TEST_REDIS_URL: process.env.REDIS_URL } : {}),
};
