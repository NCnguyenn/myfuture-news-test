# MyFuture News Module — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkboxes for tracking. Start only after the specification and architecture are approved.

**Goal:** Build a full-stack News module with seven UI tabs (one aggregate Overview plus six category pages), an article detail page, PostgreSQL/Prisma, Redis cache-aside, and Docker Compose.

**Architecture:** One monorepo with a Next.js frontend and a NestJS backend on Fastify. Backend is the only layer that accesses PostgreSQL via Prisma and Redis via a cache service; frontend calls REST APIs and never touches the database. Use seed data instead of an admin/CMS.

**Tech Stack:** Next.js, React, TypeScript, NestJS, Fastify adapter, PostgreSQL, Prisma, Redis, Docker Compose, npm workspaces or whatever package manager already exists in the repository.

## Global Constraints

- Build only the News module, not the entire MyFuture product.
- UI has 7 tabs but the database has only 6 real Categories; do not create an “Overview” Category.
- Frontend must be Next.js + React + TypeScript.
- Backend must be NestJS + Fastify + TypeScript.
- Database must be PostgreSQL with Prisma.
- Redis is cache-aside for read APIs only; do not add a queue because this MVP has no asynchronous business use case.
- Docker Compose must run PostgreSQL and Redis.
- Use async Server Components for page-level read data; use Client Components only for browser-only interactions.
- Use CSS Modules plus global CSS; do not add Tailwind or another UI framework.
- Use committed local SVG placeholders for seed images; do not depend on remote image hosting.
- Sanitize article HTML in the backend with `sanitize-html` before caching/returning it.
- Do not add login, admin, CMS, image upload, crawler, AI, Pro, video, podcast, reports, CRM, or microservices.
- The repository documentation remains in English; user-facing project discussion may be Vietnamese.
- Each phase defaults to `NOT STARTED`.

---

## Expected file structure

| Path | Responsibility |
|---|---|
| `apps/frontend/` | Next.js frontend, routes, and UI components |
| `apps/frontend/public/images/news/` | Local SVG placeholders used by seed data and broken-image fallback |
| `apps/frontend/**/*.module.css` | Component-scoped CSS Modules |
| `apps/backend/` | NestJS/Fastify API |
| `apps/backend/prisma/schema.prisma` | Category, Article, and optional Tag models |
| `apps/backend/prisma/seed.ts` | Six Categories and sample articles |
| `docker-compose.yml` | Local PostgreSQL and Redis |
| `.env.example` | Environment variable names, no real secrets |
| `README.md` | Run, migrate, seed, test, and build instructions |
| `md/` | Spec, architecture, plan, checklist, and progress |

---

## Phase 0 — Preparation and scope confirmation

**Goal:** Confirm environment, repository, and docs before creating application source.

**Work:**

- Check Node.js and npm/pnpm.
- Check Docker and Docker Compose.
- Check Git, current branch, and working tree status.
- Read `md/01-PROJECT-SPEC.md`, `md/02-TECHNICAL-ARCHITECTURE.md`, and the plan constraints.
- Inspect `.gitignore` if it already exists.
- Run `git init` only if no Git repository exists; do not re-init an existing repo.
- Lock the package manager: prefer an existing lockfile; if none exists, use npm workspaces to reduce setup.

**Files:**

- Read: `md/01-PROJECT-SPEC.md`
- Read: `md/02-TECHNICAL-ARCHITECTURE.md`
- Create or modify: `.gitignore` if missing
- Modify: `md/05-PROGRESS.md`

**Entry criteria:** Docs in `md/` already exist and there is no application source that must be preserved.

**Done when:** Tool versions are reported, Git status is clean or existing changes are recorded, package manager is chosen, and scope has no contradictions.

**How to verify:** Run `node --version`, `npm --version` or `pnpm --version`, `docker --version`, `docker compose version`, `git status --short`.

**Common failures:** Docker Desktop not running; Node too old; using `localhost` inside containers; overwriting existing changes.

**Must not:** Create apps, install packages, edit out-of-scope content, or delete user files.

**Default status:** `NOT STARTED`

---

## Phase 1 — Project scaffold

