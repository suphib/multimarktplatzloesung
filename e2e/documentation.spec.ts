import { test, expect } from '@playwright/test';

test.describe('Vergabedokumentation', () => {
  test.use({ locale: 'de-DE' });

  test('sollte Dokumentation nach Klassifizierung erstellen', async ({ page }) => {
    await page.goto('/search');
    const input = page.getByPlaceholder(/Artikel suchen/);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill('Laptop');
    await page.getByRole('button', { name: /Suchen/ }).click();
    await expect(page).toHaveURL(/\/results/, { timeout: 15000 });

    // Click first article to go to detail page
    await page.locator('h3').first().click();
    await expect(page).toHaveURL(/\/article\//, { timeout: 15000 });

    // Classify the article
    await page.getByRole('button', { name: /Jetzt klassifizieren/ }).click();

    // Wait for classification result and documentation button
    await expect(page.getByText(/Vergabedokumentation anzeigen/)).toBeVisible({ timeout: 15000 });

    // Click documentation button
    await page.getByRole('button', { name: /Vergabedokumentation anzeigen/ }).click();
    await expect(page).toHaveURL(/\/documentation\//, { timeout: 15000 });
  });

  test('sollte SHA-256 Hash anzeigen', async ({ page }) => {
    await page.goto('/search');
    const input = page.getByPlaceholder(/Artikel suchen/);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill('Laptop');
    await page.getByRole('button', { name: /Suchen/ }).click();
    await expect(page).toHaveURL(/\/results/, { timeout: 15000 });

    await page.locator('h3').first().click();
    await expect(page).toHaveURL(/\/article\//, { timeout: 15000 });

    await page.getByRole('button', { name: /Jetzt klassifizieren/ }).click();
    await expect(page.getByText(/Vergabedokumentation anzeigen/)).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: /Vergabedokumentation anzeigen/ }).click();
    await expect(page).toHaveURL(/\/documentation\//, { timeout: 15000 });

    // SHA-256 hash should be visible (64 hex characters)
    const hashBlock = page.locator('code');
    await expect(hashBlock).toBeVisible({ timeout: 15000 });
    const hashText = await hashBlock.textContent();
    expect(hashText).toMatch(/^[0-9a-f]{64}$/);
  });

  test('sollte Compliance-Pruefung anzeigen', async ({ page }) => {
    await page.goto('/search');
    const input = page.getByPlaceholder(/Artikel suchen/);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill('Laptop');
    await page.getByRole('button', { name: /Suchen/ }).click();
    await expect(page).toHaveURL(/\/results/, { timeout: 15000 });

    await page.locator('h3').first().click();
    await expect(page).toHaveURL(/\/article\//, { timeout: 15000 });

    await page.getByRole('button', { name: /Jetzt klassifizieren/ }).click();
    await expect(page.getByText(/Vergabedokumentation anzeigen/)).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: /Vergabedokumentation anzeigen/ }).click();
    await expect(page).toHaveURL(/\/documentation\//, { timeout: 15000 });

    // Compliance section should be visible
    await expect(page.getByText('Compliance-Prüfung')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Vergabedokumentation (Mobile)', () => {
  test.use({ viewport: { width: 375, height: 812 }, locale: 'de-DE' });

  test('sollte auf Mobile korrekt anzeigen', async ({ page }) => {
    await page.goto('/search');
    const input = page.getByPlaceholder(/Artikel suchen/);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill('Laptop');
    await page.getByRole('button', { name: /Suchen/ }).click();
    await expect(page).toHaveURL(/\/results/, { timeout: 15000 });

    await page.locator('h3').first().click();
    await expect(page).toHaveURL(/\/article\//, { timeout: 15000 });

    await page.getByRole('button', { name: /Jetzt klassifizieren/ }).click();
    await expect(page.getByText(/Vergabedokumentation anzeigen/)).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: /Vergabedokumentation anzeigen/ }).click();
    await expect(page).toHaveURL(/\/documentation\//, { timeout: 15000 });

    // Content should be visible on mobile viewport
    await expect(page.getByText('Vergabedokumentation')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('code')).toBeVisible({ timeout: 15000 });
  });
});
