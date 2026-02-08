import { test, expect } from '@playwright/test';

test.describe('Legal Pages', () => {
  test.describe('Impressum', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/impressum');
    });

    test('should have Impressum heading', async ({ page }) => {
      await expect(page.locator('main h1')).toContainText('Impressum');
    });

    test('should contain TMG reference', async ({ page }) => {
      await expect(page.locator('main').getByText(/§ 5 TMG/)).toBeVisible();
    });

    test('should contain company name', async ({ page }) => {
      await expect(page.locator('main').getByText('WP Workers GmbH').first()).toBeVisible();
    });

    test('should contain address', async ({ page }) => {
      await expect(page.locator('main').getByText(/Eichendorffstr/).first()).toBeVisible();
      await expect(page.locator('main').getByText(/82223/).first()).toBeVisible();
      await expect(page.locator('main').getByText(/Eichenau/).first()).toBeVisible();
    });

    test('should contain Geschäftsführer', async ({ page }) => {
      await expect(page.locator('main').getByText(/Geschäftsführer/).first()).toBeVisible();
      await expect(page.locator('main').getByText(/Suphi Basdemir/).first()).toBeVisible();
    });

    test('should contain Handelsregister', async ({ page }) => {
      await expect(page.locator('main').getByText(/HRB/).first()).toBeVisible();
      await expect(page.locator('main').getByText(/Amtsgericht München/).first()).toBeVisible();
    });

    test('should contain USt-IdNr', async ({ page }) => {
      await expect(page.locator('main').getByText(/DE/).first()).toBeVisible();
    });

    test('should contain contact information', async ({ page }) => {
      await expect(page.locator('main').getByText(/anfrage@procurement-ai\.de/).first()).toBeVisible();
    });

    test('should contain Haftung sections', async ({ page }) => {
      await expect(page.locator('main').getByText('Haftung für Inhalte')).toBeVisible();
      await expect(page.locator('main').getByText('Haftung für Links')).toBeVisible();
    });

    test('should contain Urheberrecht section', async ({ page }) => {
      const main = page.locator('main');
      await expect(main.locator('h2').filter({ hasText: 'Urheberrecht' })).toBeVisible();
    });

    test('should contain Streitschlichtung section', async ({ page }) => {
      await expect(page.locator('main').getByText('Streitschlichtung')).toBeVisible();
      await expect(page.locator('main').getByText(/ec\.europa\.eu/).first()).toBeVisible();
    });
  });

  test.describe('Datenschutz', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/datenschutz');
    });

    test('should have Datenschutzerklärung heading', async ({ page }) => {
      await expect(page.locator('main h1')).toContainText('Datenschutzerklärung');
    });

    test('should contain verantwortliche Stelle', async ({ page }) => {
      await expect(page.locator('main h2').filter({ hasText: 'Verantwortliche Stelle' })).toBeVisible();
      await expect(page.locator('main').getByText('WP Workers GmbH').first()).toBeVisible();
    });

    test('should contain DSGVO articles references', async ({ page }) => {
      await expect(page.locator('main').getByText(/Art\. 6/).first()).toBeVisible();
      await expect(page.locator('main').getByText(/Art\. 15 DSGVO/).first()).toBeVisible();
    });

    test('should contain cookie information', async ({ page }) => {
      await expect(page.locator('main').getByText(/Cookies/i).first()).toBeVisible();
      await expect(page.locator('main').getByText('cookie-consent')).toBeVisible();
    });

    test('should contain SSL section', async ({ page }) => {
      await expect(page.locator('main').getByText(/SSL/).first()).toBeVisible();
    });

    test('should list user rights', async ({ page }) => {
      const main = page.locator('main');
      await expect(main.getByText('Auskunft').first()).toBeVisible();
      await expect(main.getByText('Berichtigung').first()).toBeVisible();
      await expect(main.getByText('Löschung').first()).toBeVisible();
      await expect(main.getByText('Widerspruch').first()).toBeVisible();
    });

    test('should mention hosting in Germany', async ({ page }) => {
      const main = page.locator('main');
      await expect(main.getByText(/24fire/).first()).toBeVisible();
      await expect(main.getByText(/Deutschland/).first()).toBeVisible();
    });

    test('should contain Kontaktformular section', async ({ page }) => {
      await expect(page.locator('main').getByText('Kontaktformular').first()).toBeVisible();
    });

    test('should contain Server-Log-Dateien section', async ({ page }) => {
      await expect(page.locator('main').getByRole('heading', { name: 'Server-Log-Dateien' })).toBeVisible();
    });

    test('should contain Newsletter section', async ({ page }) => {
      await expect(page.locator('main').locator('h2').filter({ hasText: 'Newsletter' })).toBeVisible();
      await expect(page.locator('main').getByText(/Double-Opt-In/)).toBeVisible();
    });
  });
});