**Goal:** Create frontend/backend skeletons and monorepo wiring without business logic.

**Work:**

- Create `apps/frontend` with Next.js + React + TypeScript.
- Create `apps/backend` with NestJS + TypeScript.
- Configure backend to use `FastifyAdapter` instead of the default Express adapter.
- Add workspace scripts for dev/build/lint/test when the package manager supports them.
- Create `.env.example` with variables defined in the architecture doc.
- Create `.gitignore` excluding `node_modules`, `.next`, `dist`, `.env`, logs, and coverage.
- Keep Next.js built-in CSS Modules and `globals.css`; do not enable Tailwind during scaffolding.
- Add minimal page/endpoint so both apps can start.

**Files:**

- Create: `package.json`, workspace config, and matching lockfile
- Create: `apps/frontend/**`
- Create: `apps/backend/**`
- Create: `.env.example`, `.gitignore`
- Modify: `md/05-PROGRESS.md`

**Entry criteria:** Phase 0 locked package manager and no existing app source that must be preserved.

**Done when:** Frontend runs on port 3000, backend on port 4000, backend returns a health response, and Fastify is actually used.

**How to verify:** Run each app’s dev script; open `http://localhost:3000`; call the backend health endpoint; confirm logs do not show Express adapter.

**Common failures:** Workspace scripts run from the wrong directory; ports already in use; Next.js and NestJS env names diverge.

**Must not:** Build full UI, add authentication, install Tailwind, or install a UI kit without need.

**Default status:** `NOT STARTED`

---

## Phase 2 — Infrastructure and Prisma

**Goal:** Start PostgreSQL/Redis with Docker Compose and wire Prisma.

**Work:**

- Create `docker-compose.yml` with `postgres` and `redis` services.
- Add a PostgreSQL volume and healthchecks for both services.
- Configure `DATABASE_URL` and `REDIS_URL` using Compose service hostnames where appropriate.
- Install and initialize Prisma in the backend.
- Create a shared Prisma service/module.
- Add a health check that reports API, PostgreSQL, and Redis status.

**Files:**

- Create: `docker-compose.yml`
- Create: `apps/backend/prisma/schema.prisma`
- Create: `apps/backend/src/prisma/prisma.module.ts`
- Create: `apps/backend/src/prisma/prisma.service.ts`
- Modify: `apps/backend/src/main.ts`, `apps/backend/src/app.module.ts`
- Modify: `.env.example`, `README.md`
- Modify: `md/05-PROGRESS.md`

**Entry criteria:** Phase 1 produced a backend skeleton.

**Done when:** `docker compose -f infrastructure/docker-compose.yml up -d` starts both services; API can open a Prisma connection; health check distinguishes unavailable database/Redis.

**How to verify:** Run `docker compose -f infrastructure/docker-compose.yml ps`; run Prisma validate; call health with both services up and with each service stopped.

**Common failures:** Using `localhost` from inside a container; old volume with different credentials; wrong Redis URL scheme; Prisma client not generated.

**Must not:** Add extra database services, message brokers, or other orchestration.

**Default status:** `NOT STARTED`

---

## Phase 3 — Database schema and seed

**Goal:** Have a minimal schema, migrations, and demo data sufficient for full-flow testing.

**Work:**

- Define `Category` with unique `slug`, `sortOrder`, `isActive`, and timestamps.
- Define `Article` with title, slug, excerpt, contentHtml, images, publishedAt, isPublished, isFeatured, viewCount, readingTime, source, and categoryId.
- Add indexes on `categoryId`, `publishedAt`, `isPublished`, `isFeatured`, and composite `(categoryId, publishedAt)`.
- Seed only six real Categories; do not seed “Overview”.
- Seed at least 3 articles per Category and more than 10 articles in one Category for pagination tests.
- Seed multiple featured articles but limit display count via query.
- Seed articles with images, without images, long content, and related articles from other Categories. Keep a separate test fixture or temporary database state for an empty-category test; do not contradict the requirement to seed every Category.
- Create `apps/frontend/public/images/news/placeholder-01.svg`, `placeholder-02.svg`, `placeholder-03.svg`, and `placeholder-default.svg`.
- Store relative local paths such as `/images/news/placeholder-01.svg` in seeded image fields; use the default file when an article has no dedicated image.
- Run migrations and generate the Prisma client.

