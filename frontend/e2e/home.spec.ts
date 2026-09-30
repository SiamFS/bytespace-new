import { expect, test } from "@playwright/test";
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
    expect(consoleErrors).toEqual([]);
  });

  test("has no automatically detectable accessibility violations", async ({ page }) => {
    await page.goto("/");

    const results = await makeAxeBuilder(page).analyze();

    expect(results.violations).toEqual([]);
  });
});
