import { expect, test } from "@playwright/test";

test.describe("courses and learning paths", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows six course cards under Featured", async ({ page }) => {
    const grid = page.getByRole("list", { name: "Courses" });
    await expect(grid.getByRole("article")).toHaveCount(6);
    await expect(page.getByRole("button", { name: "Featured" })).toHaveAttribute("aria-pressed", "true");
  });

  test("category chips filter the grid, with an empty state", async ({ page }) => {
    await page.getByRole("button", { name: "UI/UX Design" }).click();
    const grid = page.getByRole("list", { name: "Courses" });
    await expect(grid.getByRole("article")).toHaveCount(1);
    await expect(grid.getByRole("heading", { name: "Learn Figma from Basic" })).toBeVisible();

    await page.getByRole("button", { name: "Music" }).click();
    await expect(page.getByText("No courses in Music yet.")).toBeVisible();

    await page.getByRole("button", { name: "Show featured courses" }).click();
    await expect(grid.getByRole("article")).toHaveCount(6);
  });

  test("course images load", async ({ page }) => {
    const images = page.getByRole("list", { name: "Courses" }).locator("article img").first();
    await images.scrollIntoViewIfNeeded();
    await expect
      .poll(() => images.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true);
  });

  test("long course titles stay on one line (truncated on desktop)", async ({ page, isMobile }) => {
    const title = page.getByRole("heading", { name: "Balancing Productivity and Self-Care" });
    const [lineHeight, height, overflowing] = await title.evaluate((el) => [
      parseFloat(getComputedStyle(el).lineHeight),
      el.getBoundingClientRect().height,
      el.scrollWidth > el.clientWidth,
    ]);
    expect(height).toBeLessThanOrEqual(lineHeight + 1);
    // Desktop cards are 373px wide, so this title is cut off with an ellipsis (as in Figma).
    if (!isMobile) expect(overflowing).toBe(true);
  });

  test("learning path tiles link to their category", async ({ page }) => {
    const region = page.getByRole("region", { name: "Explore Diverse Learning Paths at Bytespace" });
    await expect(region.getByRole("link")).toHaveCount(6);
    await expect(region.getByRole("link", { name: "IT & Software" })).toHaveAttribute(
      "href",
      "/courses?category=it-software",
    );
  });

  test("course cards fit inside the viewport", async ({ page }) => {
    const width = await page.evaluate(() => window.innerWidth);
    const cards = page.getByRole("list", { name: "Courses" }).getByRole("article");
    for (const card of await cards.all()) {
      const box = await card.boundingBox();
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
  });

  test("page has no horizontal overflow", async ({ page }) => {
    const [scrollWidth, innerWidth] = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      window.innerWidth,
    ]);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });
});
