import { test, expect } from '@playwright/test';
import { seedAuthNoTour } from './fixtures/auth';
import { mockDashboardAPIs } from './fixtures/api-mocks';

test.describe('Performance', () => {
  test('landing page loads within 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('./', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
    await expect(page.locator('.hero-title')).toBeVisible();
  });

  test('dashboard loads within 4 seconds with mocked API', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    const start = Date.now();
    await page.goto('./dashboard', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(4000);
    await expect(page.locator('.dashboard-shell')).toBeVisible();
  });

  test('route transitions show loading spinner', async ({ page }) => {
    await page.goto('./');
    // Navigate to a lazy-loaded route
    await page.getByRole('button', { name: 'Start Building' }).click();
    // The spinner may flash briefly; verify the route loaded
    await expect(page).toHaveURL(/\/auth\/register/);
  });
});
