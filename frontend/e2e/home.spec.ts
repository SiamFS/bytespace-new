import { expect, test } from "./test";
import { makeAxeBuilder } from "./axe";

test.describe("home page", () => {
  test("loads without errors @smoke", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/ByteSpace/);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("links the ByteSpace icons", async ({ page, request }) => {
    await page.goto("/");
    for (const rel of ["icon", "apple-touch-icon"]) {
      const href = await page.locator(`link[rel="${rel}"]`).first().getAttribute("href");
      expect(href).toBeTruthy();
      expect((await request.get(href!)).status()).toBe(200);
    }
  });

  test("has no automatically detectable accessibility violations", async ({ page }) => {
    await page.goto("/");

    const results = await makeAxeBuilder(page).analyze();

    expect(results.violations).toEqual([]);
  });
});
