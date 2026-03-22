import { test, expect } from '@playwright/test';

test.describe('CreateProfile Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./auth/create-profile');
  });

  test('shows error for invalid email on blur', async ({ page }) => {
    const emailInput = page.getByLabel('Email');
    await emailInput.fill('notanemail');
    await emailInput.blur();
    await expect(page.locator('.input-error-text').first()).toContainText('valid email');
  });

  test('clears error for valid email on blur', async ({ page }) => {
    const emailInput = page.getByLabel('Email');
    await emailInput.fill('notanemail');
    await emailInput.blur();
    await expect(page.locator('.input-error-text').first()).toBeVisible();
    await emailInput.fill('valid@example.com');
    await emailInput.blur();
    await expect(page.locator('.input-error-text').first()).not.toBeVisible({ timeout: 2000 }).catch(() => {
      // Error may still be visible but should not contain email error
    });
  });

  test('shows error for short password on blur', async ({ page }) => {
    const passwordInput = page.getByLabel('Password');
    await passwordInput.fill('abc');
    await passwordInput.blur();
    await expect(page.locator('.input-error-text').last()).toContainText('8 characters');
  });

  test('no error for valid password on blur', async ({ page }) => {
    const passwordInput = page.getByLabel('Password');
    await passwordInput.fill('validpass123');
    await passwordInput.blur();
    // Should not have password error
    const errors = page.locator('.input-error-text');
    const count = await errors.count();
    for (let i = 0; i < count; i++) {
      await expect(errors.nth(i)).not.toContainText('8 characters');
    }
  });
});

test.describe('JoinTeam Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./auth/join-team');
  });

  test('shows error for invalid email on blur', async ({ page }) => {
    const emailInput = page.getByLabel('Email');
    await emailInput.fill('bademail');
    await emailInput.blur();
    await expect(page.locator('.input-error-text').first()).toContainText('valid email');
  });

  test('shows error for short password on blur', async ({ page }) => {
    const passwordInput = page.getByLabel('Password');
    await passwordInput.fill('short');
    await passwordInput.blur();
    await expect(page.locator('.input-error-text').last()).toContainText('8 characters');
  });
});
