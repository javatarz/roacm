import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const MOBILE_BREAKPOINT = 1280;

test.describe('Mobile Navigation Menu', () => {
  test.describe('Hamburger Button Visibility', () => {
    test('hamburger button is hidden on desktop (>=1280px)', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/blog/');

      const hamburger = page.locator('#hamburger-menu');
      await expect(hamburger).toBeHidden();
    });

    test('hamburger button is visible on mobile (<1280px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/blog/');

      const hamburger = page.locator('#hamburger-menu');
      await expect(hamburger).toBeVisible();
    });

    test('hamburger button appears at exactly 1279px', async ({ page }) => {
      await page.setViewportSize({ width: 1279, height: 800 });
      await page.goto('/blog/');

      const hamburger = page.locator('#hamburger-menu');
      await expect(hamburger).toBeVisible();
    });

    test('hamburger button hidden at exactly 1280px', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/blog/');

      const hamburger = page.locator('#hamburger-menu');
      await expect(hamburger).toBeHidden();
    });
  });

  test.describe('Menu Open/Close Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/blog/');
    });

    test('clicking hamburger opens sidebar', async ({ page }) => {
      const hamburger = page.locator('#hamburger-menu');
      const sidebar = page.locator('#mobile-sidebar');

      await hamburger.click();

      await expect(sidebar).toHaveClass(/is-open/);
      await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    });

    test('clicking hamburger again closes sidebar', async ({ page }) => {
      const hamburger = page.locator('#hamburger-menu');
      const sidebar = page.locator('#mobile-sidebar');

      // Open
      await hamburger.click();
      await expect(sidebar).toHaveClass(/is-open/);

      // Close
      await hamburger.click();
      await expect(sidebar).not.toHaveClass(/is-open/);
      await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    });

    test('clicking backdrop closes sidebar', async ({ page }) => {
      const hamburger = page.locator('#hamburger-menu');
      const sidebar = page.locator('#mobile-sidebar');
      const backdrop = page.locator('#sidebar-backdrop');

      await hamburger.click();
      await expect(sidebar).toHaveClass(/is-open/);

      // Click backdrop (click outside sidebar area)
      await backdrop.click({ position: { x: 350, y: 400 } });

      await expect(sidebar).not.toHaveClass(/is-open/);
    });

    test('pressing Escape closes sidebar', async ({ page }) => {
      const hamburger = page.locator('#hamburger-menu');
      const sidebar = page.locator('#mobile-sidebar');

      await hamburger.click();
      await expect(sidebar).toHaveClass(/is-open/);

      await page.keyboard.press('Escape');

      await expect(sidebar).not.toHaveClass(/is-open/);
    });

    test('clicking navigation link closes sidebar', async ({ page }) => {
      const hamburger = page.locator('#hamburger-menu');
      const sidebar = page.locator('#mobile-sidebar');

      await hamburger.click();
      await expect(sidebar).toHaveClass(/is-open/);

      // Click the site title link in sidebar
      await sidebar.locator('a').first().click();

      // Menu should auto-close
      await expect(sidebar).not.toHaveClass(/is-open/);
    });

    test('body scroll is prevented when menu is open', async ({ page }) => {
      const hamburger = page.locator('#hamburger-menu');

      await hamburger.click();

      const hasMenuOpenClass = await page.evaluate(() => {
        return document.body.classList.contains('menu-open');
      });
      expect(hasMenuOpenClass).toBe(true);
    });
  });

  test.describe('Touch Target Sizing', () => {
    test('hamburger button meets 44x44px minimum touch target', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/blog/');

      const hamburger = page.locator('#hamburger-menu');
      const box = await hamburger.boundingBox();

      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });
  });

  test.describe('Focus Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/blog/');
    });

    test('focus moves to sidebar when opened', async ({ page, browserName }) => {
      // Skip on WebKit - different focus behavior
      test.skip(browserName === 'webkit', 'WebKit has different focus handling');

      const hamburger = page.locator('#hamburger-menu');

      await hamburger.click();

      // Wait for focus to move (setTimeout in JS)
      await page.waitForTimeout(150);

      // Focus should be inside sidebar
      const focusedInSidebar = await page.evaluate(() => {
        const sidebar = document.getElementById('mobile-sidebar');
        return sidebar?.contains(document.activeElement) ?? false;
      });
      expect(focusedInSidebar).toBe(true);
    });

    test('focus returns to hamburger when closed via Escape', async ({ page, browserName }) => {
      // Skip on WebKit - different focus behavior
      test.skip(browserName === 'webkit', 'WebKit has different focus handling');

      const hamburger = page.locator('#hamburger-menu');

      await hamburger.click();
      await page.waitForTimeout(150);

      await page.keyboard.press('Escape');

      await expect(hamburger).toBeFocused();
    });

    test('Tab cycles through focusable elements in open sidebar', async ({ page, browserName }) => {
      // Skip on WebKit - requires system settings for tab navigation
      test.skip(browserName === 'webkit', 'WebKit requires system settings for tab navigation');

      const hamburger = page.locator('#hamburger-menu');
      const sidebar = page.locator('#mobile-sidebar');

      await hamburger.click();
      await page.waitForTimeout(150);

      // Get focusable elements count
      const focusableCount = await sidebar.locator('a[href], button, input').count();

      // Tab through all elements plus one more
      for (let i = 0; i <= focusableCount; i++) {
        await page.keyboard.press('Tab');
      }

      // Focus should cycle back to first element in sidebar (focus trap)
      const focusedInSidebar = await page.evaluate(() => {
        const sidebar = document.getElementById('mobile-sidebar');
        return sidebar?.contains(document.activeElement) ?? false;
      });
      expect(focusedInSidebar).toBe(true);
    });
  });

  test.describe('Viewport Resize Behavior', () => {
    test('menu auto-closes when viewport expands past breakpoint', async ({ page }) => {
      // Start at mobile size
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/blog/');

      const hamburger = page.locator('#hamburger-menu');
      const sidebar = page.locator('#mobile-sidebar');

      // Open menu
      await hamburger.click();
      await expect(sidebar).toHaveClass(/is-open/);

      // Expand viewport past breakpoint
      await page.setViewportSize({ width: 1400, height: 900 });

      // Wait for resize handler debounce
      await page.waitForTimeout(150);

      // Menu should auto-close
      await expect(sidebar).not.toHaveClass(/is-open/);
    });
  });
});

