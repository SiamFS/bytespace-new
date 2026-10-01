import type { Page } from "@playwright/test";
import { expect, test } from "./test";
import { makeAxeBuilder } from "./axe";

const json = (status: number, body: unknown, headers: Record<string, string> = {}) => ({
  status,
  contentType: "application/json",
  headers,
  body: JSON.stringify(body),
});

async function gotoReady(page: Page, path: string) {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

test.describe("auth pages", () => {
  for (const [path, title] of [
    ["/login", "Welcome Back"],
    ["/register", "Welcome to ByteSpace"],
  ] as const) {
    test(`${path} loads without errors @smoke`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await expect(page.getByRole("link", { name: "ByteSpace home" })).toHaveAttribute("href", "/");
      expect(consoleErrors).toEqual([]);
    });

    test(`${path} has no automatically detectable accessibility violations`, async ({ page }) => {
      await gotoReady(page, path);
      const results = await makeAxeBuilder(page).analyze();
      expect(results.violations).toEqual([]);
    });

    test(`${path} fits the viewport`, async ({ page }) => {
      await gotoReady(page, path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(overflow).toBe(false);
    });
  }

  test("the logo goes back to the landing page", async ({ page }) => {
    await gotoReady(page, "/register");
    await page.getByRole("link", { name: "ByteSpace home" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("/signup permanently redirects to /register", async ({ page, request }) => {
    const response = await request.get("/signup", { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    await page.goto("/signup");
    await expect(page).toHaveURL(/\/register$/);
  });

  test("the pages link to each other, and the navbar links to them", async ({ page, isMobile }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Create an account" }).click();
    await expect(page).toHaveURL(/\/register$/);
    await page.getByRole("link", { name: "Login" }).click();
    await expect(page).toHaveURL(/\/login$/);

    test.skip(isMobile, "navbar auth links are in the mobile menu");
    await page.goto("/");
    await page.getByRole("banner").getByRole("link", { name: "Join Us" }).click();
    await expect(page).toHaveURL(/\/register$/);
  });
});

test.describe("desktop layout matches Figma (1440)", () => {
  test.skip(({ isMobile }) => isMobile, "desktop layout only");

  const near = (actual: number, expected: number, tolerance = 2) =>
    expect(Math.abs(actual - expected), `${actual} vs ${expected}`).toBeLessThanOrEqual(tolerance);

  test("login", async ({ page }) => {
    await gotoReady(page, "/login");
    const box = async (locator: ReturnType<Page["locator"]>) => (await locator.boundingBox())!;

    const card = await box(page.getByRole("region", { name: "Welcome Back" }));
    expect([card.x, card.y, card.width, card.height]).toEqual([741, 120, 579, 784]);
    const email = await box(page.getByLabel("Email"));
    near(email.y, 340);
    const button = await box(page.getByRole("button", { name: "Sign In" }));
    near(button.x, 1153);
    near(button.y, 505);
    const facebook = await box(page.getByRole("link", { name: "Continue with Facebook" }));
    near(facebook.x, 951);
    near(facebook.y, 693);
    const prompt = await box(page.getByText("New user?"));
    near(prompt.y, 838);
  });

  test("register", async ({ page }) => {
    await gotoReady(page, "/register");
    const box = async (locator: ReturnType<Page["locator"]>) => (await locator.boundingBox())!;

    const heading = await box(page.getByRole("heading", { level: 1 }));
    near(heading.height, 106); // two lines, as in Figma
    const button = await box(page.getByRole("button", { name: "Continue" }));
    near(button.y, 659);
    const prompt = await box(page.getByText("Already have an account?"));
    near(prompt.y, 827);
  });

  test("decorative collage is visible but not focusable", async ({ page }) => {
    await gotoReady(page, "/login");
    await expect(page.getByText("Build Digital Asset")).toBeVisible();
    await expect(page.locator("[inert]")).toHaveCount(1);
    // Tab order: logo → email → password → submit → social → switch link (never the collage).
    const order: string[] = [];
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press("Tab");
      order.push(await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent ?? ""));
    }
    expect(order).toEqual([
      "ByteSpace home",
      "",
      "",
      "Sign In",
      "Continue with Facebook",
      "Continue with Google",
      "Create an account",
    ]);
  });
});

test.describe("login form", () => {
  test("validates before sending anything", async ({ page }) => {
    let called = false;
    await page.route("**/api/auth/login", (route) => {
      called = true;
      return route.fulfill(json(200, {}));
    });
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("Enter your email")).toBeVisible();
    await expect(page.getByText("Enter your password")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeFocused();
    expect(called).toBe(false);
  });

  test("signs in and returns to the ?next= page", async ({ page }) => {
    await page.route("**/api/auth/login", (route) => route.fulfill(json(200, { user: { id: "1" } })));
    await page.goto("/login?next=/register");
    // /register is an auth page → never a "next" target, so this lands on "/".
    await page.getByLabel("Email").fill("Jamie@Example.com");
    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("shows the generic message for wrong credentials", async ({ page }) => {
    await page.route("**/api/auth/login", (route) =>
      route.fulfill(json(401, { error: { code: "UNAUTHORIZED", message: "x" } })),
    );
    await page.goto("/login");
    await page.getByLabel("Email").fill("jamie@example.com");
    await page.getByLabel("Password").fill("wrong");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.locator("form").getByRole("alert")).toHaveText("Invalid email or password.");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("explains a slow (waking) server and stays usable", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 6000));
      await route.fulfill(json(500, { error: { code: "INTERNAL_ERROR", message: "x" } }));
    });
    await page.goto("/login");
    await page.getByLabel("Email").fill("jamie@example.com");
    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByRole("button", { name: "Signing in…" })).toBeDisabled();
    await expect(page.locator("form").getByRole("status")).toContainText("Waking up the server", { timeout: 8000 });
    await expect(page.locator("form").getByRole("alert")).toHaveText("Something went wrong. Please try again.", { timeout: 8000 });
    await expect(page.getByRole("button", { name: "Sign In" })).toBeEnabled();
  });
});

test.describe("Google sign-in", () => {
  test("the Google button navigates to the API, which hands over to Google", async ({ page }) => {
    // Stand-in for the API's redirect to accounts.google.com (no real Google in E2E).
    await page.route("**/api/auth/google", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "<h1>Google sign-in</h1>" }),
    );
    await page.goto("/login");
    await page.getByRole("link", { name: "Continue with Google" }).click();
    await expect(page).toHaveURL(/\/api\/auth\/google$/);
    await expect(page.getByRole("heading", { name: "Google sign-in" })).toBeVisible();
  });

  test("a failed Google sign-in is explained on the login page", async ({ page }) => {
    await page.goto("/login?error=google_cancelled");
    await expect(page.locator("form").getByRole("alert")).toHaveText("Google sign-in was cancelled.");
  });
});

