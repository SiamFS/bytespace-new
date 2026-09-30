import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, type Plugin } from "vitest/config";

// Next.js turns static image imports into { src, width, height } objects; Vite returns a
// plain URL string, which makes next/image throw in tests. Mirror the Next.js shape.
function staticImageStub(): Plugin {
  return {
    name: "static-image-stub",
    enforce: "pre",
    load(id) {
      const file = id.split("?")[0];
      if (/\.(png|jpe?g|webp|avif|gif|svg)$/.test(file)) {
        return `export default { src: ${JSON.stringify("/" + path.basename(file))}, width: 100, height: 100 };`;
      }
    },
  };
}

export default defineConfig({
  plugins: [staticImageStub(), react()],
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
