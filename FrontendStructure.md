# FrontendStructure.md

A reference document describing the current state of the JumpStart frontend — its architecture, components, data flow, and gaps — to be used alongside `BackendStructure.md` when planning backend integration.

---

## Tech Stack

- **Framework:** React 19 + TypeScript 5.9
- **Build tool:** Vite 8 (base path: `/JumpStart/`)
- **Routing:** React Router DOM 7
- **AI SDK:** `@anthropic-ai/sdk` 0.80 (installed, not yet used)
- **Styling:** Custom CSS with CSS variables (dark mode + glassmorphism)
- **Font:** Inter (Google Fonts)
- **Deployed:** GitHub Pages at `https://vondraCS.github.io/JumpStart/`

**Entry point:** `index.html` → `<div id="landing">` → `src/tsx/index.tsx`

---

## Routing

Defined in `src/tsx/App.tsx`. The Navbar hides on `/dashboard`.

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `Landing` | Landing page |
| `/auth/sign-in` | `SignIn` | Login form |
| `/auth/register` | `Register` | Choose Create or Join path |
| `/auth/create-profile` | `CreateProfile` | Profile + skills form |
| `/auth/join-team` | `JoinTeam` | Search companies to join |
| `/dashboard` | `DashboardLayout` | Main app shell |

---

## Context Providers

Both providers wrap the entire app in `index.tsx`.

### AuthContext (`src/tsx/context/AuthContext.tsx`)

```typescript
interface AuthContextValue {
  currentUser: User | null
  login: (user: User) => void
  logout: () => void
}
```

- **Hook:** `useAuth()` — throws if called outside `AuthProvider`
- **Current state:** In-memory only — no localStorage, no JWT storage, no real auth
- **Integration need:** `login()` must store the JWT from `POST /api/auth/login` and persist the user object

---

### WizardContext (`src/tsx/context/WizardContext.tsx`)

Tracks the multi-step registration wizard state.

```typescript
interface WizardState {
  path: 'create' | 'join' | null   // set by Register page
  profileName: string
  profileRole: string
  profileSkills: string[]
  resumeFile: File | null
  teamCode: string
}
```

- **Hook:** `useWizard()`
- **Methods:** `setPath(path)`, `setProfileField(field, value)`, `reset()`
- **Integration need:** On wizard completion, this state maps to the backend register + startup creation calls

---

## Type Definitions (`src/tsx/types/index.ts`)

Current frontend types — note these do **not** yet match the backend's field names:

```typescript
interface User {
  id?: string          // backend: userId (Long)
  name: string         // backend: name
  email?: string       // backend: email
  role?: string        // backend: preferredRole
  skills: string[]     // backend: Skill[] with name/category/proficiency
  resumeFile?: File    // no backend equivalent yet
}

interface Company {
  id?: string          // backend: id (Long)
  name: string
  memberCount?: number
  description?: string // backend: productDescription
  teamCode?: string    // no backend equivalent yet
}

interface TeamMember {
  id: string           // backend: userId (Long)
  name: string
  role: string         // backend: preferredRole
  skills: string[]     // backend: Skill[].name
  avatarUrl?: string   // no backend equivalent
}

interface TechStackItem {
  name: string
  category: string
  reason: string
}

interface SkillData {
  subject: string      // skill category label
  value: number        // proficiency score
}
```

**Integration note:** Types will need to be updated or mapped to align with backend response shapes.

---

## Mock API Layer (`src/tsx/api/index.ts`)

All functions currently return mock data with simulated delays. This is the **primary integration target** — each function needs to be replaced with a real `fetch` call to the Spring Boot backend.

| Function | Mock behavior | Backend endpoint |
|----------|--------------|-----------------|
| `login(email, password)` | Returns `{success: true}` | `POST /api/auth/login` |
| `register(data)` | Returns `{success: true}` | `POST /api/auth/register` → `POST /api/startups` |
| `getTechStack()` | Returns 6 hardcoded items | No backend endpoint yet — Claude analysis result |
| `getMembers()` | Returns 4 hardcoded members | `GET /api/startups/{id}/members` |
| `getMemberSkills(memberId)` | Returns radar data | `GET /api/startups/{id}/members/{memberId}/skill-heatmap` |
| `searchCompanies(query)` | Filters 3 mock companies | No backend endpoint yet |
| `getTeam()` | Returns company + members | `GET /api/startups/{id}` |

