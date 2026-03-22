# BackendStructure.md

A reference document for frontend developers integrating against the JumpStart Spring Boot API.

---

## Tech Stack

- **Framework:** Spring Boot 3.2.3 / Java 17
- **Database:** PostgreSQL (Render hosted)
- **Auth:** JWT (HmacSHA512) + BCrypt (strength 12)
- **AI:** Claude API (`claude-opus-4-6`) via `ClaudeApiService`
- **Port:** `${PORT:8080}` (configurable via env var)
- **API Base Path:** `/api`
- **Deployment:** Docker on Render (free tier)
- **Frontend:** GitHub Pages at `vondracs.github.io/JumpStart/`

**Required environment variables:**
```
DATABASE_URL=jdbc:postgresql://<host>/<db>
PGUSER=<postgres username>
PGPASSWORD=<postgres password>
CLAUDE_API_KEY=<anthropic api key>
JWT_SECRET=<base64-encoded secret>
PORT=8080
```

---

## Authentication

JWT-based, stateless. All routes except `/api/auth/register` and `/api/auth/login` require a valid token.

**Header format for all authenticated requests:**
```
Authorization: Bearer <token>
```

**Token details:**
- Algorithm: HmacSHA512
- Expiration: 24 hours
- Claims: `userId` (Long), `username` (String subject)
- Secret key from `JWT_SECRET` env var (persists across restarts)

**CORS:** Configured in `SecurityConfig` to allow origins `https://vondracs.github.io` and `http://localhost:5173`. Preflight OPTIONS requests are permitted through the JWT filter.

---

## Auth Endpoints

### `POST /api/auth/register`
Register a new user account.

