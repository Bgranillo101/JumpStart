import { test, expect } from '@playwright/test';

test.describe('404 Not Found Page', () => {
  test('displays 404 text for unknown route', async ({ page }) => {
    await page.goto('./some/unknown/path');
    await expect(page.locator('text=404')).toBeVisible();
  });

  test('has a link back to home', async ({ page }) => {
    await page.goto('./some/unknown/path');
    const homeLink = page.getByRole('link', { name: 'Back to Home' });
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page).toHaveURL(/\/JumpStart\/$/);
  });
});