**Suggested approach:** Keep the function signatures in `api/index.ts` and replace the bodies with real `fetch` calls. Add a base URL constant and an auth header helper:

```typescript
const BASE_URL = 'http://localhost:8080/api'  // or Railway URL in production

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('jwt')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}
```

---

## Pages

### Landing (`src/tsx/Landing.tsx`)
- Hero with CTA buttons → `/auth/register`
- "How It Works" (3 cards)
- About section
- No API calls — static content only

---

### SignIn (`src/tsx/pages/Auth/SignIn.tsx`)
**Collects:** `email`, `password`
**On submit:** Calls `login(email, password)` → redirects to `/dashboard`
**Integration:** Replace mock with `POST /api/auth/login`, store returned JWT, call `useAuth().login()` with user object

---

### Register (`src/tsx/pages/Auth/Register.tsx`)
**Step 1 of wizard.** User picks a path:
- "Create a Company" → sets `WizardContext.path = 'create'` → navigates to `/auth/create-profile`
- "Join a Team" → sets `WizardContext.path = 'join'` → navigates to `/auth/join-team`

No API calls on this page.

---

### CreateProfile (`src/tsx/pages/Auth/CreateProfile.tsx`)
**Step 2 — Create path.** Collects:
- Full Name (→ `WizardContext.profileName`)
- Role/Title (→ `WizardContext.profileRole`)
- Skills as tags (→ `WizardContext.profileSkills[]`)
- Resume file upload (PDF/DOC/DOCX, max 5MB) (→ `WizardContext.resumeFile`)

**On submit:** Calls `register(state)` → redirects to `/dashboard`

**Integration sequence:**
1. `POST /api/auth/register` with `{username, email, password}` → get `userId`
2. `POST /api/auth/login` → get JWT, store in localStorage
3. `POST /api/startups` with `{name, productDescription, ..., owner: {userId}}` → get `startupId`
4. Add skills to user (endpoint not yet built on backend)
5. Redirect to `/dashboard`

---

### JoinTeam (`src/tsx/pages/Auth/JoinTeam.tsx`)
**Step 2 — Join path.** Features:
- Search input (company name or team code)
- Results list with company cards
- "Request to Join" button → navigates to `/dashboard`

**Integration:**
1. `POST /api/auth/register` → register user
2. `POST /api/auth/login` → get JWT
3. Search startups (no backend endpoint yet — needs `GET /api/startups?search=query` or similar)
4. `POST /api/startups/{startupId}/members` with `{userId}` to join

---

### DashboardLayout (`src/tsx/pages/Dashboard/DashboardLayout.tsx`)
**Layout:** Fixed sidebar (240px) + scrollable main panel

**Sidebar nav links:** Overview, Team, Tech Stack, Settings
- These update `activeSection` state but the main content doesn't yet respond

**Data fetched on mount:**
- `getTechStack()` → stored in `techStack` state
- `getTeam()` → stored in `{ company, members }` state

**Displays:**
- Team Overview card (company name, member count, description)
- Recommended Tech Stack (badges + reason per item)
- Radar charts section — **placeholder only**, currently shows "npm install recharts"
- Team Members list (Avatar, name, role Badge, skill Badges)

**Integration needs:**
- Fetch real startup from `GET /api/startups/{startupId}`
- Fetch real members from `GET /api/startups/{startupId}/members`
- Trigger analysis via `POST /api/startups/{startupId}/analyze`
- Fetch analysis results from `GET /api/startups/{startupId}/analyze/results`
- Implement `recharts` radar chart using `GET /api/startups/{startupId}/skill-heatmap`
- Wire sidebar navigation to different content sections

---

## Component Library (`src/tsx/components/`)

| Component | File | Key Props |
|-----------|------|-----------|
| `Button` | `buttons.tsx` | `variant`: primary\|secondary\|outline\|ghost, `size`: sm\|md\|lg, `fullWidth` |
| `Input` | `Input.tsx` | `label`, `error`, all HTML input attrs |
| `Card` | `cards.tsx` | `glass`: boolean (glassmorphism on/off) |
| `Avatar` | `avatar.tsx` | `name` (generates initials), `src`, `size`: sm\|md\|lg |
| `Badge` | `badge.tsx` | `variant`: brand\|tertiary\|neutral |
| `StepIndicator` | `stepindicator.tsx` | `steps`: `{label}[]`, `currentStep` (1-indexed) |
| `Modal` | `modal.tsx` | `isOpen`, `onClose`, `title` |
| `Navbar` | `navbar.tsx` | Auto-detects landing vs dashboard route |

