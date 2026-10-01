import { randomUUID } from "node:crypto";
import { expect, test } from "./test";

/**
 * Real browser → Next.js (/api rewrite) → Express → Postgres/Redis. Needs the API running
 * (`npm run dev` in backend/, or the CI full-stack job) and FULLSTACK=1:
 *   FULLSTACK=1 npx playwright test --grep @fullstack --project=desktop
 */
test.skip(!process.env.FULLSTACK, "needs the API — set FULLSTACK=1 with the backend running");
test.use({ mockSession: false });

test.describe("real auth flow @fullstack", () => {
  test.skip(({ isMobile }) => isMobile, "one browser is enough for the API round trips");

  test("register → verify email → signed in → log out → log in", async ({ page, context }) => {
    const email = `e2e-${randomUUID()}@example.com`;

    // Register: no session yet, "check your email" instead.
    await page.goto("/register");
    await page.getByLabel("Full Name").fill("Jamie Davis");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    expect((await context.cookies()).find((c) => c.name === "session")).toBeUndefined();
    // This API has no email service (no BREVO_API_KEY), so the page shows the link itself.
    const verifyHref = await page.getByRole("link", { name: "Verify your email" }).getAttribute("href");

    // Logging in before verifying is refused (right password).
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("Please verify your email first");

    // The link verifies, signs in and goes home.
    await page.goto(new URL(verifyHref!).pathname + new URL(verifyHref!).search);
    await expect(page.getByText("Email verified — welcome, Jamie!")).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
    const banner = page.getByRole("banner");
    await expect(banner.getByText("Hi, Jamie").filter({ visible: true })).toBeVisible();

    // The session cookie came through the Next.js rewrite, first-party and HttpOnly.
    const session = (await context.cookies()).find((c) => c.name === "session");
    expect(session).toMatchObject({ httpOnly: true, sameSite: "Lax", path: "/" });

    // Survives a reload (the navbar asks the API, not local state).
    await page.reload();
    await expect(banner.getByText("Hi, Jamie").filter({ visible: true })).toBeVisible();

    // Signed-in users are sent away from the auth pages (proxy.ts).
    await page.goto("/login");
    await expect(page).toHaveURL(/\/$/);

    // Log out
    await banner.getByRole("button", { name: "Log out" }).click();
    await expect(banner.getByRole("link", { name: "Sign In" })).toBeVisible();
    expect((await context.cookies()).find((c) => c.name === "session")).toBeUndefined();

    // Wrong password, then the right one
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("wrong-pass1");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.locator("form").getByRole("alert")).toHaveText("Invalid email or password.");

    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(banner.getByText("Hi, Jamie").filter({ visible: true })).toBeVisible();
  });

  test("an email can only register once", async ({ page, request }) => {
    const email = `e2e-${randomUUID()}@example.com`;
    const first = await request.post("/api/auth/register", {
      data: { name: "Jamie Davis", email, password: "secret123" },
    });
    expect(first.status()).toBe(201);

    await page.goto("/register");
    await page.getByLabel("Full Name").fill("Jamie Davis");
    await page.getByLabel("Email").fill(email.toUpperCase());
    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("An account with this email already exists.")).toBeVisible();
  });

  test("API responses are never cacheable", async ({ request }) => {
    const res = await request.get("/api/auth/me");
    expect(res.status()).toBe(200);
    expect(res.headers()["cache-control"]).toBe("no-store");
  });
});
