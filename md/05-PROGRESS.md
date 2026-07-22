# Progress Tracker — MyFuture News Module

## Status conventions

- `NOT STARTED`: Phase/task not started.
- `IN PROGRESS`: Work is underway.
- `BLOCKED`: Blocked by a dependency, access issue, or unresolved error.
- `DONE`: Completed against the phase/task goal.
- `VERIFIED`: Completed and verified with checklist evidence.

## Phase overview

| Phase | Content | Status | Started date | Completed date | Verification | Notes |
|---|---|---|---|---|---|---|
| Phase 0 | Preparation and scope confirmation | `IN PROGRESS` | 2026-07-21 |  | Documentation/contract audit passed; Node v24.15.0, npm.cmd 11.12.1, Docker 29.4.0, Docker Compose v5.1.2 | Scope is normalized, but the existing `.git` directory is not a valid Git repository |
| Phase 1 | Project scaffold | `VERIFIED` | 2026-07-21 | 2026-07-21 | `npm.cmd install`, `npm.cmd run typecheck`, `npm.cmd run build` and HTTP checks all passed | Dependencies installed successfully |
| Phase 2 | Infrastructure and Prisma | `VERIFIED` | 2026-07-21 | 2026-07-21 | `docker compose ps` healthy (PostgreSQL host port 5434, Redis 6379), `npx prisma validate & generate` passed, `GET /api/health` reports status ok / degraded | Multi-dependency health check & PrismaModule verified |
| Phase 3 | Database schema and seed | `NOT STARTED` |  |  |  |  |
| Phase 4 | Backend API | `NOT STARTED` |  |  |  |  |
| Phase 5 | Redis cache-aside | `NOT STARTED` |  |  |  |  |
| Phase 6 | Frontend pages and components | `NOT STARTED` |  |  |  |  |
| Phase 7 | UI states and responsive | `NOT STARTED` |  |  |  |  |
| Phase 8 | Testing | `NOT STARTED` |  |  |  |  |
| Phase 9 | Polish and handoff | `NOT STARTED` |  |  |  |  |

## Task log

| Phase | Task | Status | Started date | Completed date | Files changed | Verification | Notes |
|---|---|---|---|---|---|---|---|
| 0 | Check Node/npm or pnpm, Docker, Git | `VERIFIED` | 2026-07-21 | 2026-07-21 |  | `node --version`, `npm.cmd --version`, `docker --version`, `docker compose version`, `git status --short` | Use `npm.cmd`; Git reports this directory is not a repository despite an existing `.git` directory |
| 0 | Read and confirm spec/architecture | `VERIFIED` | 2026-07-21 | 2026-07-21 | `md/01-PROJECT-SPEC.md`, `md/02-TECHNICAL-ARCHITECTURE.md`, `md/03-IMPLEMENTATION-PLAN.md`, `md/04-TEST-CHECKLIST.md`, `md/05-PROGRESS.md`, `role/AI-NEWS-TEAM-LEAD.md` | Cross-file contradiction audit completed | Redis cache-only, `/api` prefix, frozen pagination/error rules, and Overview UI-only decision recorded |
| 1 | Create workspace and frontend/backend skeleton | `VERIFIED` | 2026-07-21 | 2026-07-21 | `package.json`, `apps/web/**`, `apps/api/**` | `npm.cmd install` (301 packages added), `npm.cmd run typecheck` and `npm.cmd run build` passed. `curl http://localhost:3000/ban-tin` returned 200 OK | Minimal placeholder routes only |
| 1 | Configure Fastify adapter and health endpoint | `VERIFIED` | 2026-07-21 | 2026-07-21 | `apps/api/src/main.ts`, `apps/api/src/health.controller.ts` | `curl http://localhost:4000/api/health` returned 200 OK with `{"data":{"status":"ok","service":"myfuture-news-api"}}` | Uses `FastifyAdapter` and `/api/health` |
| 1 | Create `.gitignore` and `.env.example` | `DONE` | 2026-07-21 | 2026-07-21 | `.gitignore`, `.env.example` | File inspection passed | No secrets committed |
| 2 | Create Docker Compose for PostgreSQL/Redis | `VERIFIED` | 2026-07-21 | 2026-07-21 | `docker-compose.yml`, `.env.example`, `.env` | `docker compose up -d` succeeded; `postgres:16-alpine` (host port 5434) and `redis:7-alpine` (host port 6379) healthy in `docker compose ps` | Host port 5434 used to avoid conflict with local host PostgreSQL |
| 2 | Initialize Prisma and Prisma service | `VERIFIED` | 2026-07-21 | 2026-07-21 | `prisma/schema.prisma`, `apps/api/src/prisma/*` | `npx prisma validate` passed, `npx prisma generate` (Client v6.4.0) passed. `PrismaModule` and `PrismaService` wired into NestJS | Global module pattern used |
| 2 | Multi-dependency health check & Redis connection probe | `VERIFIED` | 2026-07-21 | 2026-07-21 | `apps/api/src/health/*` | `curl http://localhost:4000/api/health` returned `200 OK` with `status: ok` when both UP, and `status: degraded` (`redis: down`) when Redis stopped | Cleanly reports status without process crash |
| 3 | Create Category/Article models | `NOT STARTED` |  |  |  |  |  |
| 3 | Create migration | `NOT STARTED` |  |  |  |  |  |
| 3 | Seed six Categories and sample articles | `NOT STARTED` |  |  |  |  |  |
| 3 | Create local SVG seed placeholders | `NOT STARTED` |  |  |  |  |  |
| 4 | Implement `GET /api/categories` | `NOT STARTED` |  |  |  |  |  |
| 4 | Implement `GET /api/articles` | `NOT STARTED` |  |  |  |  |  |
| 4 | Implement `GET /api/articles/:slug` | `NOT STARTED` |  |  |  |  |  |
| 4 | DTO, CORS, and error handling | `NOT STARTED` |  |  |  |  |  |
| 4 | Add `sanitize-html` before article response/cache | `NOT STARTED` |  |  |  |  |  |
| 5 | Cache categories | `NOT STARTED` |  |  |  |  |  |
| 5 | Cache article list/featured | `NOT STARTED` |  |  |  |  |  |
| 5 | Cache detail and Redis fallback | `NOT STARTED` |  |  |  |  |  |
| 6 | Create Header/Footer layout | `NOT STARTED` |  |  |  |  |  |
| 6 | Create `/ban-tin` page | `NOT STARTED` |  |  |  |  |  |
| 6 | Create category page and pagination | `NOT STARTED` |  |  |  |  |  |
| 6 | Create detail page and related articles | `NOT STARTED` |  |  |  |  |  |
| 6 | Enforce Server/Client Component boundaries and fetch policy | `NOT STARTED` |  |  |  |  |  |
| 6 | Implement CSS Modules and global CSS | `NOT STARTED` |  |  |  |  |  |
| 7 | Loading/empty/error/404 states | `NOT STARTED` |  |  |  |  |  |
| 7 | Responsive and broken-image fallback | `NOT STARTED` |  |  |  |  |  |
| 7 | Basic SEO metadata | `NOT STARTED` |  |  |  |  |  |
| 8 | Test API/database | `NOT STARTED` |  |  |  |  |  |
| 8 | Test Redis hit/miss/fallback | `NOT STARTED` |  |  |  |  |  |
| 8 | Test frontend/routing/responsive | `NOT STARTED` |  |  |  |  |  |
| 8 | Lint, typecheck, test, build | `NOT STARTED` |  |  |  |  |  |
| 9 | Finish README and scan secrets | `NOT STARTED` |  |  |  |  |  |
| 9 | Re-run from a clean environment | `NOT STARTED` |  |  |  |  |  |

