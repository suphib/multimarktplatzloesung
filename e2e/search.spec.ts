import { test, expect } from "@playwright/test";

// App detects browser locale; Playwright Chromium defaults to English.
// Use locale: 'de-DE' for German tests, or match English text for default.

test.describe("Artikelsuche", () => {
  test.use({ locale: "de-DE" });

  test("sollte die Suchseite laden", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByText("KI-gestützte Beschaffung")).toBeVisible({ timeout: 15000 });
  });

  test("sollte nach Artikeln suchen koennen", async ({ page }) => {
    await page.goto("/search");
    const input = page.getByPlaceholder(/Artikel suchen/);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill("Laptop");
    await page.getByRole("button", { name: /Suchen/ }).click();
    await expect(page).toHaveURL(/\/results/, { timeout: 15000 });
  });
});

test.describe("Rahmenvertrags-Artikel", () => {
  test.use({ locale: "de-DE" });

  test("sollte Rahmenvertrag-Badge bei Suchergebnissen anzeigen", async ({ page }) => {
    await page.goto("/search");
    const input = page.getByPlaceholder(/Artikel suchen/);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill("Laptop");
    await page.getByRole("button", { name: /Suchen/ }).click();
    await expect(page).toHaveURL(/\/results/, { timeout: 15000 });

    // Rahmenvertrag badge should appear in results (green badge)
    await expect(page.getByText("Rahmenvertrag").first()).toBeVisible({ timeout: 15000 });
  });

  test("sollte Rahmenvertrags-Artikel vor Marktplatz-Artikeln anzeigen", async ({ page }) => {
    await page.goto("/search");
    const input = page.getByPlaceholder(/Artikel suchen/);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill("Laptop");
    await page.getByRole("button", { name: /Suchen/ }).click();
    await expect(page).toHaveURL(/\/results/, { timeout: 15000 });

    // Wait for results to render
    await expect(page.getByText("Rahmenvertrag").first()).toBeVisible({ timeout: 15000 });

    // First article card's title should indicate a Rahmenvertrag item
    const cards = page.locator('[class*="rounded-xl"][class*="border"]').filter({ has: page.locator('h3') });
    const firstCardTitle = cards.first().locator('h3');
    await expect(firstCardTitle).toContainText("Rahmenvertrag");
  });

  test("sollte Rahmenvertrag in Aggregations-Badges zeigen", async ({ page }) => {
    await page.goto("/search");
    const input = page.getByPlaceholder(/Artikel suchen/);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill("Laptop");
    await page.getByRole("button", { name: /Suchen/ }).click();
    await expect(page).toHaveURL(/\/results/, { timeout: 15000 });

    // Marketplace aggregation should include Rahmenvertrag with count
    await expect(page.getByText(/Rahmenvertrag \(\d+\)/)).toBeVisible({ timeout: 15000 });
  });

  test("sollte Salzsaeure aus Rahmenvertrag und Marktplatz finden", async ({ page }) => {
    await page.goto("/search");
    const input = page.getByPlaceholder(/Artikel suchen/);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill("Salz");
    await page.getByRole("button", { name: /Suchen/ }).click();
    await expect(page).toHaveURL(/\/results/, { timeout: 15000 });

    // Should have results from both sources
    await expect(page.getByText("Rahmenvertrag").first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Mercateo").first()).toBeVisible({ timeout: 15000 });
  });

  test("sollte gruene Badge-Farbe fuer Rahmenvertrag haben", async ({ page }) => {
    await page.goto("/search");
    const input = page.getByPlaceholder(/Artikel suchen/);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill("Laptop");
    await page.getByRole("button", { name: /Suchen/ }).click();
    await expect(page).toHaveURL(/\/results/, { timeout: 15000 });

    // Green badge for Rahmenvertrag inside the desktop badge container
    const greenBadge = page.locator('[class*="sm:block"] .bg-green-100.text-green-800').first();
    await expect(greenBadge).toBeVisible({ timeout: 15000 });
    await expect(greenBadge).toContainText("Rahmenvertrag");
  });
});

test.describe("Rahmenvertrags-Artikel (Mobile)", () => {
  test.use({ viewport: { width: 375, height: 812 }, locale: "de-DE" });

  test("sollte Rahmenvertrag-Badge auf Mobile anzeigen", async ({ page }) => {
    await page.goto("/search");
    const input = page.getByPlaceholder(/Artikel suchen/);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill("Laptop");
    await page.getByRole("button", { name: /Suchen/ }).click();
    await expect(page).toHaveURL(/\/results/, { timeout: 15000 });

    // Rahmenvertrag badge should be visible on mobile too
    await expect(page.getByText("Rahmenvertrag").first()).toBeVisible({ timeout: 15000 });
  });

  test("sollte Suchergebnisse auf Mobile korrekt darstellen", async ({ page }) => {
    await page.goto("/search");
    const input = page.getByPlaceholder(/Artikel suchen/);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill("Monitor");
    await page.getByRole("button", { name: /Suchen/ }).click();
    await expect(page).toHaveURL(/\/results/, { timeout: 15000 });

    // Results should be displayed
    await expect(page.locator('h3').first()).toBeVisible({ timeout: 15000 });
  });
});
