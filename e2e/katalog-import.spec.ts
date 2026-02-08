import { test, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════
// Katalog CSV Import
// ═══════════════════════════════════════════════════════════════

test.describe("Katalog CSV Import", () => {
  test.use({ locale: "de-DE" });

  test("sollte Import-Seite laden", async ({ page }) => {
    await page.goto("/admin/katalog/import");

    await expect(page.getByText("Katalog-Import")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Artikel aus CSV-Datei importieren")).toBeVisible();
  });

  test("sollte Rahmenvertrag-Dropdown anzeigen", async ({ page }) => {
    await page.goto("/admin/katalog/import");
    await expect(page.getByText("Katalog-Import")).toBeVisible({ timeout: 15000 });

    // Dropdown should be visible with RV options
    const select = page.locator("select");
    await expect(select).toBeVisible();

    // Should contain at least the placeholder option
    const options = await select.locator("option").allTextContents();
    expect(options.length).toBeGreaterThanOrEqual(1);
  });

  test("sollte CSV-Vorlage herunterladen", async ({ page }) => {
    await page.goto("/admin/katalog/import");
    await expect(page.getByText("Katalog-Import")).toBeVisible({ timeout: 15000 });

    // Click download template link
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByText("CSV-Vorlage herunterladen").click(),
    ]);

    expect(download.suggestedFilename()).toBe("katalog-import-vorlage.csv");
  });

  test("sollte CSV hochladen und Vorschau zeigen", async ({ page }) => {
    await page.goto("/admin/katalog/import");
    await expect(page.getByText("Katalog-Import")).toBeVisible({ timeout: 15000 });

    // Create a temp CSV file
    const csvContent =
      "titel;beschreibung;lieferant;artikelnummer;preis;waehrung\n" +
      "Test Laptop;Business Laptop;Dell;DELL-TEST-001;1200;EUR\n" +
      "Test Monitor;27 Zoll;Dell;DELL-TEST-002;450;EUR\n";

    const tmpDir = path.join(__dirname, "..", "tmp");
    fs.mkdirSync(tmpDir, { recursive: true });
    const csvPath = path.join(tmpDir, "test-katalog.csv");
    fs.writeFileSync(csvPath, csvContent, "utf-8");

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(csvPath);

    // Preview should appear
    await expect(page.getByText("Vorschau")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Test Laptop")).toBeVisible();
    await expect(page.getByText("Test Monitor")).toBeVisible();

    // Cleanup
    fs.unlinkSync(csvPath);
    fs.rmdirSync(tmpDir, { recursive: true } as any);
  });

  test("sollte Import durchfuehren und Ergebnis zeigen", async ({ page }) => {
    await page.goto("/admin/katalog/import");
    await expect(page.getByText("Katalog-Import")).toBeVisible({ timeout: 15000 });

    // Select RV
    const select = page.locator("select");
    const options = await select.locator("option").allTextContents();
    if (options.length > 1) {
      await select.selectOption({ index: 1 });
    }

    // Create and upload CSV
    const csvContent =
      "titel;beschreibung;lieferant;artikelnummer;preis;waehrung\n" +
      "Import Test Artikel;E2E Test;E2E Lieferant;E2E-ART-001;99.99;EUR\n";

    const tmpDir = path.join(__dirname, "..", "tmp");
    fs.mkdirSync(tmpDir, { recursive: true });
    const csvPath = path.join(tmpDir, "test-import.csv");
    fs.writeFileSync(csvPath, csvContent, "utf-8");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(csvPath);

    // Click import button
    await page.getByRole("button", { name: /Importieren/ }).click();

    // Should show result
    await expect(page.getByText("Import-Ergebnis")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/importiert/)).toBeVisible();

    // Cleanup
    fs.unlinkSync(csvPath);
    fs.rmdirSync(tmpDir, { recursive: true } as any);
  });
});

// ═══════════════════════════════════════════════════════════════
// Mobile Katalog Import
// ═══════════════════════════════════════════════════════════════

test.describe("Mobile Katalog Import", () => {
  test.use({ viewport: { width: 375, height: 812 }, locale: "de-DE" });

  test("sollte auf Mobile korrekt anzeigen", async ({ page }) => {
    await page.goto("/admin/katalog/import");
    await expect(page.getByText("Katalog-Import")).toBeVisible({ timeout: 15000 });

    // All main elements should be visible and stacked
    await expect(page.locator("select")).toBeVisible();
    await expect(page.getByText("CSV-Datei hochladen")).toBeVisible();
    await expect(page.getByText("CSV-Vorlage herunterladen")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// Katalog Page CSV Import Button
// ═══════════════════════════════════════════════════════════════

test.describe("Katalog Seite Import Button", () => {
  test.use({ locale: "de-DE" });

  test("sollte CSV-Import Button auf Katalog-Seite anzeigen", async ({ page }) => {
    await page.goto("/admin/katalog");
    await expect(page.getByText("Katalog-Datenbank")).toBeVisible({ timeout: 15000 });

    // Import button should be visible
    await expect(page.getByRole("button", { name: /CSV importieren/ })).toBeVisible();
  });

  test("sollte zur Import-Seite navigieren", async ({ page }) => {
    await page.goto("/admin/katalog");
    await expect(page.getByText("Katalog-Datenbank")).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /CSV importieren/ }).click();
    await expect(page).toHaveURL(/\/admin\/katalog\/import/);
  });
});
