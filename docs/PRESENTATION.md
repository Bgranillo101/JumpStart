# JumpStart — Sprint 4 Presentation

## Slide 1: What We Built

**JumpStart** is an AI-powered startup team role assignment platform.

- Founders register their startup and team members with skills
- Claude AI analyzes the full team composition
- Returns role assignments, skill gaps, and a readiness score
- Visualized on an interactive dashboard

---

## Slide 2: Sprint 4 Goals

| Goal | Status |
|------|--------|
| Backend unit tests (JUnit 5 + Mockito) | ✅ Done |
| GitHub Actions CI/CD pipeline | ✅ Done |
| Profile page (view + edit) | ✅ Done |
| Dashboard empty-state polish | ✅ Done |
| Documentation | ✅ Done |

---

## Slide 3: Architecture

```
React + TypeScript (Vite)          Spring Boot 3.2 (Java 17)
  GitHub Pages            →            Render (Cloud)
                          REST
                          JWT Auth
                                   ↓
                             PostgreSQL (Render)
                                   ↓
                             Claude API (Anthropic)
```

**Key design decisions:**
- JWT stateless auth — scales horizontally
- Spring Security filter chain — centralized auth enforcement
- Claude API prompt engineering — structured JSON response contract

---

## Slide 4: New This Sprint — Backend Tests

**11 new JUnit 5 tests using Mockito:**

| Test Class | What It Covers |
|-----------|---------------|
| `StartupServiceTest` | CRUD, invite generation, join-by-code, owner guard |
| `AnalysisServiceTest` | Claude integration, JSON parsing, edge cases |
| `AuthControllerTest` | Register 201, duplicate username, login 200+JWT, bad creds 401 |

Tests use H2 in-memory database — **no external DB required** to run.

```bash
cd backend && mvn test -Dspring.profiles.active=test
```

---

## Slide 5: New This Sprint — CI/CD

**Two GitHub Actions workflows:**

**`ci.yml` (frontend):**
- Triggers on push to `main` when `frontend/` changes
- Runs ESLint + TypeScript build check
- Auto-deploys to GitHub Pages on success

**`backend.yml`:**
- Triggers on push to `main` when `backend/` changes
- Runs all JUnit tests with H2 (no secrets needed in CI)
- Triggers Render deploy hook on success

---

## Slide 6: New This Sprint — Profile Page

Full user profile with view and edit modes:

- **Photo upload** — base64 stored in localStorage per user
- **Bio fields** — name, headline, preferred role, experience, education, availability
- **Skills editor** — add/remove skills with category and proficiency level (1–10)
- **Startup info** — edit product description, business model, key challenges
- Save syncs to backend and refreshes AuthContext

---

## Slide 7: Demo Flow

See `docs/DEMO_SCRIPT.md` for the full step-by-step guide.

High-level:
1. Register → onboarding wizard
2. Dashboard overview → empty states with CTAs
3. Invite teammate (2nd browser tab)
4. Run AI analysis → role assignments + skill heatmap
5. Profile page → edit and save

---

## Slide 8: What's Next

- Resume parsing (extract skills from uploaded PDF)
- Notifications (SSE already scaffolded in backend)
- Mobile layout polish
- Export analysis as PDF report
- Playwright E2E tests for full registration → analysis flow
