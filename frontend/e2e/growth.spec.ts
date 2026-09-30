import { expect, test } from "@playwright/test";

test.describe("growth, create & manage, and CTA", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("growth section shows its headings, stats and perks", async ({ page }) => {
    const growth = page.getByRole("region", { name: "Your Path to Professional Growth Starts Here!" });
    await growth.scrollIntoViewIfNeeded();
    await expect(growth.getByText("12K")).toBeVisible();
    await expect(growth.getByRole("heading", { name: "Create & Manage Courses Easily." })).toBeVisible();
    await expect(growth.getByText("Build a Community")).toBeVisible();
  });

  test("photos load after scrolling (lazy images)", async ({ page }) => {
    const growth = page.getByRole("region", { name: "Your Path to Professional Growth Starts Here!" });
    const creator = growth.getByAltText("Smiling creator with headphones holding a tablet").locator("visible=true");
    await creator.scrollIntoViewIfNeeded();
    await expect
      .poll(() => creator.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true);
  });

  test("desktop: stat cards sit next to the photos", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop layout only");
    const growth = page.getByRole("region", { name: "Your Path to Professional Growth Starts Here!" });
    await expect(growth.getByText("Total Revenue")).toBeVisible();
    await expect(growth.getByRole("progressbar", { name: "Learning Progress" })).toBeVisible();
  });

  test("CTA links to the register page", async ({ page }) => {
    const cta = page.getByRole("region", { name: "Unlock Your Potential as a Creator with ByteSpace" });
    await expect(cta.getByRole("link", { name: "Join as Creator" })).toHaveAttribute("href", "/register");
  });

  test("desktop: CTA shapes load", async ({ page, isMobile }) => {
    test.skip(isMobile, "shapes are hidden on mobile");
    const cta = page.getByRole("region", { name: "Unlock Your Potential as a Creator with ByteSpace" });
    await cta.scrollIntoViewIfNeeded();
    const shapes = cta.locator("img");
    await expect(shapes).toHaveCount(7);
    await expect
      .poll(() => shapes.evaluateAll((imgs) => imgs.every((i) => (i as HTMLImageElement).naturalWidth > 0)))
      .toBe(true);
  });
});
