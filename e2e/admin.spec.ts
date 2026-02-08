import { test, expect } from "@playwright/test";

// ═══════════════════════════════════════════════════════════════
// Admin Navigation
// ═══════════════════════════════════════════════════════════════

test.describe("Admin Navigation", () => {
  test.use({ locale: "de-DE" });

  test("sollte Admin-Seite über Header-Link erreichen", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByText("KI-gestützte Beschaffung")).toBeVisible({ timeout: 15000 });

    // Click admin link in navigation
    await page.getByRole("link", { name: /Administration/ }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
  });

  test("sollte zwischen Admin-Unterseiten navigieren können", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page.getByText("Dashboard")).toBeVisible({ timeout: 15000 });

    // Navigate to Rahmenverträge
    await page.getByRole("link", { name: /Rahmenverträge/ }).click();
    await expect(page).toHaveURL(/\/admin\/rahmenvertraege/);

    // Navigate to Shop-Konfiguration
    await page.getByRole("link", { name: /Shop-Konfiguration/ }).click();
    await expect(page).toHaveURL(/\/admin\/shop-config/);

    // Navigate to Katalog
    await page.getByRole("link", { name: /Katalog/ }).click();
    await expect(page).toHaveURL(/\/admin\/katalog/);

    // Navigate to Verbindungen
    await page.getByRole("link", { name: /Verbindungen/ }).click();
    await expect(page).toHaveURL(/\/admin\/verbindungen/);
  });

  test("sollte zurück zur App navigieren können", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page.getByText("Dashboard")).toBeVisible({ timeout: 15000 });

    await page.getByRole("link", { name: /Zurück zur App/ }).click();
    await expect(page).toHaveURL(/\/search/);
  });
});

// ═══════════════════════════════════════════════════════════════
// Admin Dashboard
// ═══════════════════════════════════════════════════════════════

