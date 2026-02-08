import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load hero section', async ({ page }) => {
    await expect(page.locator('h1').first()).toContainText('Intelligente Beschaffung');
  });

  test('should show two CTA buttons in hero', async ({ page }) => {
    const hero = page.locator('section').first();
    await expect(hero.getByRole('link', { name: /demo anfordern/i })).toBeVisible();
    await expect(hero.getByRole('link', { name: /features entdecken/i })).toBeVisible();
  });

  test('should display trust metrics section', async ({ page }) => {
    await expect(page.getByText(/Marktplätze angebunden/i)).toBeVisible();
    await expect(page.getByText(/SLA-Verfügbarkeit/i)).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    await expect(page.getByText('KI-Bedarfserfassung').first()).toBeVisible();
    await expect(page.getByText('Multi-Marktplatz-Suche').first()).toBeVisible();
  });

  test('should display ERP integration logos', async ({ page }) => {
    await expect(page.getByText('Kompatibel mit Ihrem ERP')).toBeVisible();
    await expect(page.getByAltText('SAP S/4HANA')).toBeVisible();
  });

  test('should display CTA band', async ({ page }) => {
    await expect(page.getByText('Bereit für effizientere Beschaffung?')).toBeVisible();
  });

  test('should have correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/procurement-ai/i);
  });

  test('should have navigation with all main links', async ({ page, viewport }) => {
    if (viewport && viewport.width < 1024) {
      // On mobile, open the drawer and check links there
      await page.getByRole('button', { name: /menü/i }).click();
      await page.waitForTimeout(500);
      const nav = page.locator('nav[aria-label="Mobile Navigation"]');
      await expect(nav.getByText('Features')).toBeVisible();
      await expect(nav.getByText('Integrationen')).toBeVisible();
      await expect(nav.getByText('Preise')).toBeVisible();
    } else {
      const nav = page.locator('nav[aria-label="Hauptnavigation"]');
      await expect(nav.getByText('Features')).toBeVisible();
      await expect(nav.getByText('Integrationen')).toBeVisible();
      await expect(nav.getByText('Preise')).toBeVisible();
    }
  });

  test('should have footer with legal links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: /impressum/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /datenschutz/i })).toBeVisible();
  });
});
