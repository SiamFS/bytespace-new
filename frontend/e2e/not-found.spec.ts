import { expect, test } from "./test";
import { makeAxeBuilder } from "./axe";

const missing = "/this-page-does-not-exist";

test.describe("404 page", () => {
  test("returns 404 with the custom page @smoke", async ({ page }) => {
    const response = await page.goto(missing);

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("The page you are looking for doesn’t exist");
    await expect(page.getByText("404", { exact: true })).toBeVisible();
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("Back to Home returns to the landing page", async ({ page }) => {
    await page.goto(missing);
    await page.getByRole("link", { name: "Back to Home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Get Access to Hundreds Courses Available");
  });

  test("desktop: matches the Figma frame layout", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop layout only");
    await page.goto(missing);
    await page.evaluate(() => document.fonts.ready);
    const box = async (locator: ReturnType<typeof page.locator>) => (await locator.boundingBox())!;

    const section = await box(page.getByRole("region", { name: "The page you are looking for doesn’t exist" }));
    expect(section.height).toBe(957);
    const heading = await box(page.getByRole("heading", { level: 1 }));
    expect(Math.abs(heading.y - 521)).toBeLessThanOrEqual(2);
    const paragraph = await box(page.getByText("Try to use a correct url"));
    expect(paragraph.height).toBeLessThan(30); // one line (18px × 160%), like Figma
    const button = await box(page.getByRole("link", { name: "Back to Home" }));
    expect(Math.abs(button.y - 786)).toBeLessThanOrEqual(2);
    const footer = await box(page.getByRole("contentinfo"));
    expect(footer.y).toBe(960);
  });

  test("has no automatically detectable accessibility violations", async ({ page }) => {
    await page.goto(missing);
    const results = await makeAxeBuilder(page).analyze();
    expect(results.violations).toEqual([]);
  });
});
