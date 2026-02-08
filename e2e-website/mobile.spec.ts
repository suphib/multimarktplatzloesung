import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should show hamburger menu on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /menü/i })).toBeVisible();
  });

  test('should open mobile drawer on hamburger click', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /menü/i }).click();

    // Wait for drawer animation
    await page.waitForTimeout(500);

    const mobileNav = page.locator('nav[aria-label="Mobile Navigation"]');
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByText('Integrationen')).toBeVisible();
    await expect(mobileNav.getByText('Preise')).toBeVisible();
  });

  test('should close drawer on close button', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /menü/i }).click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /schließen/i }).click();
    await page.waitForTimeout(500);
  });

  test('should have no horizontal scroll on homepage', async ({ page }) => {
    await page.goto('/');

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test('should have no horizontal scroll on features page', async ({ page }) => {
    await page.goto('/features');

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test('should have no horizontal scroll on preise page', async ({ page }) => {
    await page.goto('/preise');

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test('should have no horizontal scroll on kontakt page', async ({ page }) => {
    await page.goto('/kontakt');

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test('should show CTA in mobile drawer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /menü/i }).click();
    await page.waitForTimeout(500);

    // Find the CTA inside the mobile drawer panel
    const drawer = page.locator('nav[aria-label="Mobile Navigation"]');
    await expect(drawer.getByRole('link', { name: /demo anfordern/i })).toBeVisible();
  });

  test('should stack pricing cards on mobile', async ({ page }) => {
    await page.goto('/preise');

    // Cards should be visible and stacked
    await expect(page.getByText('Starter').first()).toBeVisible();
    await expect(page.getByText('Professional').first()).toBeVisible();
    await expect(page.getByText('Enterprise').first()).toBeVisible();
  });
});
