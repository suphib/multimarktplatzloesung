import { test } from '@playwright/test';
import path from 'path';

const OUTPUT_DIR = path.resolve(__dirname, '../apps/website/public/images/screenshots');

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
} as const;

// Fetch an order with approval data for the detail screenshot
async function getBestellungId(baseURL: string): Promise<string> {
  const res = await fetch(`${baseURL.replace('5500', '3050')}/api/v1/admin/bestellungen`);
  const orders = await res.json() as { id: string; status: string }[];
  // Prefer an approved order (richest detail), fallback to any
  const approved = orders.find((o) => o.status === 'GENEHMIGT');
  return approved?.id ?? orders[0]?.id ?? '1';
}

const PAGES = [
  { name: 'search', path: '/search' },
  { name: 'results', path: '/results?q=Laptop' },
  { name: 'admin-dashboard', path: '/admin/dashboard' },
  { name: 'admin-rahmenvertraege', path: '/admin/rahmenvertraege' },
  { name: 'admin-bestellungen', path: '/admin/bestellungen' },
  { name: 'admin-bestellung-detail', path: '' }, // resolved dynamically
  { name: 'admin-katalog', path: '/admin/katalog' },
  { name: 'admin-verbindungen', path: '/admin/verbindungen' },
  { name: 'admin-oci-config', path: '/admin/oci-config' },
] as const;

for (const viewport of Object.entries(VIEWPORTS)) {
  const [viewportName, size] = viewport;

  for (const page of PAGES) {
    test(`screenshot ${viewportName} – ${page.name}`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({
        viewport: size,
        deviceScaleFactor: viewportName === 'mobile' ? 2 : 1,
        locale: 'de-DE',
      });
      const tab = await context.newPage();

      // Resolve dynamic path for bestellung-detail
      let pagePath = page.path;
      if (page.name === 'admin-bestellung-detail') {
        const id = await getBestellungId(baseURL!);
        pagePath = `/admin/bestellungen/${id}`;
      }

      await tab.goto(pagePath, { waitUntil: 'networkidle' });

      // Switch to German if the UI defaults to English
      const langToggle = tab.locator('button:has-text("DE"), a:has-text("DE")').first();
      if (await langToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
        await langToggle.click();
        await tab.waitForTimeout(1000);
      }

      // Wait for any loading spinners / skeletons to disappear
      await tab.waitForTimeout(1500);

      // For results page, wait for actual results to render
      if (page.name === 'results') {
        await tab.waitForSelector('[class*="card"], [class*="Card"], [class*="result"], [class*="Result"], table tbody tr', {
          timeout: 10_000,
        }).catch(() => { /* best-effort */ });
        await tab.waitForTimeout(500);
      }

      // For admin detail page, wait for content
      if (page.name === 'admin-bestellung-detail') {
        await tab.waitForSelector('[class*="timeline"], [class*="Timeline"], [class*="status"], [class*="detail"], [class*="Detail"]', {
          timeout: 10_000,
        }).catch(() => { /* best-effort */ });
        await tab.waitForTimeout(500);
      }

      const outputPath = path.join(OUTPUT_DIR, viewportName, `${page.name}.png`);
      await tab.screenshot({ path: outputPath, fullPage: false });

      await context.close();
    });
  }
}
