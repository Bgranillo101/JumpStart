import { test, expect } from '@playwright/test';
import { seedAuth } from './fixtures/auth';
import { mockDashboardAPIs } from './fixtures/api-mocks';

test.describe('Onboarding Tour', () => {
  test('tour overlay appears on first visit', async ({ page }) => {
    await seedAuth(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await expect(page.locator('.tour-overlay')).toBeVisible({ timeout: 3000 });
  });

  test('first step has title "Navigation"', async ({ page }) => {
    await seedAuth(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await expect(page.locator('.tour-tooltip-title')).toHaveText('Navigation', { timeout: 3000 });
  });

  test('Next button advances to step 2', async ({ page }) => {
    await seedAuth(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await page.waitForSelector('.tour-btn-next', { timeout: 3000 });
    await page.evaluate(() => (document.querySelector('.tour-btn-next') as HTMLElement)?.click());
    await expect(page.locator('.tour-tooltip-title')).toHaveText('Team Overview');
  });

  test('Skip dismisses tour and sets localStorage flag', async ({ page }) => {
    await seedAuth(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await page.waitForSelector('.tour-btn-skip', { timeout: 3000 });
    await page.evaluate(() => (document.querySelector('.tour-btn-skip') as HTMLElement)?.click());
    await expect(page.locator('.tour-overlay')).not.toBeVisible();
    const flag = await page.evaluate(() => localStorage.getItem('jumpstart_tour_completed'));
    expect(flag).toBe('true');
  });

  test('tour does not appear when localStorage flag is set', async ({ page }) => {
    await seedAuth(page);
    await page.addInitScript(() => {
      localStorage.setItem('jumpstart_tour_completed', 'true');
    });
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await expect(page.locator('.dashboard-shell')).toBeVisible();
    await page.waitForTimeout(1200);
    await expect(page.locator('.tour-overlay')).not.toBeVisible();
  });

  test('last step shows "Done" and dismisses on click', async ({ page }) => {
    await seedAuth(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await page.waitForSelector('.tour-btn-next', { timeout: 3000 });
    // Advance through all 4 steps using evaluate to avoid viewport issues
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => (document.querySelector('.tour-btn-next') as HTMLElement)?.click());
      await page.waitForTimeout(200);
    }
    await expect(page.locator('.tour-btn-next')).toHaveText('Done');
    await page.evaluate(() => (document.querySelector('.tour-btn-next') as HTMLElement)?.click());
    await expect(page.locator('.tour-overlay')).not.toBeVisible();
    const flag = await page.evaluate(() => localStorage.getItem('jumpstart_tour_completed'));
    expect(flag).toBe('true');
  });
});
