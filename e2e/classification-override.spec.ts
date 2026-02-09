import { test, expect } from "@playwright/test";

test.use({ locale: "de-DE" });

/**
 * Hilfsfunktion: Navigiert zur Artikeldetailseite und klassifiziert den Artikel.
 * Wird von mehreren Tests genutzt um DRY zu bleiben.
 */
async function navigateAndClassify(page: import("@playwright/test").Page) {
  // Suche starten
  await page.goto("/search");
  await page.waitForLoadState("networkidle");
  await page.getByPlaceholder(/Artikel suchen/i).fill("Laptop");
  await page.getByRole("button", { name: /Suchen/i }).click();

  // Warte auf Suchergebnisse
  await page.waitForLoadState("networkidle");
  await page
    .getByRole("button", { name: /Details/i })
    .first()
    .waitFor({ timeout: 15000 });

  // Ersten Artikel öffnen
  await page.getByRole("button", { name: /Details/i }).first().click();
  await page.waitForURL(/\/article\//, { timeout: 15000 });
  await page.waitForLoadState("networkidle");

  // Klassifizieren
  await page
    .getByRole("button", { name: /Jetzt klassifizieren/i })
    .waitFor({ timeout: 10000 });
  await page.getByRole("button", { name: /Jetzt klassifizieren/i }).click();

  // Warte auf Ergebnis
  await expect(page.getByText(/CPV-Code/i).first()).toBeVisible({
    timeout: 20000,
  });
}

test.describe("Klassifizierungs-Übersteuerung & Audit-Trail", () => {
  test("sollte Artikel klassifizieren und Quellen-Badge anzeigen", async ({
    page,
  }) => {
    await navigateAndClassify(page);

    // Quellen-Badge prüfen (KI oder Regelbasiert) — .first() wegen möglicher Mehrfachtreffer
    const quellenBadge = page
      .getByText(/KI-klassifiziert|Regelbasiert/i)
      .first();
    await expect(quellenBadge).toBeVisible({ timeout: 15000 });
  });

  test("sollte CPV-Override-Modal öffnen und CPV-Suche durchführen", async ({
    page,
  }) => {
    await navigateAndClassify(page);

    // Stift-Icon klicken um Override-Modal zu öffnen
    await page
      .locator('button[title="CPV-Code ändern"]')
      .click({ timeout: 15000 });

    // Modal sollte sichtbar sein (Heading im Modal)
    await expect(
      page.getByRole("heading", { name: "CPV-Code ändern" })
    ).toBeVisible({ timeout: 15000 });

    // CPV-Code suchen
    await page
      .getByPlaceholder(/CPV-Code oder Bezeichnung suchen/i)
      .fill("Büro");

    // Ergebnisse in der Liste prüfen
    await expect(page.getByText(/Büromöbel/i).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/Bürobedarf/i).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("sollte CPV-Code manuell übersteuern und Badge aktualisieren", async ({
    page,
  }) => {
    await navigateAndClassify(page);

    // Override-Modal öffnen
    await page
      .locator('button[title="CPV-Code ändern"]')
      .click({ timeout: 15000 });

    // Büromöbel auswählen
    await page
      .getByPlaceholder(/CPV-Code oder Bezeichnung suchen/i)
      .fill("Büromöbel");
    await page.getByText(/39130000/).first().click({ timeout: 15000 });

    // Begründung eingeben (min. 10 Zeichen)
    await page
      .getByPlaceholder(/Begründung für die Änderung/i)
      .fill(
        "Artikel wurde falsch klassifiziert, korrekte Kategorie ist Büromöbel"
      );

    // Speichern
    await page
      .getByRole("button", { name: /CPV-Code übernehmen/i })
      .click({ timeout: 15000 });

    // Modal sollte geschlossen sein und Badge "Manuell angepasst" anzeigen
    await expect(page.getByText(/Manuell angepasst/i)).toBeVisible({
      timeout: 20000,
    });

    // CPV-Code wurde aktualisiert
    await expect(page.getByText(/39130000/).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("sollte Begründung mit weniger als 10 Zeichen ablehnen", async ({
    page,
  }) => {
    await navigateAndClassify(page);

    // Override-Modal öffnen
    await page
      .locator('button[title="CPV-Code ändern"]')
      .click({ timeout: 15000 });

    // CPV-Code auswählen
    await page
      .getByPlaceholder(/CPV-Code oder Bezeichnung suchen/i)
      .fill("Büromöbel");
    await page.getByText(/39130000/).first().click({ timeout: 15000 });

    // Zu kurze Begründung eingeben
    await page
      .getByPlaceholder(/Begründung für die Änderung/i)
      .fill("Zu kurz");

    // Validierungshinweis sollte sichtbar sein
    await expect(
      page.getByText(/Mindestens 10 Zeichen erforderlich/i)
    ).toBeVisible({ timeout: 15000 });

    // Speichern-Button sollte deaktiviert sein
    const saveButton = page.getByRole("button", {
      name: /CPV-Code übernehmen/i,
    });
    await expect(saveButton).toBeDisabled();
  });

  test("sollte Änderungshistorie anzeigen", async ({ page }) => {
    await navigateAndClassify(page);

    // Änderungshistorie aufklappen
    await page
      .getByRole("button", { name: /Änderungshistorie/i })
      .click({ timeout: 15000 });

    // Timeline-Bereich sollte sichtbar sein (Erstellt-Eintrag oder leere Anzeige)
    await expect(
      page.getByText(/Erstellt|Keine Änderungen vorhanden/i).first()
    ).toBeVisible({ timeout: 15000 });
  });
});

test.describe("Klassifizierungs-Übersteuerung (Mobile)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("sollte CPV-Override-Modal auf Mobile korrekt anzeigen", async ({
    page,
  }) => {
    await navigateAndClassify(page);

    // Override-Modal öffnen
    await page
      .locator('button[title="CPV-Code ändern"]')
      .click({ timeout: 15000 });

    // Modal sollte sichtbar sein (Heading im Modal)
    await expect(
      page.getByRole("heading", { name: "CPV-Code ändern" })
    ).toBeVisible({ timeout: 15000 });

    // Suchfeld sollte nutzbar sein
    const searchInput = page.getByPlaceholder(
      /CPV-Code oder Bezeichnung suchen/i
    );
    await expect(searchInput).toBeVisible({ timeout: 15000 });
    await searchInput.fill("Computer");

    // Begründungsfeld sollte sichtbar sein
    await expect(
      page.getByPlaceholder(/Begründung für die Änderung/i)
    ).toBeVisible({ timeout: 15000 });
  });

  test("sollte Audit-Timeline auf Mobile korrekt anzeigen", async ({
    page,
  }) => {
    await navigateAndClassify(page);

    // Quellen-Badge prüfen — .first() wegen möglicher Mehrfachtreffer
    const quellenBadge = page
      .getByText(/KI-klassifiziert|Regelbasiert/i)
      .first();
    await expect(quellenBadge).toBeVisible({ timeout: 15000 });

    // Änderungshistorie aufklappen
    await page
      .getByRole("button", { name: /Änderungshistorie/i })
      .click({ timeout: 15000 });

    // Timeline-Bereich sollte sichtbar sein (Erstellt-Eintrag oder leere Anzeige)
    await expect(
      page.getByText(/Erstellt|Keine Änderungen vorhanden/i).first()
    ).toBeVisible({ timeout: 15000 });
  });
});
