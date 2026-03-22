import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { seedAuthNoTour } from './fixtures/auth';
import { mockDashboardAPIs } from './fixtures/api-mocks';

test.describe('Accessibility', () => {
  test('landing page has no critical a11y violations', async ({ page }) => {
    await page.goto('./');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const critical = results.violations.filter(v => v.impact === 'critical');
    expect(critical).toHaveLength(0);
  });

  test('sign-in page has no critical a11y violations', async ({ page }) => {
    await page.goto('./auth/sign-in');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const critical = results.violations.filter(v => v.impact === 'critical');
    expect(critical).toHaveLength(0);
  });

  test('sign-in form labels are associated with inputs', async ({ page }) => {
    await page.goto('./auth/sign-in');
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('dashboard sidebar toggle has aria-label', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');
    await expect(page.locator('.sidebar-toggle')).toHaveAttribute('aria-label', 'Toggle menu');
  });

  test('keyboard Tab navigates through sign-in form', async ({ page, browserName }) => {
    await page.goto('./auth/sign-in');
    // Focus the first input
    await page.getByLabel('Username').focus();
    await expect(page.getByLabel('Username')).toBeFocused();
    // Tab to password
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password')).toBeFocused();
    // WebKit/Safari doesn't Tab-focus buttons by default, so only check on Chromium/Firefox
    if (browserName !== 'webkit') {
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeFocused();
    }
  });
});
