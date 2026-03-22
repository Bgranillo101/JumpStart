import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
  });

  test('displays hero section with title and CTAs', async ({ page }) => {
    await expect(page.locator('.hero-title')).toHaveText('Bringing your ideas from 0 to 1');
    await expect(page.locator('.hero-subtitle')).toContainText('Build your team');
    await expect(page.getByRole('button', { name: 'Start Building' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Learn More' })).toBeVisible();
  });

  test('displays How It Works steps', async ({ page }) => {
    await expect(page.locator('.section-title')).toHaveText('How It Works');
    const steps = page.locator('.step-card');
    await expect(steps).toHaveCount(3);
    await expect(steps.nth(0).locator('.step-title')).toHaveText('Create Your Idea');
    await expect(steps.nth(1).locator('.step-title')).toHaveText('Build Your Team');
    await expect(steps.nth(2).locator('.step-title')).toHaveText('Get Your Stack');
  });

  test('displays About section', async ({ page }) => {
    await expect(page.locator('.about-eyebrow')).toHaveText('About JumpStart');
    const rows = page.locator('.about-row');
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0).locator('.about-row-tag')).toHaveText('The Platform');
    await expect(rows.nth(1).locator('.about-row-tag')).toHaveText('Our Mission');
    await expect(rows.nth(2).locator('.about-row-tag')).toHaveText('The Advantage');
  });

  test('displays footer with links', async ({ page }) => {
    await expect(page.locator('.footer')).toBeVisible();
    await expect(page.locator('.footer-logo')).toContainText('JumpStart');
    await expect(page.locator('.footer-link')).toHaveCount(3);
  });

  test('"Start Building" button navigates to register page', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Building' }).click();
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test('"Learn More" scrolls to about section', async ({ page }) => {
    await page.getByRole('button', { name: 'Learn More' }).click();
    await expect(page.locator('#about')).toBeInViewport();
  });
});
