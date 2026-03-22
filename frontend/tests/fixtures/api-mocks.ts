import type { Page } from '@playwright/test';

const API_BASE = '**/api';

export const MOCK_STARTUP = {
  id: 1,
  name: 'TestStartup',
  productDescription: 'An AI-powered testing platform',
  businessModel: 'SaaS',
  keyChallenges: 'Scaling infrastructure',
  inviteCode: 'abc123',
  owner: {
    userId: 1,
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    skills: [],
  },
  members: [
    {
      userId: 1,
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User',
      preferredRole: 'Developer',
      skills: [
        { id: 1, name: 'React', category: 'TECHNICAL', proficiencyLevel: 8 },
        { id: 2, name: 'TypeScript', category: 'TECHNICAL', proficiencyLevel: 7 },
      ],
    },
    {
      userId: 2,
      username: 'jane',
      email: 'jane@example.com',
      name: 'Jane Smith',
      preferredRole: 'Designer',
      skills: [
        { id: 3, name: 'Figma', category: 'DESIGN', proficiencyLevel: 9 },
      ],
    },
  ],
};

export const MOCK_MEMBERS = MOCK_STARTUP.members;

export const MOCK_HEATMAP = {
  startupId: 1,
  memberCount: 2,
  aiGenerated: true,
  categories: [
    { category: 'TECHNICAL', averageProficiency: 8.2, skillCount: 2, insight: 'Strong React and TypeScript skills align well with your SaaS platform.' },
    { category: 'DESIGN', averageProficiency: 8.5, skillCount: 1, insight: 'Solid Figma expertise covers UI needs but consider UX research depth.' },
    { category: 'MARKETING', averageProficiency: 1.0, skillCount: 0, insight: 'Critical gap — no marketing skills for go-to-market strategy.' },
    { category: 'SALES', averageProficiency: 0.5, skillCount: 0, insight: 'No sales capability; essential for SaaS customer acquisition.' },
    { category: 'OPERATIONS', averageProficiency: 1.5, skillCount: 0, insight: 'Lacking ops skills for scaling infrastructure.' },
    { category: 'DOMAIN', averageProficiency: 3.0, skillCount: 0, insight: 'Limited domain expertise in AI/testing space.' },
  ],
};

export const MOCK_HEATMAP_NO_AI = {
  startupId: 1,
  memberCount: 2,
  aiGenerated: false,
  categories: [
    { category: 'TECHNICAL', averageProficiency: 7.5, skillCount: 2 },
    { category: 'DESIGN', averageProficiency: 9.0, skillCount: 1 },
    { category: 'MARKETING', averageProficiency: 0, skillCount: 0 },
    { category: 'SALES', averageProficiency: 0, skillCount: 0 },
    { category: 'OPERATIONS', averageProficiency: 0, skillCount: 0 },
    { category: 'DOMAIN', averageProficiency: 0, skillCount: 0 },
  ],
};

export const MOCK_ANALYSIS = {
  id: 1,
  skillHeatmap: '{"TECHNICAL":7.5,"DESIGN":9,"MARKETING":0,"SALES":0,"OPERATIONS":0,"DOMAIN":0}',
  createdAt: '2026-03-21T10:00:00',
  teamReadinessScore: 72,
  roleAssignments: [
    {
      id: 1,
      user: MOCK_MEMBERS[0],
      assignedRole: 'Lead Developer',
      confidence: 85,
      reasoning: 'Strong React and TypeScript skills make them ideal for the lead developer role.',
      responsibilities: '["Architecture","Code review"]',
    },
    {
      id: 2,
      user: MOCK_MEMBERS[1],
      assignedRole: 'UX Designer',
      confidence: 92,
      reasoning: 'Expert Figma skills and design background.',
      responsibilities: '["UI design","User research"]',
    },
  ],
  roleGaps: [
    {
      id: 1,
      roleName: 'DevOps Engineer',
      importance: 'CRITICAL',
      whyNeeded: 'No team member has infrastructure or deployment experience.',
      skillsToLookFor: '["Docker","AWS","CI/CD"]',
    },
    {
      id: 2,
      roleName: 'Marketing Lead',
      importance: 'RECOMMENDED',
      whyNeeded: 'Need someone to handle go-to-market strategy.',
      skillsToLookFor: '["SEO","Content Marketing"]',
    },
  ],
};

export const MOCK_TECH_STACK = [
  { id: 1, name: 'React', category: 'FRAMEWORK', reasoning: 'Team has strong React expertise.', priority: 1 },
  { id: 2, name: 'TypeScript', category: 'LANGUAGE', reasoning: 'Type safety for large codebase.', priority: 1 },
  { id: 3, name: 'PostgreSQL', category: 'DATABASE', reasoning: 'Reliable relational database for SaaS.', priority: 1 },
  { id: 4, name: 'Docker', category: 'INFRASTRUCTURE', reasoning: 'Containerization for consistent deployments.', priority: 2 },
  { id: 5, name: 'Figma', category: 'TOOL', reasoning: 'Team designer is already proficient.', priority: 3 },
];

interface MockOverrides {
  startup?: object | null | 'error';
  members?: object[] | 'error';
  heatmap?: object | 'error';
  analysis?: object | null | 'error';
  techStack?: object[] | 'error';
}

/**
 * Intercepts all dashboard API calls with mock data.
 * Call before page.goto('/dashboard').
 */
export async function mockDashboardAPIs(page: Page, overrides: MockOverrides = {}) {
  // Mock startup
  await page.route(`${API_BASE}/startups/1`, async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    const data = overrides.startup;
    if (data === 'error') return route.fulfill({ status: 500, body: 'Server error' });
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data ?? MOCK_STARTUP) });
  });

  // Mock members
  await page.route(`${API_BASE}/startups/1/members`, async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    const data = overrides.members;
    if (data === 'error') return route.fulfill({ status: 500, body: 'Server error' });
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data ?? MOCK_MEMBERS) });
  });

  // Mock heatmap
  await page.route(`${API_BASE}/startups/1/skill-heatmap`, async (route) => {
    const data = overrides.heatmap;
    if (data === 'error') return route.fulfill({ status: 500, body: 'Server error' });
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data ?? MOCK_HEATMAP) });
  });

  // Mock analysis results
  await page.route(`${API_BASE}/startups/1/analyze/results`, async (route) => {
    const data = overrides.analysis;
    if (data === 'error') return route.fulfill({ status: 500, body: 'Server error' });
    if (data === null) return route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data ?? MOCK_ANALYSIS) });
  });

  // Mock tech stack
  await page.route(`${API_BASE}/startups/1/tech-stack`, async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    const data = overrides.techStack;
    if (data === 'error') return route.fulfill({ status: 500, body: 'Server error' });
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data ?? MOCK_TECH_STACK) });
  });

  // Abort SSE connections (prevent hanging)
  await page.route(`${API_BASE}/startups/*/events*`, (route) => route.abort());

  // Mock analyze POST (for "Run Analysis" button tests)
  await page.route(`${API_BASE}/startups/1/analyze`, async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ANALYSIS) });
  });

  // Mock tech stack POST
  await page.route(`${API_BASE}/startups/1/tech-stack`, async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_TECH_STACK) });
  });
}
