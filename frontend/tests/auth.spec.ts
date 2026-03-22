import { test, expect } from '@playwright/test';

test.describe('Sign In Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./auth/sign-in');
  });

  test('displays sign-in form with all fields', async ({ page }) => {
    await expect(page.locator('.auth-title')).toHaveText('Welcome back');
    await expect(page.locator('.auth-subtitle')).toHaveText('Sign in to your JumpStart account');
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('has link to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: 'Register' });
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test('username and password fields accept input', async ({ page }) => {
    await page.getByLabel('Username').fill('testuser');
    await page.getByLabel('Password').fill('testpass123');
    await expect(page.getByLabel('Username')).toHaveValue('testuser');
    await expect(page.getByLabel('Password')).toHaveValue('testpass123');
  });
});

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./auth/register');
  });

  test('displays registration choices', async ({ page }) => {
    await expect(page.locator('.register-heading')).toHaveText('How do you want to get started?');
    await expect(page.locator('.register-choice-card')).toHaveCount(2);
    await expect(page.getByText('Create a Company')).toBeVisible();
    await expect(page.getByText('Join a Team')).toBeVisible();
  });

  test('displays step indicator', async ({ page }) => {
    await expect(page.getByText('Choose Path')).toBeVisible();
    await expect(page.getByText('Set Up')).toBeVisible();
  });

  test('"Create a Company" navigates to create-profile', async ({ page }) => {
    await page.getByText('Create a Company').click();
    await expect(page).toHaveURL(/\/auth\/create-profile/);
  });

  test('"Join a Team" navigates to join-team', async ({ page }) => {
    await page.getByText('Join a Team').click();
    await expect(page).toHaveURL(/\/auth\/join-team/);
  });
});