test.describe('Mobile Navigation Accessibility', () => {
  test('hamburger button has correct ARIA attributes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/blog/');

    const hamburger = page.locator('#hamburger-menu');

    await expect(hamburger).toHaveAttribute('aria-label', 'Open navigation menu');
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(hamburger).toHaveAttribute('aria-controls', 'mobile-sidebar');
  });

  test('ARIA attributes update when menu opens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/blog/');

    const hamburger = page.locator('#hamburger-menu');

    await hamburger.click();

    await expect(hamburger).toHaveAttribute('aria-label', 'Close navigation menu');
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
  });

  test('sidebar has navigation role and label', async ({ page }) => {
    await page.goto('/blog/');

    const sidebar = page.locator('#mobile-sidebar');

    await expect(sidebar).toHaveAttribute('role', 'navigation');
    await expect(sidebar).toHaveAttribute('aria-label', 'Site navigation');
  });

  test('meets WCAG standards with menu open @a11y', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/blog/');

    // Open menu
    await page.locator('#hamburger-menu').click();
    await page.waitForTimeout(100);

    // Run accessibility scan
    const results = await new AxeBuilder({ page })
      .include('#mobile-sidebar')
      .include('#hamburger-menu')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    if (criticalViolations.length > 0) {
      console.log('Mobile menu a11y violations:', JSON.stringify(criticalViolations, null, 2));
    }

    expect(criticalViolations).toEqual([]);
  });
});

test.describe('Mobile Navigation Visual Regression', () => {
  const mobileViewports = [
    { name: 'iphone-12', width: 390, height: 844 },
    { name: 'pixel-5', width: 393, height: 851 },
    { name: 'ipad-portrait', width: 768, height: 1024 },
    { name: 'tablet-landscape', width: 1024, height: 768 },
  ];

  for (const viewport of mobileViewports) {
    test(`sidebar closed - ${viewport.name} @visual`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/blog/');

      await expect(page).toHaveScreenshot(`mobile-menu-closed-${viewport.name}.png`, {
        fullPage: false,
        animations: 'disabled',
        maxDiffPixelRatio: 0.02,
      });
    });

    test(`sidebar open - ${viewport.name} @visual`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/blog/');

      await page.locator('#hamburger-menu').click();
      await page.waitForTimeout(350); // Wait for animation

      await expect(page).toHaveScreenshot(`mobile-menu-open-${viewport.name}.png`, {
        fullPage: false,
        animations: 'disabled',
        maxDiffPixelRatio: 0.02,
      });
    });
  }
});

test.describe('Mobile Navigation Dark Mode', () => {
  test('hamburger and sidebar style correctly in dark mode @visual', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/blog/');

    // Switch to dark mode
    await page.locator('#theme-toggle').click();
    await page.waitForTimeout(100);

    // Open mobile menu
    await page.locator('#hamburger-menu').click();
    await page.waitForTimeout(350);

    await expect(page).toHaveScreenshot('mobile-menu-dark-mode.png', {
      fullPage: false,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
