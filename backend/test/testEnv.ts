/**
 * Environment for the test run, shared by vitest.config.ts (workers) and globalSetup.ts
 * (migrations). DATABASE_URL can be overridden — CI points it at its Postgres service.
 */
export const testEnv = {
  NODE_ENV: "test",
  LOG_LEVEL: "silent",
  PORT: "4000",
  CORS_ORIGINS: "http://localhost:3000",
  TRUST_PROXY: "0",
  DATABASE_URL:
    process.env.DATABASE_URL ?? "postgresql://bytespace:bytespace@localhost:5433/bytespace_test?schema=public",
};
