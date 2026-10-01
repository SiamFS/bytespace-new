import { expect, test } from "./test";

test.describe("courses and learning paths", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows six course cards under Featured", async ({ page, isMobile }) => {
    const grid = page.getByRole("list", { name: "Courses" });
    await expect(page.getByRole("button", { name: "Featured" })).toHaveAttribute("aria-pressed", "true");
    if (isMobile) {
      // Phones show three until "Show all" (our design).
      await expect(grid.getByRole("article")).toHaveCount(3);
      await page.getByRole("button", { name: "Show all 6 courses" }).click();
    } else {
      await expect(page.getByRole("button", { name: "Show all 6 courses" })).toBeHidden();
    }
    await expect(grid.getByRole("article")).toHaveCount(6);
  });

  test("category chips filter the grid, with an empty state", async ({ page, isMobile }) => {
    await page.getByRole("button", { name: "UI/UX Design" }).click();
    const grid = page.getByRole("list", { name: "Courses" });
    await expect(grid.getByRole("article")).toHaveCount(1);
    await expect(grid.getByRole("heading", { name: "Learn Figma from Basic" })).toBeVisible();

    await page.getByRole("button", { name: "Music" }).click();
    await expect(page.getByText("No courses in Music yet.")).toBeVisible();

    await page.getByRole("button", { name: "Show featured courses" }).click();
    await expect(grid.getByRole("article")).toHaveCount(isMobile ? 3 : 6);
  });

  test("mobile: chips are one swipeable row", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile layout only");
    const group = page.getByRole("group", { name: "Course categories" });
    const [scrollWidth, clientWidth] = await group.evaluate((el) => [el.scrollWidth, el.clientWidth]);
    expect(scrollWidth).toBeGreaterThan(clientWidth);
    const tops = await group.getByRole("button").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
    expect(new Set(tops).size).toBe(1);
  });

  test("course image badges stay on one line inside the image", async ({ page }) => {
    const card = page.getByRole("list", { name: "Courses" }).getByRole("article").first();
    await card.scrollIntoViewIfNeeded();
    const result = await card.evaluate((article) => {
      const image = article.querySelector(".\\@container")!.getBoundingClientRect();
      return Array.from(article.querySelectorAll(".\\@container li span")).map((badge) => {
        const box = badge.getBoundingClientRect();
        return { oneLine: box.height < 30, inside: box.right <= image.right + 0.5 };
      });
    });
    expect(result).toHaveLength(3);
    for (const badge of result) expect(badge).toEqual({ oneLine: true, inside: true });
  });

  test("course images load", async ({ page }) => {
    const images = page.getByRole("list", { name: "Courses" }).locator("article img").first();
    await images.scrollIntoViewIfNeeded();
    await expect
      .poll(() => images.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true);
  });

  test("long course titles stay on one line (truncated on desktop)", async ({ page, isMobile }) => {
    if (isMobile) await page.getByRole("button", { name: "Show all 6 courses" }).click();
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
