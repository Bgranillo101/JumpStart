# JumpStart Roadmap — From Partial to Hackathon Winner

## Current State (85% core functionality complete)

**What works today:**
- Full auth flow (register, login, invite-to-join)
- Create/join startup with team members and skills
- Claude AI analysis: role assignments, skill gaps, confidence scores
- Skill heatmap radar chart (Recharts)
- Dashboard with overview, team, analysis, settings sections
- Invite link generation and sharing
- GitHub Pages frontend deployment, Docker-ready backend
- 17 Playwright E2E tests passing

**What's missing for a hackathon win:**
The core features work, but hackathon judges evaluate **polish, demo flow, technical depth, and wow factor**. The gaps below are organized into 4 sprints.

---

## Sprint 1: Polish & Reliability (Days 1–2)
*Goal: Make the app feel production-grade. No broken states, no ugly edges.*

### 1.1 Error Boundary + 404 Page
- [ ] Create `ErrorBoundary.tsx` — catches React crashes, shows a recovery UI
- [ ] Create `NotFound.tsx` — friendly 404 page for unknown routes
- [ ] Add catch-all `<Route path="*">` in `App.tsx`

### 1.2 Mobile Responsiveness
- [ ] Add media queries to `dashboard.css` — collapse sidebar into a hamburger menu below 768px
- [ ] Add media queries to `auth.css` — stack form cards vertically on mobile
- [ ] Add media queries to `landing.css` — fix hero text sizing, stack CTA buttons
- [ ] Test on iPhone/Android viewport sizes in Chrome DevTools

### 1.3 Loading & Empty States
- [ ] Add skeleton loaders to dashboard cards while data loads
- [ ] Add empty state illustrations/messages for: no team members, no analysis yet, no skills
- [ ] Add a global loading spinner for route transitions

### 1.4 Form Validation
- [ ] Add password strength requirements (min 8 chars) to CreateProfile and JoinTeam
- [ ] Add email format validation beyond HTML5
- [ ] Show inline validation errors (not just on submit)
- [ ] Prevent duplicate form submissions (disable button after click — partially done)

### 1.5 Backend Hardening
- [ ] Add `@ControllerAdvice` global exception handler — return proper JSON error responses instead of Spring's default HTML
- [ ] Add input validation annotations (`@NotBlank`, `@Email`, `@Size`) to DTOs
- [ ] Add rate limiting to `/api/auth/login` to prevent brute force

---

## Sprint 2: Wow Factor Features (Days 3–5)
*Goal: Add features that make judges say "that's impressive."*

### 2.1 Real-Time Team Dashboard
- [ ] Add WebSocket or SSE endpoint so the dashboard live-updates when a new member joins
- [ ] Show a toast notification: "Jane just joined your team!"
- [ ] Auto-refresh the members list and skill heatmap without page reload

### 2.2 AI-Powered Tech Stack Recommendations
- [ ] Add a new Claude API prompt that recommends a tech stack based on team skills and startup description
- [ ] Create `TechStackResult` entity (framework, language, tool, reasoning)
- [ ] Display recommendations as cards on a new "Tech Stack" dashboard tab
- [ ] Show why each technology was chosen based on the team's strengths

### 2.3 Team Fit Score
- [ ] After analysis, show an overall "Team Readiness Score" (0–100) based on skill coverage, gap severity, and role confidence
- [ ] Display as a large animated number or gauge on the Overview section
- [ ] Color-code: red (<50), yellow (50–75), green (75+)

### 2.4 PDF Report Export
- [ ] Add a "Download Report" button on the Analysis tab
- [ ] Generate a PDF with: team overview, role assignments, skill gaps, heatmap chart, tech stack recommendations
- [ ] Use a library like `jspdf` + `html2canvas` or server-side generation

### 2.5 Onboarding Tour
- [ ] Add a first-time-user guided tour highlighting key features (3–4 steps)
- [ ] Use a lightweight library like `driver.js` or build custom tooltip overlays
- [ ] Trigger after first login, dismissible and skippable

---

## Sprint 3: Demo-Ready UX (Days 6–7)
*Goal: Make the 3-minute demo flawless.*

### 3.1 Seed Data & Demo Mode
- [ ] Create a backend seed script that populates a demo startup with 4–5 members, diverse skills, and a pre-run analysis
- [ ] Add a "Try Demo" button on the landing page that logs into the demo account
- [ ] Ensure the demo account always has fresh, impressive data

