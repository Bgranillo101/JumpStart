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
  education?: string;
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
  teamReadinessScore?: number; // 0-100
  roleAssignments: RoleAssignment[];
  roleGaps: RoleGap[];
}

export interface SkillCategoryScore {
  category: string;
  averageProficiency: number;
  skillCount: number;
  insight?: string;
}

export interface TeamSkillHeatmap {
  startupId: number;
  memberCount: number;
  categories: SkillCategoryScore[];
  aiGenerated?: boolean;
}

export interface SkillData {
  subject: string;
  value: number;
  fullMark?: number;
  insight?: string;
}

export interface TechStackRecommendation {
  id: number;
  name: string;
  category: string; // LANGUAGE, FRAMEWORK, DATABASE, TOOL, INFRASTRUCTURE
  reasoning: string;
  priority: number; // 1=must-have, 2=recommended, 3=nice-to-have
}

export interface MemberJoinedEvent {
  userId: number;
  name: string;
  username: string;
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
