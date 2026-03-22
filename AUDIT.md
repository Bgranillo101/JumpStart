# JumpStart — Full-Stack Audit

> Generated 2026-03-21 | React 19 + Spring Boot 3.2.3 + PostgreSQL

---

## Critical / Blocking

- [ ] **Resolve merge conflict** in `frontend/README.md` — contains unresolved git merge markers (`<<<<<<< HEAD`)
- [ ] **Set production API URL** — `frontend/.env.production` still contains `REPLACE_WITH_RENDER_URL` placeholder
- [ ] **Create `.env.example` templates** — neither frontend nor backend provides one; new developers have no reference for required env vars

---

## Backend — Missing Features

- [ ] **User profile update endpoint** — add `PUT /api/users/{userId}` (profile fields like name, headline, role are only settable at registration)
- [ ] **Skill update endpoint** — add `PUT /api/users/{userId}/skills/{skillId}` (currently add-only, no way to edit proficiency or category)
- [ ] **Skill delete endpoint** — add `DELETE /api/users/{userId}/skills/{skillId}` (skills can only be removed by deleting the user)
- [ ] **Set startup owner on creation** — `POST /api/startups` never populates the `owner` field on the Startup entity
- [ ] **Pagination** — `GET /api/startups` (and member lists) return all records with no limit/offset support
- [ ] **Startup invite / join-code system** — no mechanism for users to join a startup via invite link or code
- [ ] **Resume upload endpoint** — frontend has drag-and-drop resume UI but no backend endpoint or file storage to receive it

---

## Backend — Code Quality & Security

- [ ] **Restrict CORS origins** — every controller uses `@CrossOrigin(origins = "*")`; lock down to known frontend domains
- [ ] **Global exception handler** — add `@ControllerAdvice` with structured JSON error responses (currently only `ResourceNotFoundException` exists)
- [ ] **Validation error details** — return field-level error messages on 400 responses (e.g., which field failed `@NotBlank`)
- [ ] **Claude API resilience** — handle rate limits, timeouts, and malformed responses from the Claude API gracefully
- [ ] **Disable SQL logging in prod** — `spring.jpa.show-sql=true` is always on; use Spring profiles to disable in production
- [ ] **JWT secret persistence** — secret is environment-variable-based but document rotation strategy; tokens invalidate on redeploy if secret changes
- [ ] **Application-level logging** — no SLF4J/Logback configuration beyond Hibernate SQL output
- [ ] **Input sanitization** — user-supplied strings (startup names, descriptions) are stored and returned without XSS sanitization
- [ ] **Proper JSON columns** — `skillHeatmap`, `responsibilities`, and `skillsToLookFor` are stored as stringified JSON; use `@JdbcTypeCode(SqlTypes.JSON)` or proper JSON columns
- [ ] **Schema migration tool** — replace `hibernate.ddl-auto=update` with Flyway or Liquibase for safe, versioned migrations

---

## Frontend — Missing Features

- [ ] **Route guards** — unauthenticated users can navigate directly to `/dashboard` with no redirect to sign-in
- [ ] **Token expiration handling** — no detection of expired JWTs; users get silent 401 failures instead of a redirect to login
- [ ] **Resume upload integration** — CreateProfile has file upload UI but `resumeFile` in WizardContext is never sent to the backend
- [ ] **Skill category & proficiency picker** — CreateProfile defaults every skill to `TECHNICAL` category and proficiency `5`; no UI to change these
- [ ] **Team-code join flow** — `teamCode` field exists in WizardContext but is never used; either implement or remove
- [ ] **404 page** — no catch-all route for unknown paths
- [ ] **Dashboard Settings** — section only shows startup ID and a logout button; needs profile editing, team management, etc.

---

## Frontend — Code Quality & UX

- [ ] **Loading states** — replace bare "Loading..." text with spinners or skeleton screens
- [ ] **Toast / notification system** — no success or error feedback after actions (e.g., "Analysis started", "Failed to add member")
- [ ] **Error boundary** — no React error boundary at the app root; unhandled errors crash the entire UI
- [ ] **Form validation** — only uses HTML `required`; add client-side validation for email format, password strength, matching passwords
- [ ] **Responsive / mobile layout** — CSS uses fixed widths and grid layouts that likely break on small screens; audit and fix
- [ ] **Accessibility** — minimal ARIA labels, no focus management, no skip-nav or keyboard navigation support
- [ ] **Remove dead files** — `src/html/dashboard.html`, `src/html/registration.html`, and `pages/Registration/RegistrationFlow.tsx` are unused placeholders
- [ ] **Remove or use `@anthropic-ai/sdk`** — dependency is installed but never imported; remove if frontend Claude calls aren't planned

---

## DevOps & CI/CD

- [ ] **GitHub Actions pipeline** — no CI exists; add a workflow that runs lint, build, and tests on every PR
- [ ] **Docker support** — no Dockerfile or docker-compose; add for consistent local development (app + PostgreSQL)
- [ ] **Dependency vulnerability scanning** — enable Dependabot (npm + Maven) or integrate `npm audit` / OWASP dependency-check into CI
- [ ] **Spring profiles** — configure `application-dev.properties` and `application-prod.properties` for environment-specific settings
- [ ] **Backend code formatter** — no Checkstyle, Spotless, or equivalent; Java code style is not enforced

---

## Testing

- [ ] **Frontend test framework** — set up Vitest (or Jest) with React Testing Library
- [ ] **Frontend unit tests** — cover auth flow, API layer (`api/index.ts`), AuthContext, and WizardContext
- [ ] **Backend unit tests** — JUnit 5 + Mockito for services (UserService, AnalysisService, JWTService, SkillHeatmapService)
- [ ] **Backend integration tests** — test auth endpoints, startup CRUD, team member operations, and the analysis pipeline end-to-end
- [ ] **E2E tests** — add Playwright or Cypress for critical flows: register → create startup → add members → run analysis

---

## Documentation

- [ ] **`backend/.env.example`** — list all required env vars (`DATABASE_URL`, `PGUSER`, `PGPASSWORD`, `JWT_SECRET`, `CLAUDE_API_KEY`, `PORT`)
- [ ] **`frontend/.env.example`** — document `VITE_API_URL` with example value
- [ ] **Consolidate docs** — `Plan.md`, `FrontendStructure.md`, `BackendStructure.md`, and `walkthrough.md` overlap; merge into a single source of truth or clearly scope each
- [ ] **Root README** — replace with unified setup instructions, architecture overview, and contributor guide
