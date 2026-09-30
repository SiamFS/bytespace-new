import { defineConfig } from "vitest/config";
import { testEnv } from "./test/testEnv.js";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    globalSetup: ["test/globalSetup.ts"],
    // Config is parsed at import time (src/config/env.ts), so tests get a complete environment.
    env: testEnv,
  },
});
