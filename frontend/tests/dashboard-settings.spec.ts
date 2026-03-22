import { test, expect } from '@playwright/test';
import { seedAuthNoTour } from './fixtures/auth';
import { mockDashboardAPIs } from './fixtures/api-mocks';

test.describe('Dashboard Settings Tab', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await page.locator('.sidebar-link', { hasText: 'Settings' }).click();
  });

  test('shows startup ID', async ({ page }) => {
    await expect(page.locator('code', { hasText: '1' })).toBeVisible();
  });

  test('Sign Out button navigates to landing page', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Out', exact: true }).click();
    await expect(page).toHaveURL(/\/JumpStart\//);
  });

  test('Replay Tour button exists', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Replay Tour' })).toBeVisible();
  });
});
