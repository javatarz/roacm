import { Page } from '@playwright/test';

/**
 * Make a page deterministic before a visual screenshot.
 *
 * Two sources of run-to-run (and local-vs-CI) flake on this site:
 *  1. Web fonts loaded with `display=swap` (Open Sans + Font Awesome) — the
 *     page first paints a fallback font, then swaps. Whichever state the
 *     screenshot catches varies, producing a ~3% text diff. `document.fonts.ready`
 *     waits for the swap to complete.
 *  2. Lazy-loaded images (`loading="lazy"`) below the fold don't load until
 *     scrolled, so a `fullPage` capture can race image loads. We force them
 *     eager and wait for every image to settle.
 *
 * Call this immediately before `toHaveScreenshot`.
 */
export async function stabilize(page: Page): Promise<void> {
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
      img.setAttribute('loading', 'eager');
    });

    await Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve(), { once: true });
              img.addEventListener('error', () => resolve(), { once: true });
            }),
        ),
    );

    await document.fonts.ready;

    // Wait until layout has actually stopped changing. fonts.ready / image load
    // resolving doesn't guarantee the resulting reflow has been applied — under
    // CPU load (a long serial run) a screenshot can be captured a frame early,
    // drifting long-page heights. Poll scrollHeight until it's stable across
    // several frames (capped so an animating page can't hang the run).
    await new Promise<void>((resolve) => {
      let last = -1;
      let stableFrames = 0;
      let totalFrames = 0;
      const tick = () => {
        const h = document.documentElement.scrollHeight;
        if (h === last) {
          stableFrames += 1;
        } else {
          stableFrames = 0;
          last = h;
        }
        totalFrames += 1;
        if (stableFrames >= 5 || totalFrames >= 120) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  });
}
