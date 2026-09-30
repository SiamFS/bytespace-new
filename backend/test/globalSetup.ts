import { execSync } from "node:child_process";
import { testEnv } from "./testEnv.js";

/**
 * Runs once before the tests: brings the test database up to the latest migration, so tests
 * always run against the real schema (the same command production runs on start).
 */
export default function setup() {
  execSync("npx prisma migrate deploy", { stdio: "inherit", env: { ...process.env, ...testEnv } });
}
