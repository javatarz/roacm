import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog/');
  });

  test('search returns results for known content', async ({ page }) => {
    const searchInput = page.locator('#search-input');

    // Fill search input with known term that appears across many posts
    await searchInput.fill('code');

    // Wait for search results to appear
    await page.waitForSelector('.search-results.visible', { timeout: 5000 });

    // Verify results are visible
    const searchResults = page.locator('.search-results');
    await expect(searchResults).toHaveClass(/visible/);

    // Verify at least one result item exists
    const resultItems = page.locator('.search-result-item');
    const count = await resultItems.count();
    expect(count).toBeGreaterThan(0);

    // Verify result structure
    const firstResult = resultItems.first();
    await expect(firstResult.locator('.search-result-title')).toBeVisible();
    await expect(firstResult.locator('.search-result-excerpt')).toBeVisible();
    await expect(firstResult.locator('.search-result-date')).toBeVisible();
  });

  test('search shows "no results" for non-existent content', async ({ page }) => {
    const searchInput = page.locator('#search-input');

    // Search for something that doesn't exist
    await searchInput.fill('xyznonexistentquery123');

    // Wait for results container to appear
    await page.waitForSelector('.search-results.visible', { timeout: 5000 });

    // Verify no results message
    const noResults = page.locator('.search-no-results');
    await expect(noResults).toBeVisible();
    await expect(noResults).toContainText('No results found');
  });

  test('search hides results when query is too short', async ({ page }) => {
    const searchInput = page.locator('#search-input');

    // Type single character (below 2 character minimum)
    await searchInput.fill('a');

    // Wait a bit for debounce
    await page.waitForTimeout(300);

    // Verify results are not visible
    const searchResults = page.locator('.search-results');
    await expect(searchResults).not.toHaveClass(/visible/);
  });

  test('search results are clickable and navigate correctly', async ({ page }) => {
    const searchInput = page.locator('#search-input');

    // Search for common term that appears across many posts
    await searchInput.fill('code');

    // Wait for results
    await page.waitForSelector('.search-result-item', { timeout: 5000 });

    // Click first result
    const firstResult = page.locator('.search-result-item').first();
    const href = await firstResult.getAttribute('href');

    // Verify href exists and is valid
    expect(href).toBeTruthy();
    expect(href).toMatch(/^\/blog\//);

    // Navigate by clicking
    await firstResult.click();

    // Verify navigation occurred
    await expect(page).toHaveURL(new RegExp(href!));
  });

  test('search keyboard shortcut (Cmd+K) focuses input', async ({ page }) => {
    const searchInput = page.locator('#search-input');

    // Ensure input is not focused initially
    await page.locator('body').click();
    await expect(searchInput).not.toBeFocused();

    // Wait for focus transition to complete before sending keyboard event
    await page.waitForTimeout(100);

    // Press Cmd+K (or Ctrl+K on non-Mac)
    await page.keyboard.press('Meta+k');

    // Verify input is focused
    await expect(searchInput).toBeFocused();
  });

  test('search results close on Escape key', async ({ page }) => {
    const searchInput = page.locator('#search-input');

    // Open search results
    await searchInput.fill('terraform');
    await page.waitForSelector('.search-results.visible', { timeout: 5000 });

    // Press Escape
    await page.keyboard.press('Escape');

    // Wait a bit for animation
    await page.waitForTimeout(300);

    // Verify results are hidden
    const searchResults = page.locator('.search-results');
    await expect(searchResults).not.toHaveClass(/visible/);

    // Verify input lost focus
    await expect(searchInput).not.toBeFocused();
  });

  test('lunr.js library loads correctly', async ({ page }) => {
    // Verify lunr is available globally
    const lunrAvailable = await page.evaluate(() => {
      return typeof window.lunr !== 'undefined';
    });

    expect(lunrAvailable).toBe(true);
  });
});
