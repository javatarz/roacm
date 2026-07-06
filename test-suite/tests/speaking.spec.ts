import { test, expect } from '@playwright/test';

function daysFromNow(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

const SPEAKING_GRID = 'section[aria-labelledby="speaking-heading"] .homepage-cards-grid';

test.describe('Homepage Speaking Section - Upcoming Ribbon', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows ribbon for a talk 3 days in the future', async ({ page }) => {
    await page.evaluate(
      ({ futureDate, gridSelector }) => {
        const grid = document.querySelector(gridSelector);
        const card = document.createElement('a');
        card.className = 'homepage-card';
        card.dataset.talkDate = futureDate;
        card.innerHTML = '<span class="upcoming-ribbon" hidden>Upcoming</span>';
        grid?.appendChild(card);
      },
      { futureDate: daysFromNow(3), gridSelector: SPEAKING_GRID }
    );

    await page.evaluate(() => (window as any).__evaluateUpcomingTalks());

    const ribbon = page.locator(`${SPEAKING_GRID} .homepage-card[data-talk-date]`).last().locator('.upcoming-ribbon');
    await expect(ribbon).toBeVisible();
  });

  test('hides ribbon for a talk 3 days in the past', async ({ page }) => {
    await page.evaluate(
      ({ pastDate, gridSelector }) => {
        const grid = document.querySelector(gridSelector);
        const card = document.createElement('a');
        card.className = 'homepage-card';
        card.dataset.talkDate = pastDate;
        card.innerHTML = '<span class="upcoming-ribbon">Upcoming</span>';
        grid?.appendChild(card);
      },
      { pastDate: daysFromNow(-3), gridSelector: SPEAKING_GRID }
    );

    await page.evaluate(() => (window as any).__evaluateUpcomingTalks());

    const ribbon = page.locator(`${SPEAKING_GRID} .homepage-card[data-talk-date]`).last().locator('.upcoming-ribbon');
    await expect(ribbon).toBeHidden();
  });

  test('shows ribbon for a talk dated today (boundary)', async ({ page }) => {
    await page.evaluate(
      ({ todayDate, gridSelector }) => {
        const grid = document.querySelector(gridSelector);
        const card = document.createElement('a');
        card.className = 'homepage-card';
        card.dataset.talkDate = todayDate;
        card.innerHTML = '<span class="upcoming-ribbon" hidden>Upcoming</span>';
        grid?.appendChild(card);
      },
      { todayDate: daysFromNow(0), gridSelector: SPEAKING_GRID }
    );

    await page.evaluate(() => (window as any).__evaluateUpcomingTalks());

    const ribbon = page.locator(`${SPEAKING_GRID} .homepage-card[data-talk-date]`).last().locator('.upcoming-ribbon');
    await expect(ribbon).toBeVisible();
  });
});
