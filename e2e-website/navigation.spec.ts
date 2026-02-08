import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  const pages = [
    { path: '/', title: /procurement-ai/i },
    { path: '/features', title: /features/i },
    { path: '/integrationen', title: /integrationen/i },
    { path: '/preise', title: /preise/i },
    { path: '/blog', title: /blog/i },
    { path: '/ueber-uns', title: /über uns/i },
    { path: '/kontakt', title: /kontakt/i },
    { path: '/impressum', title: /impressum/i },
    { path: '/datenschutz', title: /datenschutz/i },
  ];

  for (const { path, title } of pages) {
    test(`should load ${path}`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(title);
    });
  }

  test('should have sticky header', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('#site-header');
    await expect(header).toBeVisible();

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    // Header should still be visible (sticky)
    await expect(header).toBeVisible();
    await expect(header).toBeInViewport();
  });

  test('should navigate between pages via header links', async ({ page, viewport }) => {
    await page.goto('/');

    if (viewport && viewport.width < 1024) {
      // On mobile, use the mobile drawer to navigate
      await page.getByRole('button', { name: /menü/i }).click();
      await page.waitForTimeout(500);
      await page.locator('nav[aria-label="Mobile Navigation"]').getByText('Features').click();
      await expect(page).toHaveURL(/\/features/);
      await expect(page.locator('h1').first()).toContainText(/features/i);
    } else {
      // On desktop, use the header nav
      await page.locator('#site-header').getByRole('link', { name: 'Features' }).click();
      await expect(page).toHaveURL(/\/features/);
      await expect(page.locator('h1').first()).toContainText(/features/i);

      await page.locator('#site-header').getByRole('link', { name: 'Preise' }).click();
      await expect(page).toHaveURL(/\/preise/);
      await expect(page.locator('h1').first()).toContainText(/preise/i);
    }
  });

  test('should show 404 page for non-existent routes', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    expect(response?.status()).toBe(404);
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Seite nicht gefunden')).toBeVisible();
  });

  test('should have working logo link back to homepage', async ({ page }) => {
    await page.goto('/features');
    await page.locator('#site-header a[href="/"]').click();
    await expect(page).toHaveURL('/');
  });
});
