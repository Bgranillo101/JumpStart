import type { Page } from '@playwright/test';


export const MOCK_USER = {
  userId: 1,
  username: 'testuser',
  email: 'test@example.com',
  name: 'Test User',
  headline: 'Software Developer',
  preferredRole: 'Developer',
  experienceYears: 3,
  availabilityLevel: 'FULL_TIME',
  skills: [
    { id: 1, name: 'React', category: 'TECHNICAL', proficiencyLevel: 8 },
    { id: 2, name: 'TypeScript', category: 'TECHNICAL', proficiencyLevel: 7 },
  ],
};

export const MOCK_STARTUP_ID = '1';

/**
 * Seeds localStorage with auth data before page navigation.
 * Must be called BEFORE page.goto().
 */
export async function seedAuth(page: Page, options?: { userId?: number; startupId?: string }) {
  const userId = options?.userId ?? 1;
  const startupId = options?.startupId ?? MOCK_STARTUP_ID;
  const user = { ...MOCK_USER, userId };

  const payload = btoa(JSON.stringify({ userId, sub: user.username, iat: 9999999999, exp: 9999999999 }));
  const jwt = `eyJhbGciOiJIUzI1NiJ9.${payload}.fakesignature`;

  await page.addInitScript(({ jwt, user, startupId }) => {
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userId', String(user.userId));
    localStorage.setItem('startupId', startupId);
  }, { jwt, user, startupId });
}

/**
 * Seeds auth with the tour already completed (no onboarding overlay).
 */
export async function seedAuthNoTour(page: Page) {
  await seedAuth(page);
  await page.addInitScript(() => {
    localStorage.setItem('jumpstart_tour_completed', 'true');
  });
}
