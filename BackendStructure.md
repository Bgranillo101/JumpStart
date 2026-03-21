# BackendStructure.md

A reference document for frontend developers integrating against the JumpStart Spring Boot API.

---

## Tech Stack

- **Framework:** Spring Boot 3.2.3 / Java 17
- **Database:** PostgreSQL (`localhost:5432/JumpStart_database`)
- **Auth:** JWT (HmacSHA256) + BCrypt
- **AI:** Claude API (`claude-opus-4-6`) via `ClaudeApiService`
- **Port:** `8080`
- **API Base Path:** `/api`

**Required environment variables:**
```
DB_USERNAME=<postgres username>
DB_PASSWORD=<postgres password>
CLAUDE_API_KEY=<anthropic api key>
```

---

## Authentication

JWT-based, stateless. All routes except `/api/auth/register` and `/api/auth/login` require a valid token.

**Header format for all authenticated requests:**
```
Authorization: Bearer <token>
```

**Token details:**
- Algorithm: HmacSHA256
- Expiration: 24 hours
- Claims: `userId` (Long), `username` (String subject)
- Secret key is generated fresh each server startup (tokens do not persist across restarts)

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
- `400` — missing fields, invalid email, duplicate username/email

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
eyJhbGciOiJIUzI1NiJ9...
```

**Errors:**
- `401` — invalid credentials

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

**Response `200`:** Array of User objects (full profile including skills and role assignments)

---

### `DELETE /api/startups/{startupId}/members/{userId}`
Remove a member from a startup.

**Response `204`**
**Errors:** `404`

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
  "startup": { "id": 1, "name": "Acme" },
  "skillHeatmap": "{\"TECHNICAL\": 8, \"DESIGN\": 5, \"MARKETING\": 6, \"SALES\": 7, \"OPERATIONS\": 4, \"DOMAIN\": 6}",
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

**Errors:**
- `404` — startup not found
- `500` — Claude response parse failure

---

### `GET /api/startups/{startupId}/analyze/results`
Get the most recent analysis result for a startup.

**Response `200`:** Same AnalysisResult shape as above, or `null` if no analysis has been run.

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
  "skills": [ ...Skill[] ],
  "roleAssignments": [ ...RoleAssignment[] ]
}
```

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
  "members": [ ...User[] ],
  "analysisResults": [ ...AnalysisResult[] ]
}
```

### Skill
```json
{
  "id": 1,
  "name": "React",
  "category": "TECHNICAL",
  "proficiencyLevel": 9
}
```

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

## CORS

All controllers have `@CrossOrigin(origins = "*")`. The frontend can make requests from any origin without a proxy.

---

## Error Handling

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `201` | Resource created |
| `204` | Success, no body (DELETE) |
| `400` | Validation error or duplicate data |
| `401` | Missing/invalid JWT or wrong credentials |
| `404` | Resource not found — message: `"{Resource} not found with id: {id}"` |
| `500` | Claude response parse failure |

---

## Integration Flows

### 1. Registration & Login
```
POST /api/auth/register → store user.id
POST /api/auth/login    → store JWT in localStorage
```
Include JWT on every subsequent request: `Authorization: Bearer <token>`

### 2. Create Startup
```
POST /api/startups  { name, productDescription, businessModel, keyChallenges, owner: { userId } }
→ store startup.id
```

### 3. Add Team Members
```
POST /api/startups/{startupId}/members  { userId }
```
Users must already be registered. Skills are attached to Users, not to startup membership.

> **Note:** There is currently no REST endpoint for adding/editing Skills on a User.
> Skills are seeded directly in the database or need a new endpoint to be built.

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

## Known Gaps (Missing Endpoints)

| Missing Feature | Status |
|----------------|--------|
| Add/edit/delete User skills | No endpoint — needs to be built |
| Update User profile (name, headline, role, etc.) | No endpoint — needs to be built |
| Join startup by invite code | No invite code system exists yet |
| List startups a user belongs to | No dedicated endpoint — filter from `GET /api/startups` |
