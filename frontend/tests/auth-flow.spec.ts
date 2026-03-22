import { test, expect } from '@playwright/test';
import { seedAuth } from './fixtures/auth';
import { mockDashboardAPIs } from './fixtures/api-mocks';

test.describe('Auth Guard', () => {
  test('unauthenticated user is redirected from /dashboard', async ({ page }) => {
    await page.goto('./dashboard');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('user with currentUser but no startupId is redirected', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('currentUser', JSON.stringify({ userId: 1, username: 'test', email: 'a@b.com', skills: [] }));
      localStorage.setItem('jwt', 'fake');
      // No startupId set
    });
    await page.goto('./dashboard');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('authenticated user can access /dashboard', async ({ page }) => {
    await seedAuth(page);
    await mockDashboardAPIs(page);
    await page.addInitScript(() => {
      localStorage.setItem('jumpstart_tour_completed', 'true');
    });
    await page.goto('./dashboard');
    await expect(page.locator('.dashboard-shell')).toBeVisible();
  });
});