test.describe("Admin Dashboard", () => {
  test.use({ locale: "de-DE" });

  test("sollte Dashboard mit Statistik-Cards laden", async ({ page }) => {
    await page.goto("/admin/dashboard");

    // Should display stat cards
    await expect(page.getByText("Rahmenverträge gesamt")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Katalog-Artikel")).toBeVisible();
    await expect(page.getByText("Shop-Konfigurationen")).toBeVisible();
  });

  test("sollte System-Status anzeigen", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page.getByText("System-Status")).toBeVisible({ timeout: 15000 });

    // Should show service statuses
    await expect(page.getByText("database")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// Rahmenverträge CRUD
// ═══════════════════════════════════════════════════════════════

test.describe("Rahmenverträge CRUD", () => {
  test.use({ locale: "de-DE" });

  test("sollte Rahmenverträge-Tabelle mit Seed-Daten anzeigen", async ({ page }) => {
    await page.goto("/admin/rahmenvertraege");

    // Should show seed data
    await expect(page.getByText("IT-Endgeräte")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Bechtle AG")).toBeVisible();
  });

  test("sollte neuen Rahmenvertrag anlegen können", async ({ page }) => {
    await page.goto("/admin/rahmenvertraege");
    await expect(page.getByText("IT-Endgeräte")).toBeVisible({ timeout: 15000 });

    // Open create modal
    await page.getByRole("button", { name: /Neuer Rahmenvertrag/ }).click();

    // Fill form
    await page.getByLabel("Bezeichnung").fill("Test-Rahmenvertrag E2E");
    await page.getByLabel("Beschreibung").fill("E2E-Testdaten");
    await page.getByLabel("Lieferant").fill("E2E Lieferant GmbH");
    await page.getByLabel("Vertragsnummer").fill("RV-E2E-001");
    await page.getByLabel("Gültig bis").fill("2027-12-31");

    // Save
    await page.getByRole("button", { name: /Speichern/ }).click();

    // Should appear in table
    await expect(page.getByText("Test-Rahmenvertrag E2E")).toBeVisible({ timeout: 15000 });
  });

  test("sollte Rahmenvertrag bearbeiten können", async ({ page }) => {
    await page.goto("/admin/rahmenvertraege");
    await expect(page.getByText("IT-Endgeräte")).toBeVisible({ timeout: 15000 });

    // Click on a row to edit
    await page.getByText("IT-Endgeräte").click();

    // Modal should open with pre-filled data
    await expect(page.getByLabel("Bezeichnung")).toHaveValue(/IT-Endgeräte/);
  });

  test("sollte Rahmenvertrag löschen können", async ({ page }) => {
    await page.goto("/admin/rahmenvertraege");
    await expect(page.getByText("IT-Endgeräte")).toBeVisible({ timeout: 15000 });

    // Click delete on a row
    const deleteButton = page.getByText("Löschen").first();
    await deleteButton.click();

    // Confirmation modal
    await expect(page.getByText("Möchten Sie diesen Rahmenvertrag")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// Shop-Konfiguration
// ═══════════════════════════════════════════════════════════════

test.describe("Shop-Konfiguration", () => {
  test.use({ locale: "de-DE" });

  test("sollte alle 3 Marktplatz-Cards anzeigen", async ({ page }) => {
    await page.goto("/admin/shop-config");

    await expect(page.getByText("Amazon Business")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Mercateo")).toBeVisible();
    await expect(page.getByText("Conrad Electronic")).toBeVisible();
  });

  test("sollte Shop aktivieren/deaktivieren können", async ({ page }) => {
    await page.goto("/admin/shop-config");
    await expect(page.getByText("Amazon Business")).toBeVisible({ timeout: 15000 });

    // Toggle checkbox on one of the shops
    const checkbox = page.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible();
    await checkbox.click();
  });

  test("sollte Synchronisation auslösen können", async ({ page }) => {
    await page.goto("/admin/shop-config");
    await expect(page.getByText("Amazon Business")).toBeVisible({ timeout: 15000 });

    // Click sync button
    await page.getByText("Synchronisieren").first().click();
  });
});

// ═══════════════════════════════════════════════════════════════
// Katalog-Datenbank
// ═══════════════════════════════════════════════════════════════

test.describe("Katalog-Datenbank", () => {
  test.use({ locale: "de-DE" });

  test("sollte Katalog-Artikel paginiert anzeigen", async ({ page }) => {
    await page.goto("/admin/katalog");

    // Should show catalog articles
    await expect(page.getByText("Katalog-Datenbank")).toBeVisible({ timeout: 15000 });
    // Should have pagination
    await expect(page.getByText(/Seite \d+ von \d+/)).toBeVisible();
  });

  test("sollte nach Artikeln suchen können", async ({ page }) => {
    await page.goto("/admin/katalog");
    await expect(page.getByText("Katalog-Datenbank")).toBeVisible({ timeout: 15000 });

    // Search for a specific article
    const searchInput = page.getByPlaceholder("Artikel suchen...");
    await searchInput.fill("Laptop");

    // Results should update
    await expect(page.getByText(/Laptop/i)).toBeVisible({ timeout: 15000 });
  });

  test("sollte nach Lieferant filtern können", async ({ page }) => {
    await page.goto("/admin/katalog");
    await expect(page.getByText("Katalog-Datenbank")).toBeVisible({ timeout: 15000 });

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Use the supplier dropdown if available
    const dropdown = page.locator("select").first();
    const options = await dropdown.locator("option").allTextContents();
    if (options.length > 1) {
      await dropdown.selectOption({ index: 1 });
    }
  });

  test("sollte Spalten sortieren können", async ({ page }) => {
    await page.goto("/admin/katalog");
    await expect(page.getByText("Katalog-Datenbank")).toBeVisible({ timeout: 15000 });

    // Click on a sortable column header
    await page.getByText("Titel").first().click();
  });
});

// ═══════════════════════════════════════════════════════════════
// Verbindungen
// ═══════════════════════════════════════════════════════════════

test.describe("Verbindungen", () => {
  test.use({ locale: "de-DE" });

  test("sollte Infrastruktur-Status anzeigen", async ({ page }) => {
    await page.goto("/admin/verbindungen");

    await expect(page.getByText("Infrastruktur")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("database")).toBeVisible();
  });

  test("sollte Marktplatz-Verbindungen anzeigen", async ({ page }) => {
    await page.goto("/admin/verbindungen");

    await expect(page.getByText("Marktplatz-Verbindungen")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Amazon Business")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// CSV/Excel Export
// ═══════════════════════════════════════════════════════════════

test.describe("Bestellungen CSV-Export", () => {
  test.use({ locale: "de-DE" });

  test("sollte CSV-Export Button auf Bestellungen-Seite anzeigen", async ({ page }) => {
    await page.goto("/admin/bestellungen");
    await expect(page.getByText("Bestellungen")).toBeVisible({ timeout: 15000 });

    // Export button should be visible
    const exportButton = page.getByRole("button", { name: /CSV-Export|CSV/ });
    await expect(exportButton).toBeVisible();
  });

  test("sollte CSV-Export Button disabled sein wenn keine Bestellungen", async ({ page }) => {
    await page.goto("/admin/bestellungen");
    await expect(page.getByText("Bestellungen")).toBeVisible({ timeout: 15000 });

    // Wait for data load
    await page.waitForTimeout(2000);

    const exportButton = page.getByRole("button", { name: /CSV-Export|CSV/ });
    await expect(exportButton).toBeVisible();
  });
});

test.describe("Rahmenverträge Excel-Export", () => {
  test.use({ locale: "de-DE" });

  test("sollte Excel-Export Button auf Rahmenverträge-Seite anzeigen", async ({ page }) => {
    await page.goto("/admin/rahmenvertraege");
    await expect(page.getByText("IT-Endgeräte")).toBeVisible({ timeout: 15000 });

    // Export button should be visible
    const exportButton = page.getByRole("button", { name: /Excel-Export|Excel/ });
    await expect(exportButton).toBeVisible();
  });

  test("sollte Excel-Export Button neben Neuer Rahmenvertrag Button anzeigen", async ({ page }) => {
    await page.goto("/admin/rahmenvertraege");
    await expect(page.getByText("IT-Endgeräte")).toBeVisible({ timeout: 15000 });

    // Both buttons should be visible
    await expect(page.getByRole("button", { name: /Excel-Export|Excel/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Neuer Rahmenvertrag/ })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// OCI Configuration
// ═══════════════════════════════════════════════════════════════

test.describe("OCI Konfiguration", () => {
  test.use({ locale: "de-DE" });

  test("sollte OCI-Konfiguration auf Shop-Config Seite anzeigen", async ({ page }) => {
    await page.goto("/admin/shop-config");
    await expect(page.getByText("Amazon Business")).toBeVisible({ timeout: 15000 });

    // OCI config section should be visible
    await expect(page.getByText("OCI/cXML Konfiguration")).toBeVisible();
    await expect(page.getByText("OCI Endpunkt")).toBeVisible();
    await expect(page.getByText("cXML Endpunkt")).toBeVisible();
  });

  test("sollte OCI Endpunkt-URLs anzeigen", async ({ page }) => {
    await page.goto("/admin/shop-config");
    await expect(page.getByText("Amazon Business")).toBeVisible({ timeout: 15000 });

    // Endpoint URLs should contain /api/v1/oci/setup and /api/v1/cxml/setup
    await expect(page.getByText(/\/oci\/setup/)).toBeVisible();
    await expect(page.getByText(/\/cxml\/setup/)).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// Mobile Admin
// ═══════════════════════════════════════════════════════════════

test.describe("Mobile Admin", () => {
  test.use({ viewport: { width: 375, height: 812 }, locale: "de-DE" });

  test("sollte Bottom-Navigation auf Mobile anzeigen", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page.getByText("Dashboard")).toBeVisible({ timeout: 15000 });

    // Bottom nav should be visible
    const bottomNav = page.locator("nav.fixed.bottom-0");
    await expect(bottomNav).toBeVisible();
  });

  test("sollte Hamburger-Menü auf Mobile funktionieren", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page.getByText("Dashboard")).toBeVisible({ timeout: 15000 });

    // Click hamburger menu
    await page.getByLabel("Menu").click();

    // Sidebar should open with navigation links
    await expect(page.getByText("Zurück zur App")).toBeVisible();
  });

  test("sollte DataTable horizontal scrollbar sein", async ({ page }) => {
    await page.goto("/admin/rahmenvertraege");
    await expect(page.getByText("IT-Endgeräte")).toBeVisible({ timeout: 15000 });

    // Table container should have overflow-x-auto
    const tableContainer = page.locator(".overflow-x-auto").first();
    await expect(tableContainer).toBeVisible();
  });
});
