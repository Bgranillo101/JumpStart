import { test, expect } from '@playwright/test';
import { seedAuthNoTour } from './fixtures/auth';
import { mockDashboardAPIs } from './fixtures/api-mocks';

test.describe('Dashboard Team Tab', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await page.locator('.sidebar-link', { hasText: 'Team' }).click();
  });

  test('navigates to Team tab', async ({ page }) => {
    await expect(page.locator('.dash-section-title').first()).toHaveText('Invite Members');
  });

  test('shows invite section for owner', async ({ page }) => {
    await expect(page.getByText('Generate Invite Link')).toBeVisible();
  });

  test('shows team member details with email', async ({ page }) => {
    await expect(page.getByText('test@example.com')).toBeVisible();
    await expect(page.getByText('jane@example.com')).toBeVisible();
  });

  test('shows member skills', async ({ page }) => {
    await expect(page.getByText('React').first()).toBeVisible();
    await expect(page.getByText('Figma')).toBeVisible();
  });

  test('empty state when no members', async ({ page: _ }, testInfo) => {
    const { browser } = testInfo.project.use;
    // Need a fresh page with empty members
    const context = await (await import('@playwright/test')).chromium?.launch()
      ? undefined : undefined;
    // Simpler: just create a new test
  });
});

test('Team tab: empty state when no members', async ({ page }) => {
  await seedAuthNoTour(page);
  await mockDashboardAPIs(page, { members: [] });
  await page.goto('./dashboard');
  await page.locator('.sidebar-link', { hasText: 'Team' }).click();
  await expect(page.getByText('No team members yet').first()).toBeVisible();
});

test('Team tab: hides invite section for non-owner', async ({ page }) => {
  await seedAuthNoTour(page);
  // Mock startup with different owner
  const nonOwnerStartup = {
    id: 1, name: 'TestStartup', owner: { userId: 999, username: 'otheruser', email: 'other@test.com', skills: [] },
    members: [{ userId: 1, username: 'testuser', email: 'test@example.com', name: 'Test User', skills: [] }],
  };
  await mockDashboardAPIs(page, { startup: nonOwnerStartup });
  await page.goto('./dashboard');
  await page.locator('.sidebar-link', { hasText: 'Team' }).click();
  await expect(page.getByText('Generate Invite Link')).not.toBeVisible();
});
