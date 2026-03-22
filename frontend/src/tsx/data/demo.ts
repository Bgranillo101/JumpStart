import type { User, Startup, AnalysisResult, TechStackRecommendation, TeamSkillHeatmap } from '../types';

const demoMembers: User[] = [
  {
    userId: 1,
    username: 'alex_chen',
    email: 'alex@neuralnest.ai',
    name: 'Alex Chen',
    headline: 'Full-Stack Engineer',
    preferredRole: 'CTO',
    experienceYears: 5,
    skills: [
      { id: 1, name: 'React', category: 'TECHNICAL', proficiencyLevel: 9 },
      { id: 2, name: 'Node.js', category: 'TECHNICAL', proficiencyLevel: 8 },
      { id: 3, name: 'Python', category: 'TECHNICAL', proficiencyLevel: 8 },
      { id: 4, name: 'AWS', category: 'TECHNICAL', proficiencyLevel: 7 },
      { id: 5, name: 'System Design', category: 'DOMAIN', proficiencyLevel: 8 },
      { id: 6, name: 'Agile', category: 'OPERATIONS', proficiencyLevel: 7 },
    ],
  },
  {
    userId: 2,
    username: 'maria_santos',
    email: 'maria@neuralnest.ai',
    name: 'Maria Santos',
    headline: 'Product Designer',
    preferredRole: 'Head of Design',
    experienceYears: 4,
    skills: [
      { id: 7, name: 'Figma', category: 'DESIGN', proficiencyLevel: 9 },
      { id: 8, name: 'User Research', category: 'DESIGN', proficiencyLevel: 8 },
      { id: 9, name: 'Prototyping', category: 'DESIGN', proficiencyLevel: 8 },
      { id: 10, name: 'Brand Strategy', category: 'MARKETING', proficiencyLevel: 6 },
      { id: 11, name: 'CSS', category: 'TECHNICAL', proficiencyLevel: 6 },
      { id: 12, name: 'Design Systems', category: 'DESIGN', proficiencyLevel: 7 },
    ],
  },
  {
    userId: 3,
    username: 'james_wright',
    email: 'james@neuralnest.ai',
    name: 'James Wright',
    headline: 'Growth Marketer',
    preferredRole: 'CMO',
    experienceYears: 6,
    skills: [
      { id: 13, name: 'SEO/SEM', category: 'MARKETING', proficiencyLevel: 9 },
      { id: 14, name: 'Content Strategy', category: 'MARKETING', proficiencyLevel: 8 },
      { id: 15, name: 'Analytics', category: 'MARKETING', proficiencyLevel: 7 },
      { id: 16, name: 'Social Media', category: 'MARKETING', proficiencyLevel: 8 },
      { id: 17, name: 'Copywriting', category: 'MARKETING', proficiencyLevel: 7 },
      { id: 18, name: 'CRM', category: 'SALES', proficiencyLevel: 6 },
    ],
  },
  {
    userId: 4,
    username: 'priya_patel',
    email: 'priya@neuralnest.ai',
    name: 'Priya Patel',
    headline: 'Data Scientist',
    preferredRole: 'ML Lead',
    experienceYears: 3,
    skills: [
      { id: 19, name: 'Machine Learning', category: 'TECHNICAL', proficiencyLevel: 9 },
      { id: 20, name: 'Python', category: 'TECHNICAL', proficiencyLevel: 9 },
      { id: 21, name: 'Data Analysis', category: 'DOMAIN', proficiencyLevel: 8 },
      { id: 22, name: 'TensorFlow', category: 'TECHNICAL', proficiencyLevel: 7 },
      { id: 23, name: 'Statistics', category: 'DOMAIN', proficiencyLevel: 8 },
      { id: 24, name: 'NLP', category: 'DOMAIN', proficiencyLevel: 7 },
    ],
  },
  {
    userId: 5,
    username: 'omar_hassan',
    email: 'omar@neuralnest.ai',
    name: 'Omar Hassan',
    headline: 'Business Operations',
    preferredRole: 'COO',
    experienceYears: 7,
    skills: [
      { id: 25, name: 'Project Management', category: 'OPERATIONS', proficiencyLevel: 9 },
      { id: 26, name: 'Financial Planning', category: 'OPERATIONS', proficiencyLevel: 8 },
      { id: 27, name: 'Sales', category: 'SALES', proficiencyLevel: 8 },
      { id: 28, name: 'Negotiation', category: 'SALES', proficiencyLevel: 7 },
      { id: 29, name: 'Supply Chain', category: 'OPERATIONS', proficiencyLevel: 7 },
      { id: 30, name: 'Market Research', category: 'DOMAIN', proficiencyLevel: 6 },
    ],
  },
];