### 3.2 Animations & Transitions
- [ ] Add page transition animations (fade-in on route change)
- [ ] Add staggered card entrance animations on the dashboard
- [ ] Add a subtle confetti/celebration animation when analysis completes
- [ ] Polish the OrgChartBackground hero animation (already uses d3-force)

### 3.3 Dark/Light Theme Toggle
- [ ] CSS variables are already defined — add a toggle switch in Settings and Navbar
- [ ] Persist preference in localStorage
- [ ] Ensure all components look good in both themes

### 3.4 Accessibility Pass
- [ ] Add `aria-label` to all buttons, links, and interactive elements
- [ ] Ensure keyboard navigation works through all flows (tab order, Enter to submit)
- [ ] Add `role="alert"` to error messages so screen readers announce them
- [ ] Run Lighthouse accessibility audit and fix issues above 90 score

### 3.5 Performance
- [ ] Add `React.lazy()` code splitting for Dashboard and Auth pages
- [ ] Add `loading="lazy"` to any images
- [ ] Ensure Lighthouse performance score is above 90

---

## Sprint 4: Ship It (Days 8–9)
*Goal: Deploy, test, document, present.*

### 4.1 CI/CD Pipeline
- [ ] Create `.github/workflows/ci.yml`:
  - Run `npm run lint` and `npm run build` on PR
  - Run Playwright tests
  - Auto-deploy frontend to GitHub Pages on merge to main
- [ ] Create `.github/workflows/backend.yml`:
  - Run `mvn test` on PR
  - Build Docker image
  - Deploy to Render/Railway on merge to main

### 4.2 Backend Deployment
- [ ] Deploy Spring Boot to Render or Railway (Dockerfile already exists)
- [ ] Provision a managed PostgreSQL instance (Render/Neon/Supabase)
- [ ] Set environment variables (DATABASE_URL, CLAUDE_API_KEY, JWT_SECRET)
- [ ] Update frontend `.env.production` with the deployed backend URL
- [ ] Verify CORS config includes the production frontend URL

### 4.3 Testing
- [ ] Add Playwright tests for: invite flow, dashboard sections, analysis trigger
- [ ] Add 5–10 JUnit tests for critical backend services: `AnalysisService`, `StartupService`, `AuthController`
- [ ] Run full E2E flow: register → create startup → invite member → run analysis → view results

### 4.4 Documentation
- [ ] Update `README.md` with: project description, screenshots, setup instructions, tech stack, team members
- [ ] Add architecture diagram (frontend ↔ backend ↔ Claude API ↔ PostgreSQL)
- [ ] Prepare a 3-minute demo script with talking points

### 4.5 Presentation Prep
- [ ] Record a backup demo video in case of live-demo failure
- [ ] Prepare 3–4 slides: Problem → Solution → Demo → Tech Stack
- [ ] Practice the demo flow: Landing → Register → Add Skills → Invite → Analysis → Results
- [ ] Have the seed data ready so the demo starts with impressive content

---

## Priority Matrix

| Impact | Effort | Item |
|--------|--------|------|
| HIGH | LOW | Error boundary + 404 page |
| HIGH | LOW | Seed data / demo mode |
| HIGH | LOW | Team Readiness Score gauge |
| HIGH | MEDIUM | Mobile responsiveness |
| HIGH | MEDIUM | Tech stack recommendations |
| HIGH | MEDIUM | Backend deployment |
| HIGH | MEDIUM | PDF report export |
| MEDIUM | LOW | Loading/empty states |
| MEDIUM | LOW | Dark/light theme toggle |
| MEDIUM | LOW | Onboarding tour |
| MEDIUM | MEDIUM | CI/CD pipeline |
| MEDIUM | MEDIUM | Animations & transitions |
| MEDIUM | HIGH | Real-time WebSocket updates |
| LOW | LOW | Accessibility pass |
| LOW | MEDIUM | Backend unit tests |

---

## Tech Stack Reference

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8 |
| Charts | Recharts, D3-Force |
| Backend | Spring Boot 3.2.3, Java 17 |
| Database | PostgreSQL 17 |
| AI | Claude API (Opus 4.6) |
| Auth | JWT (jjwt 0.12.5) |
| Testing | Playwright (E2E), JUnit (backend) |
| Deploy | GitHub Pages (FE), Docker + Render (BE) |
