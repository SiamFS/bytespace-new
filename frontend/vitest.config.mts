import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Vite 8 resolves tsconfig `paths` (the `@/` alias) natively.
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // Unit tests only — Playwright specs in e2e/ use *.spec.ts and run separately.
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
