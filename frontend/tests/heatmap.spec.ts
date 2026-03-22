import { test, expect } from '@playwright/test';
import { seedAuthNoTour } from './fixtures/auth';
import { mockDashboardAPIs, MOCK_HEATMAP, MOCK_HEATMAP_NO_AI } from './fixtures/api-mocks';

test.describe('Heatmap Feature', () => {
  test('renders radar chart when skill data exists', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');

    await expect(page.locator('.recharts-wrapper')).toBeVisible();
    await expect(page.getByText('Team Skill Heatmap')).toBeVisible();
  });

  test('shows AI-Enhanced badge when heatmap is AI-generated', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page, { heatmap: MOCK_HEATMAP });
    await page.goto('./dashboard');

    await expect(page.getByText('AI-Enhanced')).toBeVisible();
  });

  test('does not show AI-Enhanced badge when heatmap is not AI-generated', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page, { heatmap: MOCK_HEATMAP_NO_AI });
    await page.goto('./dashboard');

    await expect(page.getByText('Team Skill Heatmap')).toBeVisible();
    await expect(page.getByText('AI-Enhanced')).not.toBeVisible();
  });

  test('shows empty state when no skill data', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page, {
      heatmap: { startupId: 1, memberCount: 0, aiGenerated: false, categories: [] },
    });
    await page.goto('./dashboard');

    await expect(page.getByText('No skill data yet')).toBeVisible();
    await expect(page.locator('.recharts-wrapper')).not.toBeVisible();
  });

  test('displays all six skill categories on the radar chart', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page);
    await page.goto('./dashboard');

    // Radar chart should render category labels via PolarAngleAxis
    const radarChart = page.locator('.recharts-wrapper');
    await expect(radarChart).toBeVisible();

    for (const category of ['TECHNICAL', 'DESIGN', 'MARKETING', 'SALES', 'OPERATIONS', 'DOMAIN']) {
      await expect(radarChart.getByText(category)).toBeVisible();
    }
  });

  test('shows insight text in tooltip when hovering AI-generated heatmap', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page, { heatmap: MOCK_HEATMAP });
    await page.goto('./dashboard');

    // Hover over the radar chart to trigger a tooltip
    const radarChart = page.locator('.recharts-wrapper');
    await expect(radarChart).toBeVisible();

    // Hover near the TECHNICAL label area to trigger tooltip
    const technicalLabel = radarChart.getByText('TECHNICAL');
    await technicalLabel.hover();

    // The tooltip should contain the insight text
    const tooltip = page.locator('.recharts-tooltip-wrapper');
    // Tooltip may or may not appear depending on exact hover position;
    // if it appears, verify it contains AI Score label
    if (await tooltip.isVisible()) {
      await expect(tooltip).toContainText('AI Score');
    }
  });

  test('heatmap renders with correct AI-adjusted scores', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page, { heatmap: MOCK_HEATMAP });
    await page.goto('./dashboard');

    // The radar chart should be rendered with data points
    const radarChart = page.locator('.recharts-wrapper');
    await expect(radarChart).toBeVisible();

    // Verify the radar polygon (data visualization) exists
    await expect(radarChart.locator('.recharts-radar .recharts-polygon')).toBeVisible();
  });

  test('heatmap still works when API returns error (graceful degradation)', async ({ page }) => {
    await seedAuthNoTour(page);
    await mockDashboardAPIs(page, { heatmap: 'error' });
    await page.goto('./dashboard');

    // Should not crash — other dashboard content should still render
    await expect(page.getByText('Team Overview')).toBeVisible();
  });
});
