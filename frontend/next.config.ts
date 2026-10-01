import type { NextConfig } from "next";

// Express API the browser reaches through /api (same origin → first-party cookies, no CORS).
// Read at build time: set API_URL in the Vercel project before deploying.
// On Vercel (VERCEL=1) a missing value fails the build — the localhost fallback would ship a site
// whose every API call breaks.
if (process.env.VERCEL === "1" && !process.env.API_URL) {
  throw new Error("API_URL is not set. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.");
}
const apiUrl = (process.env.API_URL ?? "http://localhost:4000").replace(/\/+$/, "");
if (!/^https?:\/\/[^/]+$/.test(apiUrl)) {
  throw new Error(`API_URL must be an origin like https://api.example.com (no path), got "${apiUrl}"`);
}

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
    // an external rewrite — well above any API cold start.
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
