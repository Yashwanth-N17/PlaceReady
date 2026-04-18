# PlaceReady — Campus Placement Readiness Platform

PlaceReady is a unified frontend for tracking student placement readiness, training, and recruitment coordination across three roles: **Students**, **Faculty**, and **Placement Officers**.

> v1 is **frontend-only**. Every API call falls back to realistic mock data when no backend is reachable, so the platform looks fully populated during demos.

## Tech Stack

- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS v3** (HSL design tokens, dark theme)
- **shadcn/ui** components
- **Framer Motion** animations
- **Recharts** charts
- **Axios** API client (with mock fallback)
- **react-router-dom v6** routing
- **xlsx** Excel parsing/export
- **jspdf** + **jspdf-autotable** for PDF reports
- **sonner** toasts

## Folder Structure

```
src/
├── api/
│   ├── client.ts          # axios instance + withFallback() wrapper
│   └── index.ts           # StudentAPI, FacultyAPI, PlacementAPI, ReportsAPI, NotificationsAPI
├── components/
│   ├── DashboardLayout.tsx
│   ├── RoleSidebar.tsx    # role-aware nav
│   ├── NotificationBell.tsx
│   ├── TestRunner.tsx     # timed mock-test modal
│   ├── ReadinessRing.tsx
│   ├── StatCard.tsx
│   └── ui/                # shadcn primitives
├── data/
│   └── mock.ts            # all mock data + types
├── pages/
│   ├── Landing.tsx
│   ├── Reports.tsx        # shared (faculty + placement)
│   ├── StudentProfile.tsx # shared (faculty + placement)
│   ├── auth/              # role-specific logins
│   ├── student/           # Dashboard, Tests, Training
│   ├── faculty/           # Dashboard, Upload, MarksUpload, ScheduleTests
│   └── placement/         # Dashboard, Companies, Shortlist, Drives
└── App.tsx                # routes
```

## Run locally

```bash
npm install
npm run dev      # http://localhost:8080
npm run build
npm run lint
npm run test
```

## Environment variables

| Var | Default | Purpose |
|-----|---------|---------|
| `VITE_API_BASE_URL` | `/api` | Base URL for backend. If unreachable, mock data is used. |

Create a `.env.local`:

```
VITE_API_BASE_URL=https://your-backend.example.com/api
```

## API Endpoints

All endpoints are JSON. Auth is via `Authorization: Bearer <token>` (cosmetic in v1; token read from `localStorage["pr_token"]`). When the request fails, the frontend silently uses mock data.

### Student

| Method | Route | Body | Response | Role |
|--------|-------|------|----------|------|
| GET | `/student/me` | — | `{ id, name, email, rollNo, batch, branch, cgpa, readiness }` | student |
| GET | `/student/dashboard` | — | `{ readiness, skillsOverTime[], skillRadar[], weakAreas[], readinessTrend[] }` | student |
| GET | `/student/tests` | — | `ScheduledTest[]` | student |
| GET | `/student/results` | — | `Result[]` | student |
| GET | `/student/quiz` | `?topic=` | `QuizQuestion[]` | student |
| POST | `/student/tests/:id/submit` | `{ answers: { qid: index } }` | `{ ok, score, submittedAt }` | student |
| GET | `/student/training` | — | `TrainingModule[]` | student |
| PATCH | `/student/training/:id` | `{ progress: number }` | `{ ok, moduleId, progress }` | student |

### Faculty

| Method | Route | Body | Response | Role |
|--------|-------|------|----------|------|
| GET | `/faculty/me` | — | `FacultyMember` | faculty |
| GET | `/faculty/students` | `?mentorId=&subject=` | `StudentRecord[]` | faculty |
| GET | `/faculty/students/:id` | — | `StudentRecord` | faculty, placement |
| GET | `/faculty/batches` | — | `BatchPerformance[]` | faculty |
| GET | `/faculty/skill-gaps` | — | `SkillGap[]` | faculty |
| POST | `/faculty/tests` | `Partial<ScheduledTest>` | `{ ok, id }` | faculty |
| POST | `/faculty/marks` | `{ rows: Row[] }` | `{ ok, count }` | faculty |
| POST | `/faculty/mapping` | `Record<string,string>` | `{ ok }` | faculty |

### Placement

| Method | Route | Body | Response | Role |
|--------|-------|------|----------|------|
| GET | `/placement/companies` | — | `Company[]` | placement |
| POST | `/placement/companies` | `Partial<Company>` | `Company` | placement |
| GET | `/placement/shortlist/:companyId` | — | `StudentRecord[]` (auto-ranked) | placement |
| GET | `/placement/drives` | — | `PlacementDrive[]` | placement |
| POST | `/placement/drives` | `Partial<PlacementDrive>` | `{ ok, id }` | placement |
| PATCH | `/placement/drives/:driveId/applicants/:studentId` | `{ status }` | `{ ok }` | placement |
| GET | `/placement/trends` | — | `PlacementHistory[]` | placement |

### Reports

| Method | Route | Response | Role |
|--------|-------|----------|------|
| GET | `/reports/monthly-readiness` | `MonthlyReadiness[]` | faculty, placement |
| GET | `/reports/yoy` | `YearOverYear[]` | faculty, placement |
| GET | `/reports/heatmap` | `HeatmapRow[]` | faculty, placement |

### Notifications

| Method | Route | Response | Role |
|--------|-------|----------|------|
| GET | `/notifications?role=` | `Notification[]` | all |
| PATCH | `/notifications/:id/read` | `{ ok, id }` | all |
| POST | `/notifications/mark-all-read` | `{ ok }` | all |

## Type definitions

See `src/data/mock.ts` for all TypeScript interfaces.

## Notes

- Auth is cosmetic in v1. Logins simply navigate to the role dashboard.
- All Excel parsing/export happens client-side (`xlsx`). Reports also export to PDF (`jspdf`).
- Notification bell, mock test runner with timer, and Excel column mapping (with saved-mapping memory) are fully functional offline.
