import { makeAxeBuilder } from "./axe";
import { expect, test } from "./test";

for (const [path, title] of [
  ["/privacy", "Privacy Policy"],
  ["/terms", "Terms of Service"],
] as const) {
  test.describe(`${title} page`, () => {
    test(`loads with its heading @smoke`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await expect(page).toHaveTitle(`${title} | ByteSpace`);
    });

    test("is reachable from the footer", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("contentinfo").getByRole("link", { name: title }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
    });

    test("has no automatically detectable accessibility violations", async ({ page }) => {
      await page.goto(path);
      const results = await makeAxeBuilder(page).analyze();
      expect(results.violations).toEqual([]);
    });
  });
}