export const DEMO_USER: User = demoMembers[0];

export const DEMO_STARTUP: Startup = {
  id: 1,
  name: 'NeuralNest AI',
  productDescription: 'An AI-powered platform that helps small businesses automate customer support using natural language processing and intelligent routing.',
  businessModel: 'B2B SaaS — subscription tiers based on ticket volume and AI features.',
  keyChallenges: 'Scaling inference costs, building trust with SMBs, and competing with established help-desk platforms.',
  inviteCode: 'DEMO-2026',
  owner: demoMembers[0],
  members: demoMembers,
};

export const DEMO_MEMBERS: User[] = demoMembers;

export const DEMO_HEATMAP: TeamSkillHeatmap = {
  startupId: 1,
  memberCount: 5,
  aiGenerated: true,
  categories: [
    { category: 'TECHNICAL', averageProficiency: 8.2, skillCount: 8, insight: 'Strong full-stack and ML capabilities — well-positioned for an AI product.' },
    { category: 'DESIGN', averageProficiency: 8.0, skillCount: 4, insight: 'Solid design foundation; consider adding motion/interaction design depth.' },
    { category: 'MARKETING', averageProficiency: 7.6, skillCount: 5, insight: 'Good growth skills; paid acquisition experience would round out the team.' },
    { category: 'SALES', averageProficiency: 6.5, skillCount: 3, insight: 'B2B sales pipeline experience is light — prioritize an early sales hire.' },
    { category: 'OPERATIONS', averageProficiency: 7.8, skillCount: 4, insight: 'Strong ops leadership; DevOps and compliance skills needed as you scale.' },
    { category: 'DOMAIN', averageProficiency: 7.4, skillCount: 4, insight: 'Deep AI/ML domain knowledge; add customer-support industry expertise.' },
  ],
};

