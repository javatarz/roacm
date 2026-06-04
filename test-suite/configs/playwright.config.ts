import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

export default defineConfig({
  testDir: path.join(__dirname, '../tests'),
  outputDir: path.join(__dirname, '../reports/playwright-results'),
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}-{projectName}-{platform}{ext}',
  // Snapshot runs render in a container (STATIC_SERVE); under arch emulation a
  // cold page render can exceed 30s, so give those runs more headroom.
  timeout: process.env.STATIC_SERVE ? 90000 : 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Single worker for snapshot runs (CI and the local container). Parallel
  // workers contend for CPU and let some pages (e.g. long posts in WebKit) be
  // captured before layout fully settles, producing non-deterministic heights.
  // PLAYWRIGHT_WORKERS overrides this for experiments with larger Colima VMs
  // (e.g. PLAYWRIGHT_WORKERS=3 on a 6-CPU VM). Validate determinism with
  // regen → verify → verify before committing to a higher worker count.
  workers: process.env.PLAYWRIGHT_WORKERS
    ? parseInt(process.env.PLAYWRIGHT_WORKERS)
    : (process.env.CI || process.env.STATIC_SERVE ? 1 : undefined),
  // Update missing snapshots in CI to generate platform-specific baselines
  updateSnapshots: process.env.UPDATE_SNAPSHOTS === 'missing' ? 'missing' : 'none',
  reporter: [
    // PLAYWRIGHT_HTML_REPORT lets parallel browser containers each write to their
    // own dir so concurrent runs don't clobber each other's HTML reports.
    ['html', { outputFolder: process.env.PLAYWRIGHT_HTML_REPORT ?? path.join(__dirname, '../reports/playwright-html') }],
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
    // STATIC_SERVE: serve a prebuilt _site (used inside the Playwright Docker
    // container, which has no Ruby). CI: live Jekyll. Local dev: native server.
    command: process.env.STATIC_SERVE
      ? 'node test-suite/scripts/static-server.js'
      : process.env.CI
        ? 'bundle exec jekyll serve --host 0.0.0.0 --port 4000'
        : './local_run_native.sh --no-livereload',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI && !process.env.STATIC_SERVE,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120000,
    cwd: path.join(__dirname, '../..'),
  },
});