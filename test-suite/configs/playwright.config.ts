import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

export default defineConfig({
  testDir: path.join(__dirname, '../tests'),
  outputDir: path.join(__dirname, '../reports/playwright-results'),
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}-{projectName}-{platform}{ext}',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // Update missing snapshots in CI to generate platform-specific baselines
  updateSnapshots: process.env.UPDATE_SNAPSHOTS === 'missing' ? 'missing' : 'none',
  reporter: [
    ['html', { outputFolder: path.join(__dirname, '../reports/playwright-html') }],
    ['json', { outputFile: path.join(__dirname, '../reports/playwright.json') }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet viewports
    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'] },
    },

    // Custom viewports for your specific needs
    {
      name: 'macbook-pro-14',
      use: {
        viewport: { width: 1512, height: 982 },
        deviceScaleFactor: 2,
      },
    },
  ],

  webServer: {
    command: process.env.CI
      ? 'bundle exec jekyll serve --host 0.0.0.0 --port 4000'
      : './local_run.sh',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120000,
    cwd: path.join(__dirname, '../..'),
  },
});