**Request body:**
```json
{
  "username": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

**Response `201`:**
```json
{
  "id": 1,
  "username": "janedoe",
  "email": "jane@example.com"
}
```

**Errors:**
- `400` — missing fields, invalid email
- `403` — duplicate username/email

---

### `POST /api/auth/login`
Login and receive a JWT token.

**Request body:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response `200`:** Plain JWT string (not JSON)
```
eyJhbGciOiJIUzUxMiJ9...
```

**Errors:**
- `403` — invalid credentials

---

## Startup Endpoints

All require `Authorization: Bearer <token>`.

### `POST /api/startups`
Create a new startup.

**Request body:**
```json
{
  "name": "string (required)",
  "productDescription": "string",
  "businessModel": "string",
  "keyChallenges": "string",
  "owner": { "userId": 1 }
}
```

**Response `201`:** Full Startup object (see [Data Models](#data-models))

---

### `GET /api/startups`
Get all startups.

**Response `200`:** Array of Startup objects

---

### `GET /api/startups/{id}`
Get one startup by ID.

**Response `200`:** Startup object
**Errors:** `404`

---

### `PUT /api/startups/{id}`
Update a startup (all fields optional).

**Request body:**
```json
{
  "name": "string",
  "productDescription": "string",
  "businessModel": "string",
  "keyChallenges": "string"
}
```

**Response `200`:** Updated Startup object
**Errors:** `404`

---

### `DELETE /api/startups/{id}`
Delete a startup and cascade-delete all its analysis results.

**Response `204`**
**Errors:** `404`

---

## Team Member Endpoints

### `POST /api/startups/{startupId}/members`
Add an existing user to a startup's team.

**Request body:**
```json
{ "userId": 1 }
```

**Response `200`** (no body)
**Errors:** `404` — startup or user not found

---

### `GET /api/startups/{startupId}/members`
Get all members of a startup.

**Response `200`:** Array of User objects (full profile including skills)

---

### `DELETE /api/startups/{startupId}/members/{userId}`
Remove a member from a startup.

**Response `204`**
**Errors:** `404`

---

## User Endpoints

### `GET /api/users/{userId}`
Get a user with their skills.

**Response `200`:** User object with skills array

---

### `PATCH /api/users/{userId}`
Update a user's profile fields.

**Request body:**
```json
{
  "name": "string (optional)",
  "preferredRole": "string (optional)"
}
```

**Response `200`:** Updated User object

---

### `GET /api/users/{userId}/startup`
Find the startup a user owns or is a member of.

**Response `200`:** Startup object (if found)
**Response `204`:** No startup found (no body)

---

### `POST /api/users/{userId}/skills`
Add skills to a user. Replaces/adds to existing skills.

**Request body:**
```json
[
  { "name": "React", "category": "TECHNICAL", "proficiencyLevel": 8 },
  { "name": "Figma", "category": "DESIGN", "proficiencyLevel": 6 }
]
```

**Response `200`:** Array of saved Skill objects

---

## Analysis Endpoints

### `POST /api/startups/{startupId}/analyze`
Trigger AI analysis of the startup team. No request body needed.

**What happens:**
1. Backend fetches all team members and their skills
2. Builds a prompt and calls Claude (`claude-opus-4-6`, max 4096 tokens)
3. Parses the response and persists `AnalysisResult`, `RoleAssignment[]`, and `RoleGap[]`
4. Returns the complete result

**Response `200`:**
```json
{
  "id": 1,
  "skillHeatmap": "{\"TECHNICAL\": 8, \"DESIGN\": 5}",
  "createdAt": "2026-03-21T14:00:00",
  "roleAssignments": [
    {
      "id": 1,
      "user": { "userId": 1, "username": "janedoe" },
      "assignedRole": "CTO",
      "confidence": 92,
      "reasoning": "Strong technical background...",
      "responsibilities": "[\"Lead architecture\", \"Hire engineers\"]"
    }
  ],
  "roleGaps": [
    {
      "id": 1,
      "roleName": "Head of Marketing",
      "importance": "CRITICAL",
      "whyNeeded": "No marketing experience on the team",
      "skillsToLookFor": "[\"SEO\", \"Growth marketing\"]"
    }
  ]
}
```

**Notes:**
- `skillHeatmap` is a JSON string — parse it with `JSON.parse()`
- `responsibilities` and `skillsToLookFor` are JSON strings — parse them with `JSON.parse()`
- `importance` values: `CRITICAL` | `RECOMMENDED` | `NICE_TO_HAVE`
- `startup` back-reference is `@JsonIgnore`d (not in response)

**Errors:**
- `404` — startup not found
- `500` — Claude response parse failure

---

### `GET /api/startups/{startupId}/analyze/results`
Get the most recent analysis result for a startup.

**Response `200`:** Same AnalysisResult shape as above, or empty/null if no analysis has been run.

---

## Skill Heatmap Endpoints

### `GET /api/startups/{startupId}/skill-heatmap`
Get aggregated skill scores across the whole team.

**Response `200`:**
```json
{
  "startupId": 1,
  "memberCount": 3,
  "categories": [
    { "category": "TECHNICAL", "averageProficiency": 8.2, "skillCount": 6 },
    { "category": "DESIGN", "averageProficiency": 5.0, "skillCount": 2 }
  ]
}
```

---

### `GET /api/startups/{startupId}/members/{memberId}/skill-heatmap`
Get skill scores for a single team member.

**Response `200`:**
```json
{
  "memberId": 1,
  "memberName": "Jane Smith",
  "categories": [
    { "category": "TECHNICAL", "averageProficiency": 9.0, "skillCount": 4 }
  ]
}
```

---

## Data Models

### User
```json
{
  "userId": 1,
  "username": "janedoe",
  "email": "jane@example.com",
  "name": "Jane Smith",
  "headline": "Full-Stack Engineer | 5 yrs",
  "preferredRole": "CTO",
  "experienceYears": 5,
  "availabilityLevel": "FULL_TIME",
  "education": "CS @ MIT",
  "createdAt": "2026-03-21T14:00:00",
  "skills": [ ...Skill[] ]
}
```

**Note:** `password` is `@JsonIgnore`d — never included in API responses. `ownedStartups`, `memberStartups`, and `roleAssignments` are also `@JsonIgnore`d to prevent circular references.

### Startup
```json
{
  "id": 1,
  "name": "Acme Inc.",
  "productDescription": "...",
  "businessModel": "SaaS",
  "keyChallenges": "Finding PMF",
  "createdAt": "2026-03-21T14:00:00",
  "owner": { ...User },
  "members": [ ...User[] ]
}
```

**Note:** `analysisResults` is `@JsonIgnore`d. `owner` and `members` are EAGER-fetched.

### Skill
```json
{
  "id": 1,
  "name": "React",
  "category": "TECHNICAL",
  "proficiencyLevel": 9
}
```

**Note:** `user` back-reference is `@JsonIgnore`d.

### RoleAssignment
```json
{
  "id": 1,
  "user": { ...User },
  "assignedRole": "CTO",
  "confidence": 92,
  "reasoning": "...",
  "responsibilities": "[\"Lead architecture\", \"Hire engineers\"]"
}
```

**Note:** `analysisResult` back-reference is `@JsonIgnore`d.

### RoleGap
```json
{
  "id": 1,
  "roleName": "Head of Marketing",
  "importance": "CRITICAL",
  "whyNeeded": "...",
  "skillsToLookFor": "[\"SEO\", \"Growth marketing\"]"
}
```

**Note:** `analysisResult` back-reference is `@JsonIgnore`d.

---

## Enums

### SkillCategory
Used on `Skill.category` and in heatmap `categories[].category`:
```
TECHNICAL | DESIGN | MARKETING | SALES | OPERATIONS | DOMAIN
```

### RoleGap Importance
```
CRITICAL | RECOMMENDED | NICE_TO_HAVE
```

### Availability Level (string field on User)
```
FULL_TIME | PART_TIME | ADVISORY
```

---

## Error Handling

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `201` | Resource created |
| `204` | Success, no body (DELETE, or no startup found for user) |
| `400` | Validation error |
| `403` | Duplicate data, invalid credentials, or missing/invalid JWT |
| `404` | Resource not found — message: `"{Resource} not found with id: {id}"` |
| `500` | Claude response parse failure |

---

## Integration Flows

### 1. Registration & Profile Creation
```
POST /api/auth/register         → creates user account
POST /api/auth/login            → returns JWT, store in localStorage
PATCH /api/users/{userId}       → save name, preferredRole
POST /api/startups              → create startup with owner
POST /api/users/{userId}/skills → save user skills
```

### 2. Sign In (existing user)
```
POST /api/auth/login            → returns JWT
GET  /api/users/{userId}        → fetch full user profile
GET  /api/users/{userId}/startup → discover user's startup
```

### 3. Join Existing Startup
```
POST /api/auth/register
POST /api/auth/login
GET  /api/startups              → search/browse startups
POST /api/startups/{id}/members → join a startup
```

### 4. Run Analysis
```
POST /api/startups/{startupId}/analyze   (no body)
→ returns full AnalysisResult with roleAssignments[] and roleGaps[]
```
Parse JSON string fields before using:
```js
const heatmap = JSON.parse(result.skillHeatmap)
const responsibilities = JSON.parse(assignment.responsibilities)
const skillsNeeded = JSON.parse(gap.skillsToLookFor)
```

### 5. Display Heatmap
```
GET /api/startups/{startupId}/skill-heatmap
→ categories[].averageProficiency  (0–10 scale, use for spider/radar chart)
```

---

## Deployment

### Backend (Render — Docker)
- **Repo:** `vondraCS/JumpStart`
- **Root Directory:** `backend`
- **Runtime:** Docker (uses `backend/Dockerfile`)
- **Dockerfile:** Multi-stage build with Maven 3.9 + Eclipse Temurin JDK 17
- **Free tier:** Cold starts (~30-50s after 15min inactivity)

### Frontend (GitHub Pages)
- **Branch:** `gh-pages`
- **Build:** `npx vite build` from `frontend/`
- **SPA routing:** `404.html` redirects to `index.html` with sessionStorage trick
- **API URL:** Set via `VITE_API_URL` env var in `.env.production`

### File Structure
```
backend/
├── Dockerfile
├── system.properties          (java.runtime.version=17)
├── pom.xml
├── mvnw / .mvn/               (Maven wrapper)
└── src/main/java/com/jumpstart/api/
    ├── JumpStartApplication.java
    ├── config/
    │   ├── SecurityConfig.java    (CORS + JWT + auth rules)
    │   └── JWTFilter.java
    ├── controller/
    │   ├── AuthController.java
    │   ├── StartupController.java
    │   ├── TeamMemberController.java
    │   ├── AnalysisController.java
    │   ├── SkillHeatmapController.java
    │   └── IntegrationUserController.java
    ├── service/
    │   ├── UserService.java
    │   ├── StartupService.java
    │   ├── TeamMemberService.java
    │   ├── AnalysisService.java
    │   ├── ClaudeApiService.java
    │   ├── SkillHeatmapService.java
    │   ├── JWTService.java
    │   └── IntegrationSkillService.java
    ├── repository/
    │   ├── UserRepository.java
    │   ├── StartupRepository.java
    │   ├── SkillRepository.java
    │   ├── AnalysisResultRepository.java
    │   ├── RoleAssignmentRepository.java
    │   └── RoleGapRepository.java
    ├── entity/
    │   ├── User.java
    │   ├── Startup.java
    │   ├── Skill.java
    │   ├── AnalysisResult.java
    │   ├── RoleAssignment.java
    │   ├── RoleGap.java
    │   └── UserPrinciple.java
    ├── dto/
    │   ├── UserDto.java
    │   ├── RegisterRequest.java
    │   ├── LoginRequest.java
    │   ├── TeamSkillHeatmapResponse.java
    │   ├── MemberSkillHeatmapResponse.java
    │   └── SkillCategoryScore.java
    ├── exception/
    │   └── ResourceNotFoundException.java
    └── util/
        └── SecurityUtil.java
```
