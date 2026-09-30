import type { NextConfig } from "next";

// Express API the browser reaches through /api (same origin → first-party cookies, no CORS).
// Read at build time: set API_URL in the Vercel project before deploying.
const apiUrl = (process.env.API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  images: {
    // E2E only (E2E=1 is set by Playwright's webServer and the CI job). `next start`'s image
    // optimizer hangs on an image whose first optimization request was aborted, and E2E tests
    // leave pages mid-load all the time, so later tests waited forever on those images.
    // Production (Vercel) keeps full optimization — Vercel optimizes images on its own service.
    unoptimized: process.env.E2E === "1",
  },
  redirects() {
    return [
      // Figma calls the page "Register"; /signup is the common name people type.
      { source: "/signup", destination: "/register", permanent: true },
    ];
  },
  rewrites() {
    // Proxy /api/* to Express, which mounts everything under /api. Vercel waits up to 120s for
    // an external rewrite — longer than Render's ~1 minute cold start.
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
