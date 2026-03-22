import { test, expect } from '@playwright/test';
import { seedAuthNoTour } from './fixtures/auth';
import { mockDashboardAPIs } from './fixtures/api-mocks';

test.describe('Dashboard Tech Stack Tab', () => {
  test('shows empty state with Generate button', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page, { techStack: [] });
    await page.goto('./dashboard');
    await page.locator('.sidebar-link', { hasText: 'Tech Stack' }).click();
    await expect(page.getByText('No tech stack recommendations yet')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Generate Tech Stack' })).toBeVisible();
  });

  test('shows tech stack grouped by category', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await page.locator('.sidebar-link', { hasText: 'Tech Stack' }).click();
    await expect(page.locator('text=FRAMEWORK').first()).toBeVisible();
    await expect(page.locator('text=LANGUAGE').first()).toBeVisible();
    await expect(page.locator('text=DATABASE').first()).toBeVisible();
  });

  test('shows tech card names and reasoning', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await page.locator('.sidebar-link', { hasText: 'Tech Stack' }).click();
    await expect(page.locator('.tech-card-name', { hasText: 'React' })).toBeVisible();
    await expect(page.locator('.tech-card-reasoning').first()).toBeVisible();
  });

  test('shows priority badges', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await page.locator('.sidebar-link', { hasText: 'Tech Stack' }).click();
    await expect(page.getByText('Must-Have').first()).toBeVisible();
  });

  test('Regenerate button visible when results exist', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await page.locator('.sidebar-link', { hasText: 'Tech Stack' }).click();
    await expect(page.getByRole('button', { name: 'Regenerate' })).toBeVisible();
  });
});
