import type { Startup, User, AnalysisResult, TeamSkillHeatmap, SkillData, Skill } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('jwt');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Decode the JWT payload without a library */
export function decodeJwt(token: string): { userId: number; sub: string } {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(
  username: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) return { success: false, error: 'Invalid username or password.' };
  const token = await res.text();
  localStorage.setItem('jwt', token);
  const { userId } = decodeJwt(token);
  localStorage.setItem('userId', String(userId));
  return { success: true, token };
}

export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
}): Promise<{ id: number; username: string; email: string }> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Registration failed');
  }
  return res.json();
}

// ─── Startups ────────────────────────────────────────────────────────────────

export async function createStartup(data: {
  name: string;
  productDescription?: string;
  businessModel?: string;
  keyChallenges?: string;
  owner: { userId: number };
}): Promise<Startup> {
  const res = await fetch(`${BASE_URL}/startups`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create startup');
  return res.json();
}

export async function getTeam(startupId: number): Promise<Startup> {
  const res = await fetch(`${BASE_URL}/startups/${startupId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Startup not found');
  return res.json();
}

export async function getAllStartups(): Promise<Startup[]> {
  const res = await fetch(`${BASE_URL}/startups`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch startups');
  return res.json();
}

export async function searchCompanies(query: string): Promise<Startup[]> {
  const all = await getAllStartups();
  const q = query.toLowerCase();
  return all.filter(s => s.name.toLowerCase().includes(q));
}

// ─── Members ─────────────────────────────────────────────────────────────────

export async function getMembers(startupId: number): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/startups/${startupId}/members`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch members');
  return res.json();
}

export async function addMember(startupId: number, userId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/startups/${startupId}/members`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to add member');
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUser(userId: number): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function getUserStartup(userId: number): Promise<Startup | null> {
  const res = await fetch(`${BASE_URL}/users/${userId}/startup`, {
    headers: authHeaders(),
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error('Failed to fetch user startup');
  return res.json();
}

export async function updateUserProfile(
  userId: number,
  data: { name?: string; preferredRole?: string }
): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user profile');
  return res.json();
}

// ─── Skills ──────────────────────────────────────────────────────────────────

export async function addSkills(userId: number, skills: Skill[]): Promise<Skill[]> {
  const res = await fetch(`${BASE_URL}/users/${userId}/skills`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(skills),
  });
  if (!res.ok) throw new Error('Failed to save skills');
  return res.json();
}

// ─── Analysis ────────────────────────────────────────────────────────────────

export async function runAnalysis(startupId: number): Promise<AnalysisResult> {
  const res = await fetch(`${BASE_URL}/startups/${startupId}/analyze`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Analysis failed');
  return res.json();
}

export async function getAnalysisResults(startupId: number): Promise<AnalysisResult | null> {
  const res = await fetch(`${BASE_URL}/startups/${startupId}/analyze/results`, {
    headers: authHeaders(),
  });
  if (!res.ok) return null;
  return res.json();
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

export async function getTeamHeatmap(startupId: number): Promise<TeamSkillHeatmap> {
  const res = await fetch(`${BASE_URL}/startups/${startupId}/skill-heatmap`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch heatmap');
  return res.json();
}

export async function getMemberSkills(startupId: number, memberId: number): Promise<SkillData[]> {
  const res = await fetch(
    `${BASE_URL}/startups/${startupId}/members/${memberId}/skill-heatmap`,
    { headers: authHeaders() }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.categories ?? []).map((c: { category: string; averageProficiency: number }) => ({
    subject: c.category,
    value: Math.round(c.averageProficiency * 10), // scale 0–10 → 0–100
    fullMark: 100,
  }));
}

// Keep old register signature for any call sites that haven't been updated yet
export async function register(_data: object): Promise<{ success: boolean }> {
  return { success: true };
}
