import { test, expect } from '@playwright/test';
import { seedAuthNoTour } from './fixtures/auth';
import { mockDashboardAPIs } from './fixtures/api-mocks';

test.describe('Toast Notifications', () => {
  test('toast is hidden by default', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await expect(page.locator('.dashboard-shell')).toBeVisible();
    const toast = page.locator('.toast');
    await expect(toast).toBeAttached();
    await expect(toast).not.toHaveClass(/visible/);
  });

  test('toast element has dismiss button', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await expect(page.locator('.toast-close')).toBeAttached();
    await expect(page.locator('.toast-close')).toHaveAttribute('aria-label', 'Dismiss');
  });
});
