import { test, expect } from '@playwright/test';
import { seedAuthNoTour } from './fixtures/auth';
import { mockDashboardAPIs, MOCK_STARTUP } from './fixtures/api-mocks';

test.describe('Dashboard Overview Tab', () => {
  test('shows team overview card with startup name and member count', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await expect(page.locator('.team-overview-name')).toHaveText(MOCK_STARTUP.name);
    await expect(page.locator('.team-overview-meta')).toContainText('2 members');
  });

  test('shows product description', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await expect(page.locator('.team-overview-desc')).toContainText('AI-powered');
  });

  test('shows empty state when no members', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page, { members: [] });
    await page.goto('./dashboard');
    await expect(page.locator('.empty-state-title').first()).toContainText('No team members yet');
  });

  test('shows empty heatmap state when no skill data', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page, { heatmap: { startupId: 1, memberCount: 0, categories: [] } });
    await page.goto('./dashboard');
    await expect(page.getByText('No skill data yet')).toBeVisible();
  });

  test('shows ReadinessGauge when analysis has teamReadinessScore', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await expect(page.locator('.readiness-gauge')).toBeVisible();
    await expect(page.locator('.gauge-title')).toHaveText('Team Readiness');
  });

  test('shows "Run Analysis" button when no analysis exists', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page, { analysis: null });
    await page.goto('./dashboard');
    await expect(page.getByRole('button', { name: 'Run Analysis' })).toBeVisible();
  });

  test('shows "Re-run Analysis" when analysis exists', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await expect(page.getByRole('button', { name: 'Re-run Analysis' })).toBeVisible();
  });

  test('shows error message on API failure', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page, { startup: 'error' });
    await page.goto('./dashboard');
    await expect(page.getByText('Failed to load team data')).toBeVisible();
  });

  test('shows member list with names and skill badges', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    const memberRows = page.locator('.member-row');
    await expect(memberRows).toHaveCount(2);
    await expect(page.getByText('Test User').first()).toBeVisible();
    await expect(page.getByText('Jane Smith')).toBeVisible();
    await expect(page.getByText('React').first()).toBeVisible();
  });

  test('shows skill heatmap radar chart when data exists', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await expect(page.locator('.recharts-wrapper')).toBeVisible();
  });
});