**Files:**

- Modify: `apps/backend/prisma/schema.prisma`
- Create: `prisma/migrations/**`
- Create: `apps/backend/prisma/seed.ts`
- Create: `apps/frontend/public/images/news/*.svg`
- Modify: `package.json` scripts
- Modify: `README.md`, `md/05-PROGRESS.md`

**Entry criteria:** PostgreSQL is running and Prisma can connect.

**Done when:** Migration works on an empty database; seed is idempotent or has a clear reset path; queries confirm six Categories and Article data; every seeded local image path resolves from Next.js public assets.

**How to verify:** Run migrate + seed; use Prisma Studio or read-only SQL to check counts, unique slugs, relations, and pagination volume.

**Common failures:** Duplicate slugs; unstable seed dates; remote/hotlinked seed images; wrong public path; too few articles in some Categories.

**Must not:** Create Project, User, Comment, Like, or admin tables.

**Default status:** `NOT STARTED`

---

## Phase 4 — Backend API

**Goal:** Deliver three stable read APIs with validation, pagination, and related articles.

**Work:**

- Create `CategoriesModule`, `CategoriesController`, `CategoriesService`.
- Create `ArticlesModule`, `ArticlesController`, `ArticlesService`.
- Add backend runtime dependency `sanitize-html` and TypeScript types when required.
- Create `ContentSanitizerService` with the explicit allowlist defined in `02-TECHNICAL-ARCHITECTURE.md`.
- Create list-query DTOs: category slug, page, limit, featured, and sort.
- Normalize queries before building cache keys.
- Implement `GET /api/categories`.
- Implement `GET /api/articles` with `isPublished`, Category filter, featured, newest sort, and pagination.
- Implement `GET /api/articles/:slug` with Category, related articles, and optional tags/previous-next navigation.
- Sanitize `contentHtml` before detail responses are cached or returned; strip scripts, event handlers, unsafe protocols, and unknown tags.
- Return pagination responses matching the architecture schema.
- Return 400 for bad queries, 404 for unknown slugs, and 500 for unexpected errors.
- Configure CORS for the frontend origin.
- Do not leak unnecessary internal fields.

**Files:**

- Create: `apps/backend/src/categories/**`
- Create: `apps/backend/src/articles/**`
- Create: `apps/backend/src/content/content-sanitizer.service.ts`
- Create: `apps/backend/src/common/**` if filters/exception mappers are needed
- Modify: `apps/backend/src/app.module.ts`, `apps/backend/src/main.ts`
- Create: `apps/backend/test/**`
- Modify: `README.md`, `md/05-PROGRESS.md`

**Entry criteria:** Phase 3 has schema and seed.

**Done when:** All three APIs run against real PostgreSQL, match the contract, bad queries do not crash the process, and unsafe article markup is removed before the response/cache boundary.

**How to verify:** Call APIs with curl/REST client for overview, each Category, first/last page, invalid limit, invalid Category, and invalid article slug; use a test article containing script/event-handler markup and confirm the response contains no executable markup.

**Common failures:** Wrong offset math; Category filter dropped across pages; total count query diverges from list filters; unknown Category returns 200.

**Must not:** Create POST/PUT/PATCH/DELETE without an admin requirement.

**Default status:** `NOT STARTED`

---

## Phase 5 — Redis cache-aside

**Goal:** Cache read APIs and still serve data when Redis is stopped.

**Work:**

- Create `CacheModule` and `CacheService` wrapping a Redis client.
- Create helpers for category, article-list, and article-detail keys.
- Cache `GET /api/categories` with ~30 minute TTL.
- Cache article list/featured with 5–10 minute TTL.
- Cache article detail with 10–30 minute TTL.
- Serialize responses to the API schema; never cache exceptions.
- Log cache hit/miss in development.
- Catch Redis connection errors, warn, and fall back to Prisma.
- On seed/reset, clear cache or document a flush command in README.

**Files:**

