import { test, expect, Page } from '@playwright/test';
import { stabilize } from './helpers/stabilize';

/**
 * Comprehensive Visual Regression Tests
 *
 * Tests visual appearance across all major pages and viewports.
 * Organized into tiers by priority:
 * - Tier 1: Critical pages (homepage, blog index, archive)
 * - Tier 2: Important pages (about, talks, blog post)
 * - Tier 3: Secondary pages (category, tag, 404)
 *
 * Dark mode: set via localStorage before navigation (fast path). The UI
 * click path is covered by theme.spec.ts 'theme toggle switches between
 * light and dark modes @visual'.
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

interface PageDef {
  name: string;
  path: string;
}

// Tier 1: Critical pages
const tier1Pages: PageDef[] = [
  { name: 'homepage', path: '/' },
  { name: 'blog-index', path: '/blog/' },
  { name: 'archive', path: '/blog/archive/' },
];

// Tier 2: Important pages
const tier2Pages: PageDef[] = [
  { name: 'about', path: '/about/' },
  { name: 'talks', path: '/talks/' },
  { name: 'blog-post', path: '/blog/2025/07/29/level-up-code-quality-with-an-ai-assistant/' },
];

// Tier 3: Secondary pages
const tier3Pages: PageDef[] = [
  { name: 'category', path: '/blog/categories/software-design/' },
  { name: 'tag', path: '/blog/tags/architecture/' },
  { name: '404', path: '/nonexistent-page/' },
];

function registerPageTests(label: string, pages: PageDef[]) {
  test.describe(`Visual Regression - ${label}`, () => {
    for (const page of pages) {
      for (const viewport of viewports) {
        test(`${page.name} - ${viewport.name} (${viewport.width}x${viewport.height}) @visual`, async ({ page: pw }) => {
          await pw.setViewportSize(viewport);
          await pw.goto(page.path);
          await pw.waitForLoadState('domcontentloaded');
          await stabilize(pw);
          await expect(pw).toHaveScreenshot(`${page.name}-${viewport.name}.png`, {
            fullPage: true,
            animations: 'disabled',
            maxDiffPixelRatio: 0.02,
            timeout: 15000,
          });
        });
      }

      test(`${page.name} - dark mode (desktop) @visual`, async ({ page: pw }) => {
        await pw.addInitScript(() => localStorage.setItem('theme', 'dark'));
        await pw.setViewportSize({ width: 1920, height: 1080 });
        await pw.goto(page.path);
        await pw.waitForLoadState('domcontentloaded');
        await stabilize(pw);
        await expect(pw).toHaveScreenshot(`${page.name}-dark.png`, {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixelRatio: 0.02,
          timeout: 15000,
        });
      });
    }
  });
}

registerPageTests('Tier 1 (Critical Pages)', tier1Pages);
registerPageTests('Tier 2 (Important Pages)', tier2Pages);
registerPageTests('Tier 3 (Secondary Pages)', tier3Pages);

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