test.describe("register form", () => {
  test("shows field rules", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full Name").fill("   ");
    await page.getByLabel("Email").fill("nope");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Enter your full name")).toBeVisible();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText("Use at least 8 characters")).toBeVisible();
  });

  test("puts a duplicate email on the email field", async ({ page }) => {
    await page.route("**/api/auth/register", (route) =>
      route.fulfill(json(409, { error: { code: "CONFLICT", message: "x" } })),
    );
    await page.goto("/register");
    await page.getByLabel("Full Name").fill("Jamie Davis");
    await page.getByLabel("Email").fill("jamie@example.com");
    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("An account with this email already exists.")).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
  });

  test("creates the account and asks to check the email", async ({ page }) => {
    await page.route("**/api/auth/register", async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        name: "Jamie Davis",
        email: "jamie@example.com",
        password: "secret123",
      });
      await route.fulfill(json(201, { status: "verification_sent", email: "jamie@example.com", emailSent: true }));
    });
    await page.goto("/register");
    await page.getByLabel("Full Name").fill(" Jamie Davis ");
    await page.getByLabel("Email").fill("JAMIE@example.com");
    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
  });
});

test.describe("verify email page", () => {
  test("verifies the link, signs in and goes home", async ({ page }) => {
    await page.route("**/api/auth/verify-email", (route) =>
      route.fulfill(json(200, { user: { id: "1", name: "Jamie Davis", email: "jamie@example.com", createdAt: "2026-10-01T00:00:00.000Z" } })),
    );
    await page.goto("/verify-email?token=abc");
    await expect(page.getByText("Email verified — welcome, Jamie!")).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });

  test("explains an expired link", async ({ page }) => {
    await page.route("**/api/auth/verify-email", (route) =>
      route.fulfill(json(400, { error: { code: "INVALID_TOKEN", message: "x" } })),
    );
    await page.goto("/verify-email?token=old");
    await expect(page.getByText(/invalid or has expired/)).toBeVisible();
  });

  test("has no automatically detectable accessibility violations", async ({ page }) => {
    await page.goto("/verify-email");
    await expect(page.getByText(/link is incomplete/)).toBeVisible();
    const results = await makeAxeBuilder(page).analyze();
    expect(results.violations).toEqual([]);
  });
});
