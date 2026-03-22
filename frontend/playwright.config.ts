import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5173/JumpStart/',
    trace: 'on-first-retry',
    expect: { timeout: 5000 },
  },
  webServer: {
    command: 'npx vite --port 5173 --strictPort',
    url: 'http://localhost:5173/JumpStart/',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
      testMatch: [
        'mobile.spec.ts',
        'landing.spec.ts',
        'navigation.spec.ts',
        'notfound.spec.ts',
        'form-validation.spec.ts',
        'auth-flow.spec.ts',
        'auth.spec.ts',
        'performance.spec.ts',
        'accessibility.spec.ts',
        'toast.spec.ts',
        'onboarding-tour.spec.ts',
        'dashboard-overview.spec.ts',
      ],
    },
  ],
});