---

## Design System (`src/css/index.css`)

Dark mode with glassmorphism throughout. Key tokens:

```css
/* Colors */
--bg-primary: #1a1a1d
--bg-glass: rgba(255, 255, 255, 0.06)
--bg-glass-border: rgba(228, 225, 221, 0.12)
--text-primary: #e4e1dd
--text-secondary: #9a9690
--accent-primary: #ffdd00       /* brand yellow */
--accent-secondary: #f2ae00     /* orange */
--accent-tertiary: #313e68      /* blue */

/* Spacing: --spacing-xs through --spacing-3xl */
/* Radius: --radius-sm through --radius-full */
/* Shadows: --shadow-sm, --shadow-md, --shadow-glass, --shadow-glow */
/* Transitions: --transition-fast (0.15s), --transition-normal (0.3s) */
```

**Utility classes available globally:**
- `.glass` — glassmorphism card (backdrop-filter blur)
- `.brand-gradient` — yellow-to-orange gradient text

---

## CSS Files Reference

| File | Covers |
|------|--------|
| `src/css/index.css` | Design tokens + global reset + `.glass` + `.brand-gradient` |
| `src/css/components.css` | All component styles (buttons, inputs, tags, badges, avatar, modal, step indicator) |
| `src/css/auth.css` | Auth pages (sign-in, register choice, wizard forms, join results) |
| `src/css/landing.css` | Landing hero, steps, about, footer |
| `src/css/navbar.css` | Sticky navbar + dropdown |
| `src/css/dashboard.css` | Sidebar, main panel, dashboard grid, cards, radar placeholder |

---

## Current State Summary

| Area | Status |
|------|--------|
| Component library | Complete |
| Routing | Complete |
| Design system | Complete |
| Landing page | Complete |
| Auth page layouts | Complete |
| Dashboard layout | Complete (shell only) |
| AuthContext | Skeleton — no persistence |
| WizardContext | Works — collects form data |
| API calls | All mocked |
| JWT storage | Not implemented |
| Real data on dashboard | Not implemented |
| Sidebar navigation | State only — no content switching |
| Skill radar charts | Placeholder (recharts not installed) |
| Error/loading states | Minimal |
| Form validation | HTML `required` only |

---

## Integration Priorities (Suggested Order)

1. **Auth** — Wire `SignIn` and `CreateProfile` to real backend, store JWT in localStorage, update `AuthContext`
2. **Startup creation** — On `CreateProfile` submit, create startup via API, store `startupId`
3. **Dashboard data** — Replace `getTechStack()` and `getTeam()` with real API calls using stored `startupId`
4. **Analysis** — Add "Run Analysis" trigger, call `POST /api/startups/{id}/analyze`, display results
5. **Skill heatmap / radar** — Install `recharts`, fetch heatmap data, render spider graph
6. **Sidebar navigation** — Wire Overview / Team / Tech Stack sections to real data
7. **Skills endpoint** — Backend needs a new endpoint to create/update User skills (currently missing)
8. **Join team flow** — Backend needs a startup search endpoint; wire `JoinTeam` page

---

## File Map

```
frontend/src/
├── tsx/
│   ├── index.tsx                        Entry point
│   ├── App.tsx                          Router
│   ├── Landing.tsx                      Landing page
│   ├── api/index.ts                     Mock API (integration target)
│   ├── types/index.ts                   Shared TypeScript types
│   ├── context/
│   │   ├── AuthContext.tsx              Auth state
│   │   └── WizardContext.tsx            Registration wizard state
│   ├── components/
│   │   ├── navbar.tsx
│   │   ├── buttons.tsx
│   │   ├── Input.tsx
│   │   ├── cards.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── modal.tsx
│   │   └── stepindicator.tsx
│   └── pages/
│       ├── Auth/
│       │   ├── SignIn.tsx
│       │   ├── Register.tsx
│       │   ├── CreateProfile.tsx
│       │   └── JoinTeam.tsx
│       └── Dashboard/
│           └── DashboardLayout.tsx
└── css/
    ├── index.css                        Design tokens + global
    ├── components.css                   Component styles
    ├── auth.css                         Auth page styles
    ├── landing.css                      Landing styles
    ├── navbar.css                       Navbar styles
    └── dashboard.css                    Dashboard styles
```
