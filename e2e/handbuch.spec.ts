import { test, expect } from "@playwright/test";

test.describe("Handbuch", () => {
  test.use({ locale: "de-DE" });

  test("sollte Handbuch-Seite laden", async ({ page }) => {
    await page.goto("/handbuch");
    await expect(page.getByText("Willkommen beim eProcurement KI Handbuch")).toBeVisible({ timeout: 15000 });
  });

  test("sollte Inhaltsverzeichnis anzeigen", async ({ page }) => {
    await page.goto("/handbuch");
    await expect(page.getByText("Inhaltsverzeichnis")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Artikelsuche")).toBeVisible();
    await expect(page.getByText("Magic Request").first()).toBeVisible();
    await expect(page.getByText("Preisvergleich").first()).toBeVisible();
    await expect(page.getByText("KI-Klassifizierung").first()).toBeVisible();
  });

  test("sollte zu Sektion scrollen", async ({ page }) => {
    await page.goto("/handbuch");
    await expect(page.getByText("Inhaltsverzeichnis")).toBeVisible({ timeout: 15000 });

    // Click on the Magic Request TOC link
    await page.locator('a[href="#magic-request"]').first().click();

    // The Magic Request section heading should be visible
    const section = page.locator('#magic-request');
    await expect(section).toBeVisible();
  });

  test("sollte Footer-Link haben", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByText("KI-gestützte Beschaffung")).toBeVisible({ timeout: 15000 });

    // Footer should have Handbuch link (visible on desktop)
    const footerLink = page.locator('footer a[href="/handbuch"]');
    await expect(footerLink).toBeVisible();

    // Click should navigate to handbook
    await footerLink.click();
    await expect(page).toHaveURL(/\/handbuch/);
    await expect(page.getByText("Willkommen beim eProcurement KI Handbuch")).toBeVisible({ timeout: 15000 });
  });

  test("sollte Hilfe-Icon im Header haben", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByText("KI-gestützte Beschaffung")).toBeVisible({ timeout: 15000 });

    // HelpCircle icon link in header
    const helpLink = page.locator('header a[href="/handbuch"]');
    await expect(helpLink).toBeVisible();

    await helpLink.click();
    await expect(page).toHaveURL(/\/handbuch/);
    await expect(page.getByText("Willkommen beim eProcurement KI Handbuch")).toBeVisible({ timeout: 15000 });
  });

  test("sollte FAQ-Bereich anzeigen", async ({ page }) => {
    await page.goto("/handbuch");
    await expect(page.getByText("Häufige Fragen")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Was passiert, wenn die KI nicht verfügbar ist?")).toBeVisible();
  });
});

test.describe("Handbuch (Mobile)", () => {
  test.use({ viewport: { width: 375, height: 812 }, locale: "de-DE" });

  test("sollte auf Mobile korrekt anzeigen", async ({ page }) => {
    await page.goto("/handbuch");
    await expect(page.getByText("Willkommen beim eProcurement KI Handbuch")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Inhaltsverzeichnis")).toBeVisible();

    // Sections should be stacked and visible
    await expect(page.getByText("Artikelsuche")).toBeVisible();
    await expect(page.getByText("Häufige Fragen")).toBeVisible();
  });
});

test.describe("Handbuch (English)", () => {
  test.use({ locale: "en-US" });

  test("sollte auf Englisch anzeigen", async ({ page }) => {
    await page.goto("/handbuch");
    await expect(page.getByText("Welcome to the eProcurement AI Handbook")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Table of Contents")).toBeVisible();
    await expect(page.getByText("Frequently Asked Questions")).toBeVisible();
  });
});
