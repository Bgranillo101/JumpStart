import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navbar shows Home, Sign In, and Get Started links', async ({ page }) => {
    await page.goto('./');
    const navbar = page.locator('.navbar');
    await expect(navbar).toBeVisible();
    await expect(navbar.getByText('Home')).toBeVisible();
    await expect(navbar.getByText('Sign In')).toBeVisible();
    await expect(navbar.getByRole('button', { name: 'Get Started' })).toBeVisible();
  });

  test('Home link navigates to landing page', async ({ page }) => {
    await page.goto('./auth/sign-in');
    await page.locator('.navbar').getByText('Home').click();
    await expect(page).toHaveURL(/\/JumpStart\/$/);
  });

  test('Sign In link navigates to sign-in page', async ({ page }) => {
    await page.goto('./');
    await page.locator('.navbar').getByText('Sign In').click();
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('Get Started button navigates to register page', async ({ page }) => {
    await page.goto('./');
    await page.locator('.navbar').getByRole('button', { name: 'Get Started' }).click();
    await expect(page).toHaveURL(/\/auth\/register/);
  });
});
