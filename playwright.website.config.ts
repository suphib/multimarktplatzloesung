import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-website',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5502',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],
  webServer: {
    command: 'npm run dev --workspace=apps/website',
    url: 'http://localhost:5502',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
