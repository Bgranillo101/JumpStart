import { test, expect } from '@playwright/test';
import { seedAuthNoTour } from './fixtures/auth';
import { mockDashboardAPIs } from './fixtures/api-mocks';

test.describe('Dashboard Analysis Tab', () => {
  test('shows empty state with Run Analysis button when no analysis', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page, { analysis: null });
    await page.goto('./dashboard');
    await page.locator('.sidebar-link', { hasText: 'Analysis' }).click();
    await expect(page.getByText('No analysis results yet')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Run Analysis' })).toBeVisible();
  });

  test('shows role assignments with confidence and reasoning', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await page.locator('.sidebar-link', { hasText: 'Analysis' }).click();
    await expect(page.getByText('Lead Developer', { exact: true })).toBeVisible();
    await expect(page.getByText('85% confidence')).toBeVisible();
    await expect(page.getByText('Strong React and TypeScript')).toBeVisible();
  });

  test('shows role gaps with importance badges', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await page.locator('.sidebar-link', { hasText: 'Analysis' }).click();
    await expect(page.getByText('DevOps Engineer')).toBeVisible();
    await expect(page.getByText('CRITICAL')).toBeVisible();
    await expect(page.getByText('RECOMMENDED')).toBeVisible();
  });

  test('Download Report button is visible when analysis exists', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await page.locator('.sidebar-link', { hasText: 'Analysis' }).click();
    await expect(page.getByRole('button', { name: /Download Report/i })).toBeVisible();
  });

  test('Run Analysis button shows loading state', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page, { analysis: null });
    // Override analyze POST with delay
    await page.route('**/api/startups/1/analyze', async (route) => {
      if (route.request().method() !== 'POST') return route.fallback();
      await new Promise(r => setTimeout(r, 2000));
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page.goto('./dashboard');
    await page.locator('.sidebar-link', { hasText: 'Analysis' }).click();
    await page.getByRole('button', { name: 'Run Analysis' }).click();
    await expect(page.getByText('Analyzing')).toBeVisible();
  });
});