- Create: `apps/backend/src/cache/cache.module.ts`
- Create: `apps/backend/src/cache/cache.service.ts`
- Create: `apps/backend/src/cache/cache.keys.ts`
- Modify: `apps/backend/src/categories/categories.service.ts`
- Modify: `apps/backend/src/articles/articles.service.ts`
- Create/modify: `apps/backend/test/cache/**`
- Modify: `README.md`, `md/04-TEST-CHECKLIST.md`, `md/05-PROGRESS.md`

**Entry criteria:** Read APIs work without depending on Redis.

**Done when:** First request is a miss, repeat is a hit; with Redis down, APIs still return PostgreSQL data.

**How to verify:** Flush Redis, call an API twice and inspect logs/cache; stop Redis and call again to confirm fallback.

**Common failures:** Cache key missing page/category; JSON parse errors; TTL not applied; Redis exceptions become HTTP 500.

**Must not:** Add BullMQ, workers, sessions, or complex view-count sync.

**Default status:** `NOT STARTED`

---

## Phase 6 — Frontend pages and components

**Goal:** Build three dynamic routes for the News module using real backend data.

**Work:**

- Create shared layout with Header, main container, and Footer.
- Implement all three route pages as async Server Components that call NestJS for initial read data.
- Keep tabs and pagination as links/URL navigation; do not introduce a client-side fetching store.
- Use Client Components only for Copy link, browser-only retry behavior, or a mobile-menu toggle.
- Create `NewsTabs` with Overview plus six Categories from the API.
- Create `NewsCard`, `FeaturedNews`, `NewsList`, and `Pagination` with typed data.
- Implement `/ban-tin` with featured and latest articles.
- Implement `/ban-tin/chuyen-muc/[slug]` with breadcrumb, Category title, list, and page query.
- Implement `/ban-tin/[articleSlug]` with title, metadata, image, excerpt, content, source, and related articles. Tags and previous/next navigation are recommended enhancements, not blockers for the MVP.
- Render only the backend-sanitized `contentHtml`; the frontend must not accept arbitrary raw HTML from user input.
- Create an API client that handles base URL and HTTP errors.
- Configure frontend fetch as `cache: 'no-store'` or document one intentional revalidation policy so backend Redis remains the canonical application cache.
- Style components with colocated CSS Modules and keep global tokens/reset in `globals.css`.
- Show 404 for unknown Category/article.
- Add route-level SEO metadata.

**Files:**

- Create/modify: `apps/frontend/app/**`
- Create: `apps/frontend/components/layout/**`
- Create: `apps/frontend/components/news/**`
- Create: `apps/frontend/lib/api-client.ts`, `apps/frontend/lib/format-date.ts`
- Create: `apps/frontend/types/news.ts`
- Create/modify: `apps/frontend/app/globals.css`, `apps/frontend/**/*.module.css`
- Modify: `README.md`, `md/05-PROGRESS.md`

**Entry criteria:** API contract and seed data are stable.

**Done when:** All three Server Component routes render API data, tab/card/page navigation uses correct URLs, hard refresh preserves state, and no unnecessary client-side data store or CSS framework is present.

**How to verify:** Open each route, change tabs/pages, click cards, refresh detail, use bad slugs, and inspect Network requests.

**Common failures:** Wrong server-side API base URL; accidentally importing browser-only code into a Server Component; conflicting Next.js and Redis cache behavior; incorrect slug encoding; related list includes the current article.

**Must not:** Call PostgreSQL from Next.js; hardcode sample articles; convert whole pages to Client Components; add Tailwind or a UI framework.

**Default status:** `NOT STARTED`

---

## Phase 7 — UI states and responsive

**Goal:** UI handles real-world states on desktop, tablet, and mobile.

**Work:**

- Add route-level `loading.tsx` skeletons for Server Component navigation/fetching.
- Add empty state when a Category has no articles.
- Add error state with retry or clear retry guidance.
- Add not-found state for dynamic routes.
- Add broken-image fallback and alt text.
- Test long content, long titles, dates, and large view counts.
- Make tabs horizontally scrollable on mobile.
- Prevent horizontal overflow on cards and detail content.
- Verify mobile, tablet, and desktop breakpoints.

