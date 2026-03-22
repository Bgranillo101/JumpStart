export interface Skill {
  id?: number;
  name: string;
  category: 'TECHNICAL' | 'DESIGN' | 'MARKETING' | 'SALES' | 'OPERATIONS' | 'DOMAIN';
  proficiencyLevel: number;
}

export interface User {
  userId: number;
  username: string;
  email: string;
  name?: string;
  headline?: string;
  preferredRole?: string;
  experienceYears?: number;
  availabilityLevel?: string;
  skills: Skill[];
}

export interface Startup {
  id: number;
  name: string;
  productDescription?: string;
  businessModel?: string;
  keyChallenges?: string;
  inviteCode?: string;
  owner: User;
  members: User[];
}

export interface RoleAssignment {
  id: number;
  user: User;
  assignedRole: string;
  confidence: number;
  reasoning: string;
  responsibilities: string; // JSON string — parse before use
}

export interface RoleGap {
  id: number;
  roleName: string;
  importance: 'CRITICAL' | 'RECOMMENDED' | 'NICE_TO_HAVE';
  whyNeeded: string;
  skillsToLookFor: string; // JSON string — parse before use
}

export interface AnalysisResult {
  id: number;
  skillHeatmap: string; // JSON string — parse before use
  createdAt: string;
  roleAssignments: RoleAssignment[];
  roleGaps: RoleGap[];
}

export interface SkillCategoryScore {
  category: string;
  averageProficiency: number;
  skillCount: number;
}

export interface TeamSkillHeatmap {
  startupId: number;
  memberCount: number;
  categories: SkillCategoryScore[];
}

export interface SkillData {
  subject: string;
  value: number;
  fullMark?: number;
}

// Legacy types kept for backward compat during migration
export interface TechStackItem {
  name: string;
  category: string;
  reason: string;
}

export type WizardPath = 'create' | 'join';

export interface WizardState {
  path: WizardPath | null;
  // Account credentials
  username: string;
  email: string;
  password: string;
  // Profile
  profileName: string;
  profileRole: string;
  profileSkills: string[];
  resumeFile: File | null;
  // Create path
  companyName: string;
  // Join path
  teamCode: string;
}
