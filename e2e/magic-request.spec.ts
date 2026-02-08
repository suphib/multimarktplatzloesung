import { test, expect } from '@playwright/test';

test.describe('Magic Request', () => {
  test.use({ locale: 'de-DE' });

  test('sollte Magic Request Panel öffnen', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByText('KI-gestützte Beschaffung')).toBeVisible({ timeout: 15000 });

    const toggleButton = page.getByRole('button', { name: /Magic Request/ });
    await expect(toggleButton).toBeVisible();
    await toggleButton.click();

    await expect(page.getByPlaceholder(/Fügen Sie hier Ihren Text ein/)).toBeVisible();
  });

  test('sollte Beispieltext einfügen', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByText('KI-gestützte Beschaffung')).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: /Magic Request/ }).click();
    await expect(page.getByPlaceholder(/Fügen Sie hier Ihren Text ein/)).toBeVisible();

    // Click the "E-Mail" example chip
    await page.getByRole('button', { name: /E-Mail/ }).click();

    // Textarea should now contain the example text
    const textarea = page.getByPlaceholder(/Fügen Sie hier Ihren Text ein/);
    await expect(textarea).not.toBeEmpty();
  });

  test('sollte Analyse-Button deaktiviert bei zu kurzem Text', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByText('KI-gestützte Beschaffung')).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: /Magic Request/ }).click();
    await expect(page.getByPlaceholder(/Fügen Sie hier Ihren Text ein/)).toBeVisible();

    // Type too-short text
    await page.getByPlaceholder(/Fügen Sie hier Ihren Text ein/).fill('kurz');

    // Analyze button should be disabled
    const analyzeButton = page.getByRole('button', { name: /Analysieren/ });
    await expect(analyzeButton).toBeDisabled();
  });

  test('sollte Text analysieren und Positionen anzeigen', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByText('KI-gestützte Beschaffung')).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: /Magic Request/ }).click();

    // Fill in a text with items
    const textarea = page.getByPlaceholder(/Fügen Sie hier Ihren Text ein/);
    await textarea.fill('Bitte bestellen Sie 5 Dell Latitude Laptops und 3 Monitore 27 Zoll für die neue Abteilung.');

    // Click analyze
    await page.getByRole('button', { name: /Analysieren/ }).click();

    // Wait for results (either KI or regelbasiert)
    await expect(page.getByText(/Erkannte Positionen|Position.*erkannt/)).toBeVisible({ timeout: 30000 });
  });
});

test.describe('Magic Request (Mobile)', () => {
  test.use({ viewport: { width: 375, height: 812 }, locale: 'de-DE' });

  test('sollte Panel auf Mobile öffnen', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByText('KI-gestützte Beschaffung')).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: /Magic Request/ }).click();
    await expect(page.getByPlaceholder(/Fügen Sie hier Ihren Text ein/)).toBeVisible();
  });

  test('sollte Ergebnisse gestapelt anzeigen', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByText('KI-gestützte Beschaffung')).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: /Magic Request/ }).click();

    // Use example text
    await page.getByRole('button', { name: /E-Mail/ }).click();
    await page.getByRole('button', { name: /Analysieren/ }).click();

    // Results should be visible
    await expect(page.getByText(/Erkannte Positionen|Position.*erkannt/)).toBeVisible({ timeout: 30000 });
  });
});