## Decisions

| ID | Decision | Reason | Date |
|---|---|---|---|
| D-001 | Use three dynamic route templates: overview, category, detail | Avoid seven hard-coded pages; keep data-driven routing | 2026-07-21 |
| D-002 | “Overview” is an aggregate filter, not a Category | Matches real tab structure and avoids duplicate data | 2026-07-21 |
| D-003 | Redis uses cache-aside for read APIs | Meets Redis requirement with low complexity | 2026-07-21 |
| D-004 | Use Prisma seed instead of admin/CMS | Admin/CMS is out of scope for the assignment | 2026-07-21 |
| D-005 | No queue, microservices, or Kubernetes | No async business need; assignment is one module | 2026-07-21 |
| D-006 | Use Server Components for page-level reads; Client Components only for browser interactions | Supports direct refresh and SEO without unnecessary client state | 2026-07-21 |
| D-007 | Use CSS Modules plus `globals.css`; no Tailwind/UI framework | Uses built-in Next.js styling and avoids another framework | 2026-07-21 |
| D-008 | Seed image fields point to committed local SVG placeholders | Deterministic demo data works offline and avoids hotlink failures | 2026-07-21 |
| D-009 | Sanitize article HTML with backend `sanitize-html` before caching/response | Works in Node/Fastify without browser DOM and keeps unsafe HTML out of Redis/frontend | 2026-07-21 |
| D-010 | Use Redis cache-aside only; do not add a queue without a concrete async use case | The recruiter brief names cache/queue but the News MVP has synchronous read flows only | 2026-07-21 |
| D-011 | Use `/api` as the backend API prefix and return 200 with empty data for page overflow | Gives frontend and checklist one deterministic contract | 2026-07-21 |
| D-012 | Generate English AI delegation prompts only on explicit user request; discuss and report in Vietnamese | Keeps human interaction language separate from machine-execution prompts | 2026-07-21 |
| D-013 | Map PostgreSQL host port to 5434 in docker-compose.yml and .env | Host port 5432 was occupied by local Windows PostgreSQL 17 service | 2026-07-21 |

## Known issues

The application scaffold now exists. Track environment and implementation issues below.

| ID | Description | Impact | How to reproduce | Status | Owner |
|---|---|---|---|---|---|
| ENV-001 | PowerShell blocks `npm.ps1`; use `npm.cmd` for npm commands | Direct `npm` calls fail in this shell | Run `npm --version` in PowerShell | OPEN | Developer |
| ENV-002 | Dependencies are not installed, so frontend/backend typecheck cannot run | Phase 1 cannot be marked verified yet | Run either workspace typecheck before `npm.cmd install` | CLOSED | Developer |
| ENV-003 | Docker Compose reads a user config path that reports access denied, although Compose config validation exits 0 | May affect later Docker commands depending on environment permissions | Run `docker compose config --quiet` | MONITOR | Developer |
| ENV-004 | Existing `.git` directory is not recognized as a valid repository | Git diff/status/commit evidence is unavailable | Run `git status --short` from the workspace root | OPEN | User/Developer |

## Technical debt

No technical debt yet. Do not list intentional out-of-scope features here; put those in the spec or decision log.

| ID | Debt | Why accepted | Follow-up | Priority | Status |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## Next action

1. Start Phase 3: Database schema and seed (define full Category & Article schema models, create migration, seed six real Categories & sample articles, create local SVG placeholders).
2. Update this file after each verified phase; do not mark work complete without command evidence.

## Update rules

- Move a task to `DONE` only after the work is finished.
- Move to `VERIFIED` only when a verification command and result are recorded in the Verification column.
- Do not mark a phase complete while required tasks remain unfinished.
- Use dates in `YYYY-MM-DD` format.
