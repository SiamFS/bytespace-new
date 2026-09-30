import { expect, test, type Page } from "@playwright/test";

const hero = (page: Page) => page.getByRole("region", { name: "Get Access to Hundreds Courses Available" });

test.describe("hero", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows the heading and search", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "Get Access to Hundreds Courses Available" }),
    ).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "Search courses" })).toBeVisible();
  });

  test("search submits the query to /courses?q=", async ({ page }) => {
    await page.getByRole("searchbox", { name: "Search courses" }).fill("ui design");
    await page.getByRole("search").getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/courses\?q=ui\+design$/);
  });

  test("student photo loads", async ({ page }) => {
    const photo = hero(page).getByAltText("Smiling student with headphones holding a laptop").locator("visible=true");
    await expect(photo).toBeVisible();
    expect(await photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  });

  test("desktop: stat cards are shown", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop layout only");
    await expect(hero(page).getByRole("progressbar", { name: "Learning Progress" })).toBeVisible();
    await expect(hero(page).getByText("UI/UX Design")).toBeVisible();
    await expect(hero(page).getByText("Happy Students")).toBeVisible();
  });

  test("mobile: decorative stage is hidden and nothing overflows", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile layout only");
    await expect(hero(page).getByRole("progressbar", { name: "Learning Progress" })).toBeHidden();
    const [scrollWidth, innerWidth] = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      window.innerWidth,
    ]);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });

  test("partner logos are shown", async ({ page }) => {
    const partners = page.getByRole("region", { name: "Our partners" });
    await expect(partners.getByRole("img", { name: "Logoipsum" })).toHaveCount(5);
  });
});
