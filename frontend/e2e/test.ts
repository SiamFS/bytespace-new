import { expect, test as base } from "@playwright/test";

/**
 * Every spec imports `test` from here. Pages ask the API who is signed in (`/api/auth/me`);
 * frontend-only runs have no API, so that call is answered with a guest session by default.
 * Full-stack specs opt out with `test.use({ mockSession: false })` and hit the real API.
 * (Routes added later in a test take precedence — Playwright matches the newest route first.)
 */
export const test = base.extend<{ mockSession: boolean }>({
  mockSession: [true, { option: true }],
  // The fixture callback is named runTest, not `use`, so the React Hooks lint rule leaves it alone.
  page: async ({ page, mockSession }, runTest) => {
    if (mockSession) {
      await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user: null } }));
    }
    await runTest(page);
  },
});

export { expect };
