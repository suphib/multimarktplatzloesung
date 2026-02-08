import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('should show blog listing page', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1').first()).toContainText('Blog');
  });

  test('should display blog post cards', async ({ page }) => {
    await page.goto('/blog');

    // Should have at least 3 blog posts
    const cards = page.locator('article');
    await expect(cards).toHaveCount(3);
  });

  test('should show post titles on listing page', async ({ page }) => {
    await page.goto('/blog');

    await expect(page.getByText(/procurement-ai ist live/i)).toBeVisible();
    await expect(page.getByText(/KI in der öffentlichen Beschaffung/i)).toBeVisible();
    await expect(page.getByText(/OCI 5.0 Integration/i)).toBeVisible();
  });

  test('should navigate to individual blog post', async ({ page }) => {
    await page.goto('/blog');

    await page.getByRole('link', { name: /weiterlesen/i }).first().click();

    // Should be on a blog post page
    await expect(page.locator('article')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should display willkommen post', async ({ page }) => {
    await page.goto('/blog/willkommen');

    await expect(page.locator('h1').first()).toContainText(/procurement-ai ist live/i);
    await expect(page.getByText(/procurement-ai Team/)).toBeVisible();
    await expect(page.getByText(/3 min/)).toBeVisible();
  });

  test('should display KI post', async ({ page }) => {
    await page.goto('/blog/ki-beschaffung-2026');

    await expect(page.locator('h1').first()).toContainText(/KI in der öffentlichen Beschaffung/i);
    await expect(page.getByText(/Dr\. Anna Schmidt/)).toBeVisible();
  });

  test('should display OCI guide post', async ({ page }) => {
    await page.goto('/blog/oci-integration-guide');

    await expect(page.locator('h1').first()).toContainText(/OCI 5.0 Integration/i);
    await expect(page.getByText(/Thomas Weber/)).toBeVisible();
    await expect(page.getByText(/8 min/)).toBeVisible();
  });

  test('should show date on blog posts', async ({ page }) => {
    await page.goto('/blog/willkommen');
    // Date should be formatted in German
    await expect(page.getByText(/Februar 2026/)).toBeVisible();
  });

  test('should have Lesezeit on blog posts', async ({ page }) => {
    await page.goto('/blog/willkommen');
    await expect(page.getByText(/Lesezeit/)).toBeVisible();
  });
});
