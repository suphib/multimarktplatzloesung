import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kontakt');
    // Wait for React hydration of DemoRequestForm
    await page.waitForFunction(() => {
      const form = document.querySelector('form');
      return form && Object.keys(form).some(k => k.startsWith('__react'));
    }, { timeout: 10000 });
  });

  test('should render contact form', async ({ page }) => {
    await expect(page.locator('h1').first()).toContainText(/kontakt/i);
    await expect(page.locator('form')).toBeVisible();
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.locator('form').getByRole('button', { name: /demo anfordern/i }).click();

    await expect(page.getByText(/vorname ist erforderlich/i)).toBeVisible();
    await expect(page.getByText(/nachname ist erforderlich/i)).toBeVisible();
    await expect(page.getByText(/e-mail ist erforderlich/i)).toBeVisible();
    await expect(page.getByText(/organisation ist erforderlich/i)).toBeVisible();
  });

  test('should show DSGVO error when checkbox not checked', async ({ page }) => {
    await page.locator('#demo-vorname').fill('Max');
    await page.locator('#demo-nachname').fill('Mustermann');
    await page.locator('#demo-email').fill('max@test.de');
    await page.locator('#demo-organisation').fill('Stadtverwaltung');

    await page.locator('form').getByRole('button', { name: /demo anfordern/i }).click();

    await expect(page.getByText(/datenschutzbestimmungen müssen akzeptiert werden/i)).toBeVisible();
  });

  test('should have DSGVO checkbox', async ({ page }) => {
    await expect(page.getByText(/datenschutzbestimmungen/i).first()).toBeVisible();
  });

  test('should submit form with valid data', async ({ page }) => {
    // Mock API response
    await page.route('**/api/v1/leads', (route) => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'test-id', status: 'NEU' }),
      });
    });

    await page.locator('#demo-vorname').fill('Max');
    await page.locator('#demo-nachname').fill('Mustermann');
    await page.locator('#demo-email').fill('max@behoerde.de');
    await page.locator('#demo-organisation').fill('Stadtverwaltung Berlin');
    await page.locator('form input[type="checkbox"]').first().check();

    await page.locator('form').getByRole('button', { name: /demo anfordern/i }).click();

    await expect(page.getByText(/erfolgreich|gesendet/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should show error on API failure', async ({ page }) => {
    await page.route('**/api/v1/leads', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server-Fehler' }),
      });
    });

    await page.locator('#demo-vorname').fill('Max');
    await page.locator('#demo-nachname').fill('Mustermann');
    await page.locator('#demo-email').fill('max@behoerde.de');
    await page.locator('#demo-organisation').fill('Stadtverwaltung');
    await page.locator('form input[type="checkbox"]').first().check();

    await page.locator('form').getByRole('button', { name: /demo anfordern/i }).click();

    await expect(page.getByText(/fehler/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should display contact information', async ({ page }) => {
    const sidebar = page.locator('main');
    await expect(sidebar.getByText('anfrage@procurement-ai.de').first()).toBeVisible();
    await expect(sidebar.getByText(/\+49/).first()).toBeVisible();
  });
});
