import { defineConfig, devices } from "@playwright/test";

// Point BASE_URL at a deployed site (e.g. the Vercel URL) to run the smoke tests against it.
// Without it, Playwright builds and serves the app locally (production build, per the Next.js docs).
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  // Fail the whole run after 15 minutes so reporters still produce output.
  globalTimeout: 15 * 60 * 1000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        // CI builds in its own step first; locally we build here.
        command: isCI ? "npm run start" : "npm run build && npm run start",
        url: baseURL,
        reuseExistingServer: !isCI,
        timeout: 180 * 1000,
      },
});
