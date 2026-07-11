import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Guards every published post against horizontal overflow at mobile width.
 *
 * Deliberately does NOT check for `.diagram-*` class usage on images — a
 * class-presence check only catches "did the author remember the class,"
 * not "does the page actually overflow." Checking the real invariant
 * (no horizontal scroll) catches the class-forgotten case too, since the
 * base `img` rule now caps unclassed images the same way (see #295), and
 * it also catches any future overflow source that isn't even image-related.
 *
 * Reads the built sitemap directly (not over HTTP) so the URL list is fixed
 * at collection time, same as the hardcoded page lists in visual.spec.ts.
 */

const sitemapPath = path.join(__dirname, '../../_site/sitemap.xml');
const sitemapXml = fs.readFileSync(sitemapPath, 'utf-8');
const postPaths = Array.from(
  sitemapXml.matchAll(/<loc>https?:\/\/[^/]+(\/blog\/\d{4}\/\d{2}\/\d{2}\/[^<]+)<\/loc>/g),
).map((match) => match[1]);

test.describe('Post pages have no horizontal scroll (mobile)', () => {
  for (const postPath of postPaths) {
    test(`${postPath} - no horizontal scroll`, async ({ page }, testInfo) => {
      // One mobile project is enough to catch this class of bug; running all
      // ~120 posts across every browser project would multiply CI time for
      // no extra signal.
      test.skip(testInfo.project.name !== 'mobile-chrome', 'checked once, on mobile-chrome only');

      await page.goto(postPath);
      await page.waitForLoadState('domcontentloaded');

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll, `${postPath} overflows horizontally on mobile`).toBe(false);
    });
  }
});