**Files:**

- Modify: `apps/frontend/components/news/**`
- Modify: `apps/frontend/components/layout/**`
- Modify: `apps/frontend/app/loading.tsx`, `apps/frontend/app/error.tsx`, `apps/frontend/app/not-found.tsx`
- Modify: `apps/frontend/styles/**`, `md/04-TEST-CHECKLIST.md`, `md/05-PROGRESS.md`

**Entry criteria:** Main routes already render with normal data.

**Done when:** Layout does not break at target viewports; every loading/empty/error/404 state has a clear UI.

**How to verify:** Use DevTools viewports, network throttling, stop the API, use a temporary empty-category fixture, break image URLs, and open long titles.

**Common failures:** Tabs overflow width; images without size cause layout shift; error boundary misses server-component failures.

**Must not:** Add heavy animation or a large design system just for decoration.

**Default status:** `NOT STARTED`

---

## Phase 8 — Testing

**Goal:** Verify database, API, cache, routing, UI states, and builds.

**Work:**

- Run migration on an empty database.
- Run seed from scratch and inspect data.
- Test `GET /api/categories`.
- Test article list for overview, Category, featured, and pagination.
- Test article detail and related articles.
- Test controlled 400, 404, and 500 cases.
- Test Redis hit/miss and fallback when Redis is down.
- Test `sanitize-html` removes unsafe markup before the detail response is cached.
- Test frontend routing, hard refresh, and 404s.
- Verify Server/Client Component boundaries, explicit frontend fetch policy, CSS Modules, and local SVG seed assets.
- Test responsive, broken images, long content, loading, empty, error.
- Run lint, typecheck, tests, and frontend/backend builds.
- Confirm no serious console errors.

**Files:**

- Modify: `apps/backend/test/**`
- Create: `apps/frontend/**` tests if a test framework is already chosen
- Modify: `md/04-TEST-CHECKLIST.md`, `md/05-PROGRESS.md`, `README.md`

**Entry criteria:** All routes and APIs are implemented.

**Done when:** Checklist items pass or have clear notes; production builds succeed.

**How to verify:** Run every command documented in the README and store a short summary in progress.

**Common failures:** Tests depend on stale data; Redis still holds old responses; production build lacks env vars.

**Must not:** Ignore failures just because the dev server still runs.

**Default status:** `NOT STARTED`

---

## Phase 9 — Polish and handoff

**Goal:** Deliver a repository that can be re-run and is easy to review.

**Work:**

- Write README from clone to successful run.
- Document `docker compose up`, migrate, seed, dev, test, and build commands.
- Confirm `.env.example` has no real secrets.
- Remove leftover logs/debug/comments.
- Rebuild frontend/backend from a clean environment when possible.
- Review `git diff` and out-of-scope files.
- Update `05-PROGRESS.md` with verification, known issues, and technical debt.
- Prepare repo/demo links only if deployment is actually allowed.

**Files:**

- Create/modify: `README.md`
- Modify: `.env.example`, `.gitignore`
- Modify: `md/04-TEST-CHECKLIST.md`, `md/05-PROGRESS.md`
- Review: all of `apps/`, `prisma/`, `docker-compose.yml`

**Entry criteria:** Phase 8 has test results.

**Done when:** A reviewer can follow the README; acceptance criteria are mapped; no secrets or out-of-scope source remain.

**How to verify:** Clone/copy into a clean folder, follow README from zero, and open the three main routes.

**Common failures:** README documents non-existent commands; `.env.example` misses vars; old Docker volumes hide migration issues.

**Must not:** Deploy or send data to external services without permission; delete Git history or user files.

**Default status:** `NOT STARTED`

---

## Progress update rules

- After each phase, update `md/05-PROGRESS.md`.
- Do not mark `DONE` without a verification command.
- Use `BLOCKED` for issues outside control or missing external dependencies; record the blocker clearly.
- Use `VERIFIED` only after re-checking in an environment similar to the reviewer’s.
- If architecture changes, update `02-TECHNICAL-ARCHITECTURE.md` before continuing implementation.
