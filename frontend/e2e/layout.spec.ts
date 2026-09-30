import { expect, test } from "./test";

test.describe("site header and footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has banner and contentinfo landmarks", async ({ page }) => {
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("desktop: shows the main navigation with Home active", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop layout only");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Courses" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Cart" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
  });

  test("mobile: navigation lives in the menu", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile layout only");
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();

    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("navigation", { name: "Mobile" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: "Courses" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("footer newsletter confirms a subscription", async ({ page }) => {
    const footer = page.getByRole("contentinfo");
    await footer.getByRole("textbox", { name: "Email address" }).fill("student@bytespace.dev");
    await footer.getByRole("button", { name: "Search" }).click();
    await expect(footer.getByRole("status")).toHaveText("Thanks for subscribing!");
  });

  test("footer newsletter blocks an invalid email", async ({ page }) => {
    const footer = page.getByRole("contentinfo");
    const email = footer.getByRole("textbox", { name: "Email address" });
    await email.fill("not-an-email");
    await footer.getByRole("button", { name: "Search" }).click();
    await expect(footer.getByRole("status")).not.toHaveText("Thanks for subscribing!");
    expect(await email.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
  });
});
