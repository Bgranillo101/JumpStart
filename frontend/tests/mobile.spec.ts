import { test, expect } from '@playwright/test';
import { seedAuthNoTour } from './fixtures/auth';
import { mockDashboardAPIs } from './fixtures/api-mocks';

test.use({ viewport: { width: 375, height: 667 } });

test.describe('Mobile Responsiveness', () => {
  test('landing page hero is visible on mobile', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Building' })).toBeVisible();
  });

  test('dashboard sidebar is hidden by default on mobile', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).not.toHaveClass(/open/);
  });

  test('hamburger toggle is visible on mobile', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await expect(page.locator('.sidebar-toggle')).toBeVisible();
  });

  test('clicking hamburger opens sidebar', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await page.locator('.sidebar-toggle').click();
    await expect(page.locator('.sidebar.open')).toBeVisible();
  });

  test('clicking overlay closes sidebar', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await page.locator('.sidebar-toggle').click();
    await expect(page.locator('.sidebar.open')).toBeVisible();
    await page.locator('.sidebar-overlay.open').click();
    await expect(page.locator('.sidebar')).not.toHaveClass(/open/);
  });

  test('selecting a tab closes sidebar on mobile', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await page.locator('.sidebar-toggle').click();
    await expect(page.locator('.sidebar.open')).toBeVisible();
    await page.locator('.sidebar-link', { hasText: 'Team' }).click();
    await expect(page.locator('.sidebar')).not.toHaveClass(/open/);
  });
});
