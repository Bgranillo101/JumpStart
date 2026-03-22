# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

JumpStart is an AI-powered startup team-matching platform. Users register a startup, add team members with skills, invite collaborators via invite links, and trigger a Claude API analysis that assigns roles and identifies skill gaps across the team.

## Commands

### Frontend (`/frontend`)
```bash
npm run dev        # Start Vite dev server (HMR)
npm run build      # TypeScript check + production build
npm run lint       # ESLint
npm run preview    # Preview production build locally
npm run deploy     # Build + deploy to GitHub Pages
```

### Backend (`/backend`)
```bash
mvn spring-boot:run    # Start the Spring Boot server (port 8080)
mvn clean install      # Full build
```

### Backend environment variables required
```
DB_USERNAME=<postgres username>
DB_PASSWORD=<postgres password>
JWT_SECRET=<base64-encoded secret>
CLAUDE_API_KEY=<anthropic api key>
FRONTEND_URL=<frontend origin, defaults to http://localhost:5173>
```
Database: PostgreSQL at `localhost:5432/JumpStart_database`

---

## Backend Integrity Rules

**This backend has been carefully built and debugged. Follow these rules strictly:**

### Never break these things
- JWT authentication flow: `AuthController` → `JWTService` → `JWTFilter` → `SecurityConfig`
- `jwt.secret` must be a fixed Base64-encoded string injected via `@Value`. Do NOT make it randomly generated on startup — this invalidates all tokens on restart.
- `@JsonIgnore` annotations on bidirectional JPA relationships are intentional and required. Removing them causes infinite JSON serialization loops.
- The `username` field on `User` is required for Spring Security's `UserDetailsService`. Do not remove it.

### Database URL
- Local dev uses `jdbc:postgresql://localhost:5432/JumpStart_database` (set via `DB_USERNAME`/`DB_PASSWORD`)
- Production uses `DATABASE_URL` env var (Heroku/Railway format). Note: if `DATABASE_URL` is a `postgres://` URL it must be converted to `jdbc:postgresql://` format — Spring Boot cannot use `postgres://` directly.
- The `application.properties` fallback is: `${DATABASE_URL:jdbc:postgresql://localhost:5432/JumpStart_database}`

### Entity relationships
- `Startup` → `User` (owner, ManyToOne), `User` (members, ManyToMany), `AnalysisResult` (OneToMany)
- `User` → `Startup` (ownedStartups, memberStartups — both `@JsonIgnore`), `Skill` (OneToMany), `RoleAssignment` (OneToMany, `@JsonIgnore`)
- `AnalysisResult` → `Startup` (`@JsonIgnore`), `RoleAssignment` (OneToMany), `RoleGap` (OneToMany)
- `RoleAssignment` → `AnalysisResult` (`@JsonIgnore`), `User` (`@JsonIgnore`)
- `RoleGap` → `AnalysisResult` (`@JsonIgnore`)
- `Skill` → `User` (`@JsonIgnore`)

### Security
- All endpoints except `/api/auth/register` and `/api/auth/login` require a valid JWT in the `Authorization: Bearer <token>` header.
- Ownership checks (only startup owner can invite, manage members) use `SecurityUtil.getCurrentUserId()` pulled from the JWT — never trust a userId from the request body for auth decisions.

---

## Architecture

### Backend — Spring Boot 3.2.3, Java 23
Layered: Controller → Service → Repository → Entity

**Auth flow:** Register/login via `AuthController`, passwords hashed with BCrypt, JWT issued by `JWTService`, validated per-request by `JWTFilter`.

**Key endpoints:**
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — returns JWT token
- `POST /api/startups` — create startup (owner set from JWT automatically)
- `GET /api/startups/{id}` — get startup
- `GET /api/startups` — list all startups
- `POST /api/startups/{id}/invite` — generate invite link (owner only)
- `POST /api/startups/join/{code}` — join startup via invite code
- `POST /api/startups/{startupId}/members` — add member (owner only)
- `GET /api/startups/{startupId}/members` — list members
- `DELETE /api/startups/{startupId}/members/{userId}` — remove member (owner only)
- `GET /api/users/{userId}` — get user profile with skills
- `POST /api/users/{userId}/skills` — add skills to user
- `POST /api/startups/{startupId}/analyze` — trigger Claude AI team analysis
- `GET /api/startups/{startupId}/analyze/results` — get latest analysis result
- `GET /api/startups/{startupId}/skill-heatmap` — team skill heatmap
- `GET /api/startups/{startupId}/members/{memberId}/skill-heatmap` — individual heatmap

### Frontend — React 19 + TypeScript + Vite
- Deployed to GitHub Pages
- JWT stored in `localStorage` via `AuthContext`
- API calls go to `localhost:8080` in dev, configured origin in prod

---

## What Has Been Debugged and Fixed

- JWT secret was randomly generated on startup (invalidated tokens on restart) — fixed to use fixed injected secret
- Infinite JSON recursion from bidirectional JPA relationships — fixed with `@JsonIgnore`
- `Content-Type` errors — all POST endpoints require `application/json` body
- Startup `createStartup` now auto-assigns owner from JWT, not request body
- `ResourceNotFoundException` takes `(String resource, Long id)` — not a single string message
- `application.properties` DB URL uses JDBC format with local fallback

## What Still Needs Work

- Claude API key must be set for analysis endpoints to function
- Analysis response parsing is fragile — Claude response JSON must match expected schema exactly
- No tests exist in either frontend or backend
