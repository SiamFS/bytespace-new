import { expect, test } from "@playwright/test";

test.describe("testimonials", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows three testimonials with loaded avatars", async ({ page }) => {
    const section = page.getByRole("region", { name: "Discover What Our Community Is Saying" });
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole("figure")).toHaveCount(3);
    await expect(section.getByText("Inspired Creator")).toBeVisible();
    // Avatars are lazy — on mobile the cards are stacked, so scroll to each one.
    for (const avatar of await section.locator("img").all()) {
      await avatar.scrollIntoViewIfNeeded();
      await expect.poll(() => avatar.evaluate((img: HTMLImageElement) => img.naturalWidth > 0)).toBe(true);
    }
  });

  test("cards fit inside the viewport", async ({ page }) => {
    const width = page.viewportSize()!.width;
    const cards = page.getByRole("region", { name: "Discover What Our Community Is Saying" }).getByRole("figure");
    for (const box of await cards.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().right))) {
      expect(box).toBeLessThanOrEqual(width);
    }
  });

  test("desktop: cards keep their natural heights", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop layout only");
    const cards = page.getByRole("region", { name: "Discover What Our Community Is Saying" }).getByRole("listitem");
    const heights = await cards.evaluateAll((els) => els.map((el) => el.firstElementChild!.getBoundingClientRect().height));
    expect(new Set(heights).size).toBeGreaterThan(1);
  });
});