export const DEMO_ANALYSIS: AnalysisResult = {
  id: 1,
  createdAt: new Date().toISOString(),
  teamReadinessScore: 78,
  skillHeatmap: JSON.stringify({}),
  roleAssignments: [
    {
      id: 1,
      user: demoMembers[0],
      assignedRole: 'Chief Technology Officer',
      confidence: 0.94,
      reasoning: 'Deep full-stack expertise across React, Node.js, Python, and AWS. Strong system design skills and agile experience make Alex the clear technical leader.',
      responsibilities: JSON.stringify(['Architecture decisions', 'Engineering hiring', 'Technical roadmap', 'Code review standards']),
    },
    {
      id: 2,
      user: demoMembers[1],
      assignedRole: 'Head of Design',
      confidence: 0.91,
      reasoning: 'Exceptional design proficiency with Figma, user research, and prototyping. Brand strategy skills add cross-functional value beyond pure design.',
      responsibilities: JSON.stringify(['Design system', 'User research program', 'Brand identity', 'UI/UX for all products']),
    },
    {
      id: 3,
      user: demoMembers[2],
      assignedRole: 'Chief Marketing Officer',
      confidence: 0.89,
      reasoning: 'Strongest marketing skill set on the team with deep SEO/SEM and content strategy experience. Analytics ability enables data-driven growth.',
      responsibilities: JSON.stringify(['Go-to-market strategy', 'Content pipeline', 'Paid acquisition', 'Brand awareness']),
    },
    {
      id: 4,
      user: demoMembers[3],
      assignedRole: 'Machine Learning Lead',
      confidence: 0.93,
      reasoning: 'Top-tier ML and data science skills with TensorFlow and NLP specialization — critical for the core AI product. Python expertise aligns with the tech stack.',
      responsibilities: JSON.stringify(['ML model development', 'NLP pipeline', 'Data infrastructure', 'Model performance monitoring']),
    },
    {
      id: 5,
      user: demoMembers[4],
      assignedRole: 'Chief Operating Officer',
      confidence: 0.88,
      reasoning: 'Strongest operations and sales background. Financial planning and project management experience provides the operational backbone the startup needs.',
      responsibilities: JSON.stringify(['Business operations', 'Financial planning', 'Sales process', 'Vendor partnerships']),
    },
  ],
  roleGaps: [
    {
      id: 1,
      roleName: 'DevOps Engineer',
      importance: 'CRITICAL',
      whyNeeded: 'No team member has dedicated infrastructure and CI/CD expertise. As the AI product scales, deployment automation and monitoring become critical.',
      skillsToLookFor: JSON.stringify(['Docker', 'Kubernetes', 'CI/CD', 'Monitoring', 'Terraform']),
    },
    {
      id: 2,
      roleName: 'Sales Development Rep',
      importance: 'RECOMMENDED',
      whyNeeded: 'The team has basic sales skills but lacks dedicated B2B outbound sales experience needed to build the initial customer pipeline.',
      skillsToLookFor: JSON.stringify(['B2B Sales', 'Cold Outreach', 'Pipeline Management', 'Salesforce']),
    },
    {
      id: 3,
      roleName: 'Customer Success Manager',
      importance: 'NICE_TO_HAVE',
      whyNeeded: 'As customers onboard, a dedicated CS role would reduce churn and gather product feedback — especially important for an AI support tool.',
      skillsToLookFor: JSON.stringify(['Customer Onboarding', 'Support', 'Retention Strategy', 'Product Feedback']),
    },
  ],
};

export const DEMO_TECH_STACK: TechStackRecommendation[] = [
  { id: 1, name: 'Python', category: 'LANGUAGE', reasoning: 'Core language for the ML/NLP pipeline. Priya and Alex both have strong Python skills, enabling rapid iteration on the AI product.', priority: 1 },
  { id: 2, name: 'TypeScript', category: 'LANGUAGE', reasoning: 'Type-safe frontend and API development. Alex\'s React expertise pairs naturally with TypeScript for a robust web application.', priority: 1 },
  { id: 3, name: 'React', category: 'FRAMEWORK', reasoning: 'Alex has expert-level React skills. Combined with Maria\'s design system work, this enables a polished, component-driven UI.', priority: 1 },
  { id: 4, name: 'FastAPI', category: 'FRAMEWORK', reasoning: 'High-performance Python API framework ideal for serving ML models. Async support handles concurrent inference requests efficiently.', priority: 1 },
  { id: 5, name: 'PostgreSQL', category: 'DATABASE', reasoning: 'Reliable relational database for customer and ticket data. Strong ecosystem for analytics queries that James and Omar need.', priority: 1 },
  { id: 6, name: 'Redis', category: 'DATABASE', reasoning: 'Caching layer for ML model predictions and session management. Reduces inference costs — a key challenge for the business.', priority: 2 },
  { id: 7, name: 'Docker', category: 'TOOL', reasoning: 'Containerization is essential for consistent ML model deployment across environments. Addresses the DevOps gap identified in the team.', priority: 1 },
  { id: 8, name: 'GitHub Actions', category: 'TOOL', reasoning: 'CI/CD automation accessible to the whole team. Lower learning curve than Jenkins while covering build, test, and deploy needs.', priority: 2 },
  { id: 9, name: 'AWS', category: 'INFRASTRUCTURE', reasoning: 'Alex already has strong AWS skills. SageMaker for ML, ECS for containers, and CloudWatch for monitoring provide a complete platform.', priority: 1 },
  { id: 10, name: 'Terraform', category: 'INFRASTRUCTURE', reasoning: 'Infrastructure-as-code for reproducible deployments. Critical as the team scales past the initial prototype stage.', priority: 2 },
];
