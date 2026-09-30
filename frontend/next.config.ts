import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // E2E only (E2E=1 is set by Playwright's webServer and the CI job). `next start`'s image
    // optimizer hangs on an image whose first optimization request was aborted, and E2E tests
    // leave pages mid-load all the time, so later tests waited forever on those images.
    // Production (Vercel) keeps full optimization — Vercel optimizes images on its own service.
    unoptimized: process.env.E2E === "1",
  },
};

export default nextConfig;
