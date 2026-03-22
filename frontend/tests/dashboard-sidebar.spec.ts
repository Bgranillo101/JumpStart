import { test, expect } from '@playwright/test';
import { seedAuthNoTour } from './fixtures/auth';
import { mockDashboardAPIs } from './fixtures/api-mocks';

test.describe('Dashboard Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
  });

  test('all 5 nav links visible', async ({ page }) => {
    const links = page.locator('.sidebar-link');
    await expect(links).toHaveCount(5);
    await expect(page.locator('.sidebar-link', { hasText: 'Overview' })).toBeVisible();
    await expect(page.locator('.sidebar-link', { hasText: 'Team' })).toBeVisible();
    await expect(page.locator('.sidebar-link', { hasText: 'Analysis' })).toBeVisible();
    await expect(page.locator('.sidebar-link', { hasText: 'Tech Stack' })).toBeVisible();
    await expect(page.locator('.sidebar-link', { hasText: 'Settings' })).toBeVisible();
  });

  test('clicking tabs applies active class', async ({ page }) => {
    await page.locator('.sidebar-link', { hasText: 'Team' }).click();
    await expect(page.locator('.sidebar-link', { hasText: 'Team' })).toHaveClass(/active/);
    await expect(page.locator('.sidebar-link', { hasText: 'Overview' })).not.toHaveClass(/active/);
  });

  test('shows user avatar and username in footer', async ({ page }) => {
    await expect(page.locator('.sidebar-user-name')).toHaveText('testuser');
  });

  test('logo links to home page', async ({ page }) => {
    const logo = page.locator('.sidebar-logo');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('href', /\//);
  });

  test('navbar is hidden on dashboard route', async ({ page }) => {
    await expect(page.locator('.navbar')).not.toBeVisible();
  });
});
