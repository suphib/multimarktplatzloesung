import { test, expect } from "@playwright/test";

test.describe("Theme-System", () => {
  test.use({ locale: "de-DE" });

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/search");
    await page.evaluate(() => localStorage.removeItem("theme"));
    await page.reload();
    await page.waitForLoadState("networkidle");
  });

  test.describe("Theme-Wechsel", () => {
    test("sollte Standard-Theme (Schlicht) ohne Theme-Klasse laden", async ({
      page,
    }) => {
      await page.goto("/search");
      await expect(page.locator("html")).not.toHaveClass(/dark/);
      await expect(page.locator("html")).not.toHaveClass(/modern/);
    });

    test("sollte auf Dunkel wechseln und dark-Klasse setzen", async ({
      page,
    }) => {
      await page.goto("/search");
      // Click the dark theme button (Moon icon)
      await page.getByTitle("Dunkel").click();
      await expect(page.locator("html")).toHaveClass(/dark/);
      await expect(page.locator("html")).not.toHaveClass(/modern/);
    });

    test("sollte auf Modern wechseln und modern-Klasse setzen", async ({
      page,
    }) => {
      await page.goto("/search");
      // Click the modern theme button (Sparkles icon)
      await page.getByTitle("Modern").click();
      await expect(page.locator("html")).toHaveClass(/modern/);
      await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
    });
  });

  test.describe("Persistenz", () => {
    test("sollte Theme nach Seitenreload beibehalten", async ({ page }) => {
      await page.goto("/search");
      await page.getByTitle("Dunkel").click();
      await expect(page.locator("html")).toHaveClass(/dark/);

      // Reload page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Theme should persist via localStorage
      await expect(page.locator("html")).toHaveClass(/dark/);
      const stored = await page.evaluate(() => localStorage.getItem("theme"));
      expect(stored).toBe("dunkel");
    });

    test("sollte Theme auf allen Seiten anwenden", async ({ page }) => {
      await page.goto("/search");
      await page.getByTitle("Dunkel").click();
      await expect(page.locator("html")).toHaveClass(/dark/);

      // Navigate to admin
      await page.goto("/admin/dashboard");
      await page.waitForLoadState("networkidle");
      await expect(page.locator("html")).toHaveClass(/dark/);
    });
  });

  test.describe("Visuell", () => {
    test("sollte dunklen Hintergrund im Dunkel-Theme haben", async ({
      page,
    }) => {
      await page.goto("/search");
      await page.getByTitle("Dunkel").click();

      // Verify body has dark background color
      const bgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      // gray-900 is approximately rgb(17, 24, 39)
      expect(bgColor).not.toBe("rgb(255, 255, 255)");
    });

    test("sollte Gradient-Header im Modern-Theme haben", async ({ page }) => {
      await page.goto("/search");
      await page.getByTitle("Modern").click();

      const headerBg = await page.evaluate(() => {
        const header = document.querySelector("header");
        return header
          ? window.getComputedStyle(header).backgroundImage
          : "none";
      });
      expect(headerBg).toContain("gradient");
    });

    test("sollte ThemeSelector auf Mobile sichtbar sein", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/search");

      // ThemeSelector should be visible (icons only on mobile)
      await expect(page.getByTitle("Schlicht")).toBeVisible();
      await expect(page.getByTitle("Dunkel")).toBeVisible();
      await expect(page.getByTitle("Modern")).toBeVisible();
    });
  });
});
