# JumpStart

**AI-powered startup team role assignment platform.**

JumpStart helps tech startup founders build high-performing teams. Register your startup, add team members with their skills, and let Claude AI analyze your team to assign optimal roles, identify skill gaps, and recommend actionable next steps.

**Live Demo:** [bgranillo101.github.io/JumpStart](https://bgranillo101.github.io/JumpStart/)

---

## Features

- **Smart Role Assignment** — Claude AI evaluates each team member's skills, experience, and preferences to assign the best-fit role with confidence scores and reasoning.
- **Skill Gap Analysis** — Identifies missing roles (critical, recommended, nice-to-have) and the specific skills to hire for.
- **Skill Heatmap** — Interactive radar chart visualizing your team's strengths across six categories: Technical, Design, Marketing, Sales, Operations, and Domain.
- **Team Invites** — Generate shareable invite links so teammates can join your startup with one click.
- **Two Onboarding Paths** — Create a new company or join an existing team, with a guided step-by-step wizard.
- **Interactive Hero** — Physics-driven force-directed org chart animation built with D3-Force.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8 |
| Visualization | Recharts (radar charts), D3-Force (hero animation) |
| Backend | Spring Boot 3.2.3, Java 17 |
| Database | PostgreSQL 17 |
| AI | Claude API (Anthropic) |
| Auth | JWT (jjwt 0.12.5), Spring Security |
| Testing | JUnit 5 + Mockito (backend), Playwright (E2E frontend) |
| Deployment | GitHub Pages (frontend), Render (backend) |

---

## Architecture

```
                    ┌──────────────┐
                    │   Frontend   │
                    │  React + TS  │
                    │ GitHub Pages │
                    └──────┬───────┘
                           │ REST API
                    ┌──────▼───────┐
                    │   Backend    │
                    │ Spring Boot  │
                    │    Render    │
                    └──┬───────┬───┘
                       │       │
              ┌────────▼──┐ ┌──▼──────────┐
              │ PostgreSQL │ │  Claude API  │
              │  Database  │ │  (Anthropic) │
              └────────────┘ └─────────────┘
```

**Data Flow:** User creates Startup → Adds Team Members with Skills → Triggers AI Analysis → Claude evaluates team composition → Backend parses response → Persists Role Assignments and Skill Gaps → Dashboard displays results with visualizations.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Java 17+
- Maven 3.9+
- PostgreSQL 17+

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173/JumpStart/`.

### Backend

1. Create the database:

```bash
createdb JumpStart_database
```

2. Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

3. Fill in your credentials in `backend/.env`:

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/JumpStart_database
PGUSER=<your_postgres_username>
PGPASSWORD=<your_postgres_password>
CLAUDE_API_KEY=<your_anthropic_api_key>
JWT_SECRET=<base64_encoded_secret>
FRONTEND_URL=http://localhost:5173
```

4. Start the server:

```bash
cd backend
set -a && source .env && set +a
mvn spring-boot:run
```

The API starts at `http://localhost:8080/api`.

### Running Tests

**Backend unit tests (JUnit 5 + Mockito — no database required):**
```bash
cd backend
mvn test -Dspring.profiles.active=test
```

**Frontend E2E tests (Playwright):**
```bash
cd frontend
npm test              # Run all Playwright E2E tests (headless)
npm run test:headed   # Run with visible browser
npm run test:ui       # Interactive Playwright UI
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Startups
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/startups` | Create a startup |
| GET | `/api/startups/{id}` | Get startup details |
| GET | `/api/startups` | List all startups |
| PUT | `/api/startups/{id}` | Update a startup |
| POST | `/api/startups/{id}/invite` | Generate invite link |
| POST | `/api/startups/join/{code}` | Join by invite code |

### Team Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/startups/{id}/members` | List team members |
| POST | `/api/startups/{id}/members` | Add a member |
| DELETE | `/api/startups/{id}/members/{userId}` | Remove a member |

### Users & Skills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/{id}` | Get user profile |
| PATCH | `/api/users/{id}` | Update user profile |
| POST | `/api/users/{id}/skills` | Add skills to user |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/startups/{id}/analyze` | Run AI team analysis |
| GET | `/api/startups/{id}/analyze/results` | Get latest analysis |
| GET | `/api/startups/{id}/skill-heatmap` | Get skill heatmap data |

---

## Project Structure

```
JumpStart/
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Frontend lint/build/deploy to GitHub Pages
│       └── backend.yml             # Backend tests + Render deploy hook
├── frontend/
│   ├── src/
│   │   ├── css/                    # Stylesheets
│   │   └── tsx/
│   │       ├── api/                # API client functions
│   │       ├── components/         # Reusable UI components
│   │       ├── context/            # React context (Auth, Wizard)
│   │       ├── pages/
│   │       │   ├── Auth/           # SignIn, Register, CreateProfile, JoinTeam, JoinByInvite
│   │       │   ├── Dashboard/      # DashboardLayout (Overview, Team, Analysis, Settings)
│   │       │   └── Profile/        # ProfilePage, ProfileHeader, SkillsSection
│   │       ├── types/              # TypeScript interfaces
│   │       ├── App.tsx             # Router and route definitions
│   │       └── Landing.tsx         # Landing page
│   ├── tests/                      # Playwright E2E tests
│   └── playwright.config.ts
├── backend/
│   └── src/
│       ├── main/java/com/jumpstart/api/
│       │   ├── controller/         # REST controllers
│       │   ├── service/            # Business logic + Claude API integration
│       │   ├── repository/         # JPA repositories
│       │   ├── entity/             # Database entities
│       │   ├── dto/                # Data transfer objects
│       │   ├── config/             # Security, JWT, CORS
│       │   └── exception/          # Custom exceptions
│       └── test/java/com/jumpstart/api/
│           ├── service/            # Unit tests: AnalysisService, StartupService
│           └── controller/         # Slice tests: AuthController
├── docs/
│   ├── DEMO_SCRIPT.md              # Step-by-step demo walkthrough
│   └── PRESENTATION.md             # Sprint 4 presentation talking points
└── ROADMAP.md                      # Development roadmap
```

---

## Team

| Name | GitHub | Role |
|------|--------|------|
| Brandon Granillo | [@Bgranillo101](https://github.com/Bgranillo101) | Backend |
| Lincoln Vondra | [@vondraCS](https://github.com/vondraCS) | Frontend |
| Sebastian Fragoso | | Frontend |
| Gabriel Wright-Swaine | @gawrigh7(https://github.com/gawrigh7) | Backend |

---

## License

This project was built for educational purposes at Arizona State University.
