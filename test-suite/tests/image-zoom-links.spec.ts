import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Every link that wraps an image in a post must resolve to a real file.
 *
 * image-zoom-links.js wraps images in a link to the original, and authors also
 * hand-wrap images. A relative-path mistake or a missing original only shows up
 * as a dead link in the browser. Unit tests (test-suite/unit) cover the wrapping
 * logic; this crawls the real built posts to cover the wiring (#299).
 *
 * Reads the built sitemap directly, like image-overflow.spec.ts, and runs once
 * on mobile-chrome to keep CI time down.
 */

const sitemapPath = path.join(__dirname, '../../_site/sitemap.xml');
const sitemapXml = fs.readFileSync(sitemapPath, 'utf-8');
const postPaths = Array.from(
  sitemapXml.matchAll(/<loc>https?:\/\/[^/]+(\/blog\/\d{4}\/\d{2}\/\d{2}\/[^<]+)<\/loc>/g),
).map((match) => match[1]);

test.describe('Image links in posts resolve (mobile)', () => {
  for (const postPath of postPaths) {
    test(`${postPath} - image links resolve`, async ({ page, request }, testInfo) => {
      test.skip(testInfo.project.name !== 'mobile-chrome', 'checked once, on mobile-chrome only');

      await page.goto(postPath);
      await page.waitForLoadState('load');
      // Lazy images below the fold never load (and never report `complete`) until
      // scrolled, so force them eager first, as the visual helper does. The zoom
      // script wraps images on load; then wait for every image to settle.
      await page.evaluate(() => {
        document.querySelectorAll('#main-content .post-content img[loading="lazy"]').forEach((img) => img.setAttribute('loading', 'eager'));
      });
      await page.waitForFunction(() =>
        Array.from(document.querySelectorAll('#main-content .post-content img')).every((img) => (img as HTMLImageElement).complete),
      );

      const hrefs = await page.evaluate(() => {
        const origin = window.location.origin;
        const found = new Set<string>();
        document.querySelectorAll('#main-content .post-content a').forEach((a) => {
          if (!a.querySelector('img, picture')) return;
          const url = new URL((a as HTMLAnchorElement).href, window.location.href);
          if (url.origin === origin) found.add(url.pathname + url.search);
        });
        return Array.from(found);
      });

      for (const href of hrefs) {
        const response = await request.get(href);
        expect(response.ok(), `${postPath}: image link ${href} should resolve (got ${response.status()})`).toBe(true);
      }
    });
  }
});
