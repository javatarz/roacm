import { test, expect } from '@playwright/test';

/**
 * Comprehensive Visual Regression Tests
 *
 * Tests visual appearance across all major pages and viewports.
 * Organized into tiers by priority:
 * - Tier 1: Critical pages (homepage, blog index, archive)
 * - Tier 2: Important pages (about, talks, blog post)
 * - Tier 3: Secondary pages (category, tag, 404)
 */

// Block external services that cause flaky tests due to async loading
test.beforeEach(async ({ page }) => {
  // Block Giscus comments - loads asynchronously and causes variable page height
  await page.route('**/giscus.app/**', (route) => route.abort());
});

const viewports = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

// Tier 1: Critical pages
const tier1Pages = [
  { name: 'homepage', path: '/', description: 'Homepage with hero and sections' },
  { name: 'blog-index', path: '/blog/', description: 'Blog index with post listings' },
  { name: 'archive', path: '/blog/archive/', description: 'Blog archive by year' },
];

// Tier 2: Important pages
const tier2Pages = [
  { name: 'about', path: '/about/', description: 'About page' },
  { name: 'talks', path: '/talks/', description: 'Talks page with videos' },
  { name: 'blog-post', path: '/blog/2025/07/29/level-up-code-quality-with-an-ai-assistant/', description: 'Sample blog post' },
];

// Tier 3: Secondary pages
const tier3Pages = [
  { name: 'category', path: '/blog/categories/software-design/', description: 'Category page' },
  { name: 'tag', path: '/blog/tags/architecture/', description: 'Tag page' },
  { name: '404', path: '/nonexistent-page/', description: '404 error page' },
];

test.describe('Visual Regression - Tier 1 (Critical Pages)', () => {
  for (const page of tier1Pages) {
    for (const viewport of viewports) {
      test(`${page.name} - ${viewport.name} (${viewport.width}x${viewport.height}) @visual`, async ({ page: pw }) => {
        await pw.setViewportSize(viewport);
        await pw.goto(page.path);

        // Wait for any dynamic content to load
        // Use domcontentloaded instead of networkidle to avoid timeouts with embeds
        await pw.waitForLoadState('domcontentloaded');

        // Wait a bit for lazy-loaded content and images to settle
        await pw.waitForTimeout(300);

        // Take screenshot with increased timeout for stability
        await expect(pw).toHaveScreenshot(`${page.name}-${viewport.name}.png`, {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixelRatio: 0.02,
          timeout: 15000,
        });
      });
    }

    test(`${page.name} - dark mode (desktop) @visual`, async ({ page: pw }) => {
      await pw.setViewportSize({ width: 1920, height: 1080 });
      await pw.goto(page.path);

      // Wait for content to load
      await pw.waitForLoadState('domcontentloaded');
      await pw.waitForTimeout(300);

      // Switch to dark mode
      const themeToggle = pw.locator('#theme-toggle');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await pw.waitForTimeout(100);
      }

      await expect(pw).toHaveScreenshot(`${page.name}-dark.png`, {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.02,
        timeout: 15000,
      });
    });
  }
});

test.describe('Visual Regression - Tier 2 (Important Pages)', () => {
  for (const page of tier2Pages) {
    for (const viewport of viewports) {
      test(`${page.name} - ${viewport.name} (${viewport.width}x${viewport.height}) @visual`, async ({ page: pw }) => {
        await pw.setViewportSize(viewport);
        await pw.goto(page.path);

        // Wait for any dynamic content to load
        // Use domcontentloaded instead of networkidle to avoid timeouts with embeds
        await pw.waitForLoadState('domcontentloaded');

        // Wait a bit for lazy-loaded content and images to settle
        await pw.waitForTimeout(300);

        // Take screenshot with increased timeout for stability
        await expect(pw).toHaveScreenshot(`${page.name}-${viewport.name}.png`, {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixelRatio: 0.02,
          timeout: 15000,
        });
      });
    }

    test(`${page.name} - dark mode (desktop) @visual`, async ({ page: pw }) => {
      await pw.setViewportSize({ width: 1920, height: 1080 });
      await pw.goto(page.path);

      // Wait for content to load
      await pw.waitForLoadState('domcontentloaded');
      await pw.waitForTimeout(300);

      // Switch to dark mode
      const themeToggle = pw.locator('#theme-toggle');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await pw.waitForTimeout(100);
      }

      await expect(pw).toHaveScreenshot(`${page.name}-dark.png`, {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.02,
        timeout: 15000,
      });
    });
  }
});

test.describe('Visual Regression - Tier 3 (Secondary Pages)', () => {
  for (const page of tier3Pages) {
    for (const viewport of viewports) {
      test(`${page.name} - ${viewport.name} (${viewport.width}x${viewport.height}) @visual`, async ({ page: pw }) => {
        await pw.setViewportSize(viewport);
        await pw.goto(page.path);

        // Wait for any dynamic content to load
        // Use domcontentloaded instead of networkidle to avoid timeouts with embeds
        await pw.waitForLoadState('domcontentloaded');

        // Wait a bit for lazy-loaded content and images to settle
        await pw.waitForTimeout(300);

        // Take screenshot with increased timeout for stability
        await expect(pw).toHaveScreenshot(`${page.name}-${viewport.name}.png`, {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixelRatio: 0.02,
          timeout: 15000,
        });
      });
    }

    test(`${page.name} - dark mode (desktop) @visual`, async ({ page: pw }) => {
      await pw.setViewportSize({ width: 1920, height: 1080 });
      await pw.goto(page.path);

      // Wait for content to load
      await pw.waitForLoadState('domcontentloaded');
      await pw.waitForTimeout(300);

      // Switch to dark mode
      const themeToggle = pw.locator('#theme-toggle');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await pw.waitForTimeout(100);
      }

      await expect(pw).toHaveScreenshot(`${page.name}-dark.png`, {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.02,
        timeout: 15000,
      });
    });
  }
});

test.describe('Visual Regression - Responsive Layout', () => {
  test('blog index has no horizontal scroll at all viewports', async ({ page, browserName }) => {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/blog/');

      const isWebKitMobile = browserName === 'webkit' && viewport.name === 'mobile';
      if (!isWebKitMobile) {
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBe(false);
      }
    }
  });
});
