import { test, expect, Page } from '@playwright/test';

/**
 * Smoke test for what real readers get: a JEKYLL_ENV=production build.
 *
 * Every other e2e/visual test runs against `jekyll serve` in development, which
 * loads the unbundled script list and omits the Umami tracker. A minify-only
 * bug (mangled names, a script missing from build:js) or a production-only
 * include would ship unchecked. This spec runs against the built production
 * artifact served statically, so it exercises bundle.min.js itself (#299).
 *
 * Skipped unless PROD_BUNDLE=1; run it with `npm run test:production` after a
 * production build (`JEKYLL_ENV=production bundle exec jekyll build`).
 */
test.skip(!process.env.PROD_BUNDLE, 'needs a production build; run npm run test:production');

const POST = '/blog/2025/07/29/level-up-code-quality-with-an-ai-assistant/';

const DEV_ONLY_SCRIPTS = [
  'umami-tracker.js',
  'code-blocks.js',
  'reading-progress.js',
  'back-to-top.js',
  'lazy-loading.js',
  'image-zoom-links.js',
  'toc.js',
  'search.js',
  'mobile-menu.js',
  'upcoming-talks.js',
];

test.beforeEach(async ({ page }) => {
  // External services: stub so a third-party outage cannot fail this check.
  await page.route('**/*.vercel.app/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.umami = { track() {} };' }),
  );
  await page.route('**/giscus.app/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  await page.route('**/youtube.com/**', (route) => route.abort());
  await page.route('**/ytimg.com/**', (route) => route.abort());
});

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    // Network failures of blocked third parties are expected; script errors are not.
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) {
      errors.push(`console: ${message.text()}`);
    }
  });
  return errors;
}

test.describe('Production bundle', () => {
  test('pages load bundle.min.js instead of the dev script list', async ({ page }) => {
    for (const path of ['/', POST]) {
      await page.goto(path);
      const sources = await page.evaluate(() =>
        Array.from(document.querySelectorAll('script[src]')).map((s) => s.getAttribute('src') || ''),
      );
      expect(sources.some((src) => src.endsWith('/assets/js/bundle.min.js')), `${path} should load bundle.min.js`).toBe(true);
      for (const dev of DEV_ONLY_SCRIPTS) {
        expect(
          sources.some((src) => src.endsWith(`/assets/js/${dev}`)),
          `${path} should not load ${dev} separately`,
        ).toBe(false);
      }
    }
  });

  test('bundle.min.js is served as non-trivial JavaScript', async ({ request }) => {
    const response = await request.get('/assets/js/bundle.min.js');
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toMatch(/javascript/);
    expect((await response.text()).length).toBeGreaterThan(10_000);
  });

  test('Umami tracker is included in production', async ({ page }) => {
    await page.goto(POST);
    await expect(page.locator('script[data-website-id]')).toHaveCount(1);
    expect(await page.evaluate(() => typeof (window as unknown as { UmamiTracker?: unknown }).UmamiTracker)).toBe('object');
  });

  test('home and post run with no uncaught script errors', async ({ page }) => {
    const errors = collectErrors(page);
    for (const path of ['/', POST]) {
      await page.goto(path);
      await page.waitForLoadState('load');
    }
    expect(errors).toEqual([]);
  });

  test('minified features work: table of contents', async ({ page }) => {
    await page.goto(POST);
    expect(await page.locator('.toc-link').count()).toBeGreaterThan(0);
  });

  test('minified features work: search', async ({ page }) => {
    await page.goto(POST);
    await page.locator('#search-input').fill('code');
    await page.waitForSelector('.search-results.visible', { timeout: 5000 });
    expect(await page.locator('.search-result-item').count()).toBeGreaterThan(0);
  });

  test('minified features work: mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(POST);
    const hamburger = page.locator('#hamburger-menu');
    await hamburger.click();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
  });
});
