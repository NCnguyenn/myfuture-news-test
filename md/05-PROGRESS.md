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
| Phase 0 | Preparation and scope confirmation | `VERIFIED` | 2026-07-21 | 2026-07-22 | Toolchain + scope docs + Git CLI (Codex re-test #2) | ENV-004 closed; residual: ENV-001 (npm.cmd), ENV-003 (compose config warning) |
| Phase 1 | Project scaffold | `VERIFIED` | 2026-07-21 | 2026-07-21 | Codex re-test #2: install/typecheck/build + `/ban-tin` + Fastify `/api` | |
| Phase 2 | Infrastructure and Prisma | `VERIFIED` | 2026-07-21 | 2026-07-21 | Codex re-test #2: compose 5434/6379, prisma validate/generate, health ok + redis/postgres degraded | |
| Phase 3 | Database schema and seed | `VERIFIED` | 2026-07-21 | 2026-07-22 | `npm.cmd install`; compose Postgres/Redis healthy; `prisma validate`; `migrate deploy`; `prisma generate`; `prisma db seed`; independent counts and image-path checks | 6 categories; no `overview`/`toan-canh`; published per category 12/4/3/4/3/3; max 12; featured published 9; unpublished 1; all 4 image paths resolve |
| Phase 4 | Backend API | `VERIFIED` | 2026-07-22 | 2026-07-22 | Focused service tests; `npm.cmd run typecheck:api`; `npm.cmd run build:api`; live `npm.cmd run dev:api` + HTTP acceptance matrix against Postgres on 5434 | Categories 200 with 6 active rows and counts 12/4/3/4/3/3; overview 29 published; category filter 12; featured 9; invalid query 400; unknown category/article 404; overflow 200 empty; detail sanitized with 5 related articles; unpublished 404 |
| Phase 5 | Redis cache-aside | `VERIFIED` | 2026-07-22 | 2026-07-22 | `npm.cmd run typecheck:api`; `npm.cmd run build:api`; 8 focused cache tests; Compose Redis/Postgres; live hit/miss, TTL, key-isolation, and Redis-stop fallback checks | Keys observed: `news:categories`, distinct article list keys, `news:article:phap-ly-du-an-bai-01`; TTLs ~1775s/575s/817s; all three APIs returned 200 during Redis outage; Phase 4 error statuses remained 400/404 |
| Phase 6 | Frontend pages and components | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/web/app/**`, `apps/web/components/**`, `apps/web/lib/**`, `apps/web/types/**`, `README.md` | `npm.cmd run typecheck:web`; `npm.cmd run build:web`; live Next/API route matrix | Overview, six API categories, category pagination, detail, metadata, CSS Modules, server-only API client, and not-found routes verified |
| Phase 7 | UI states and responsive | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/web/app/ban-tin/loading.tsx`, `error.tsx`, `apps/web/components/news/**`, `apps/web/app/globals.css`, `md/04-TEST-CHECKLIST.md` | `npm.cmd run typecheck:web`; `npm.cmd run build:web`; live production checks on port 3002 for overview/category/overflow/detail/unknown routes; API-stop error-boundary check | Loading, empty, error, 404 UI payload, responsive CSS, image fallback, overflow protection, focus styles, and route metadata verified; streaming not-found responses retain HTTP 200 headers (see residual) |
| Phase 8 | Testing | `VERIFIED` | 2026-07-22 | 2026-07-22 | `npm.cmd run test:api`; `typecheck:web`; `typecheck:api`; `build:web`; `build:api`; Compose/Prisma/API/Redis/frontend matrix | 89/95 checklist rows passed before Phase 9; four environment/quality rows remain intentionally N/A after Phase 9 evidence |
| Phase 9 | Polish and handoff | `VERIFIED` | 2026-07-22 | 2026-07-22 | `npm.cmd run test:api`; `npm.cmd run typecheck`; `npm.cmd run build:web`; `npm.cmd run build:api`; production API start/health; clean-copy README flow; secret scan; Chrome console spot-check | README is clone-to-run; ENV-006 closed; 91/95 checklist rows passed; no deploy/push/commit |

## Task log

| Phase | Task | Status | Started date | Completed date | Files changed | Verification | Notes |
|---|---|---|---|---|---|---|---|
| 0 | Check Node/npm or pnpm, Docker, Git | `VERIFIED` | 2026-07-21 | 2026-07-22 |  | Node v24.15.0, npm.cmd 11.12.1, Docker 29.4.0, Compose v5.1.2; `git rev-parse` true | Use `npm.cmd` on PowerShell (ENV-001) |
| 0 | Read and confirm spec/architecture | `VERIFIED` | 2026-07-21 | 2026-07-21 | `md/01`…`05`, `role/AI-NEWS-TEAM-LEAD.md` | Cross-file contradiction audit completed | Redis cache-only, `/api` prefix, Overview UI-only |
| 0 | Restore / verify valid Git baseline | `VERIFIED` | 2026-07-22 | 2026-07-22 | `.git` | Codex re-test #2: `git rev-parse --is-inside-work-tree` → true; `git status --short` OK; `git check-ignore -v .env`; `.env` not tracked | Do not delete/re-init `.git` |
| 1 | Create workspace and frontend/backend skeleton | `VERIFIED` | 2026-07-21 | 2026-07-21 | `package.json`, `apps/web/**`, `apps/api/**` | install + typecheck + build; `/ban-tin` 200 | Minimal placeholder routes |
| 1 | Configure Fastify adapter and health endpoint | `VERIFIED` | 2026-07-21 | 2026-07-21 | `apps/api/src/main.ts`, `apps/api/src/health/**` | FastifyAdapter + `/api/health` multi-dep | |
| 1 | Create `.gitignore` and `.env.example` | `VERIFIED` | 2026-07-21 | 2026-07-22 | `.gitignore`, `.env.example` | Patterns present; Codex #2: `.env` ignored and untracked | |
| 2 | Create Docker Compose for PostgreSQL/Redis | `VERIFIED` | 2026-07-21 | 2026-07-21 | `docker-compose.yml`, `.env.example`, `.env` | compose healthy | Host port 5434 (D-013) |
| 2 | Initialize Prisma and Prisma service | `VERIFIED` | 2026-07-21 | 2026-07-21 | `prisma/schema.prisma`, `apps/api/src/prisma/*` | validate + generate (Client v6.4.0); module wired | Full models counted under Phase 3 |
| 2 | Multi-dependency health check & Redis connection probe | `VERIFIED` | 2026-07-21 | 2026-07-21 | `apps/api/src/health/*` | ok / degraded redis / degraded postgres probes | API stays alive |
| 2 | Align README with host port + Windows npm notes | `VERIFIED` | 2026-07-22 | 2026-07-22 | `README.md` | Host 5434 + `npm.cmd`/`npx.cmd` note; Codex #2 closed F-001/F-004 | |
| 3 | Create Category/Article models | `VERIFIED` | 2026-07-21 | 2026-07-22 | `prisma/schema.prisma` | `prisma validate` passed; live data checks passed without model rewrites | Fields/indexes match Phase 3 plan; no admin tables; D-014 preserved |
| 3 | Create migration | `VERIFIED` | 2026-07-22 | 2026-07-22 | `prisma/migrations/20260722053000_init_news/migration.sql`, `migration_lock.toml` | `npx.cmd prisma migrate deploy` applied `20260722053000_init_news` successfully | Migration applied to local compose Postgres on host port 5434 |
| 3 | Seed six Categories and sample articles | `VERIFIED` | 2026-07-22 | 2026-07-22 | `prisma/seed.ts`, `package.json` (prisma.seed + tsx + db:* scripts) | Seed completed: 6 categories, 30 total articles, 29 published, 9 featured published, 1 unpublished; per-category published 12/4/3/4/3/3 | Idempotent upsert by slug; no `overview`/`toan-canh` category |
| 3 | Create local SVG seed placeholders | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/web/public/images/news/placeholder-{01,02,03,default}.svg` | Independent filesystem check passed for all 4 database image paths | Paths match seed (`/images/news/*.svg`) |
| 4 | Implement `GET /api/categories` | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/api/src/categories/**` | Live HTTP: 200, 6 active categories, articleCount 12/4/3/4/3/3 | |
| 4 | Implement `GET /api/articles` | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/api/src/articles/**` | Live HTTP: overview 29 published, category filter 12, featured 9, pagination metadata and overflow behavior pass | |
| 4 | Implement `GET /api/articles/:slug` | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/api/src/articles/**` | Live HTTP: valid detail 200 with 5 related; unknown and unpublished slugs 404 | |
| 4 | DTO, CORS, and error handling | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/api/src/articles/articles-query.dto.ts`, `apps/api/src/common/api-exception.filter.ts`, `apps/api/src/main.ts` | Live HTTP: invalid page/limit 400; all error bodies include `statusCode`, `message`, and `code`; CORS origin present | |
| 4 | Add `sanitize-html` before article response/cache | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/api/src/content/**`, `apps/api/package.json` | Focused sanitizer test passed; detail response contains no script/event-handler markup | |
| 5 | Cache categories | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/api/src/cache/**`, `apps/api/src/categories/categories.service.ts` | Live categories MISS→HIT, key `news:categories`, TTL ~1775s; Redis-down categories HTTP 200 | 30-minute TTL |
| 5 | Cache article list/featured | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/api/src/cache/**`, `apps/api/src/articles/articles.service.ts` | Live overview/featured MISS→HIT; distinct category/page keys; list TTL ~575s; Redis-down list HTTP 200 | 10-minute TTL |
| 5 | Cache detail and Redis fallback | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/api/src/cache/**`, `apps/api/src/articles/articles.service.ts` | Live detail MISS→HIT; sanitized Redis payload; TTL ~817s; Redis-down detail HTTP 200; invalid/unknown statuses unchanged | 15-minute TTL |
| 6 | Create Header/Footer layout | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/web/components/layout/**`, `apps/web/app/layout.tsx` | Live routes render shared header/footer with HTTP 200 | |
| 6 | Create `/ban-tin` page | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/web/app/ban-tin/page.tsx`, `apps/web/components/news/**` | Live overview HTTP 200; seven tab labels; featured/latest API data present | Overview is UI-only aggregate; no fake Category row |
| 6 | Create category page and pagination | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/web/app/ban-tin/chuyen-muc/[slug]/page.tsx`, `apps/web/components/news/Pagination.tsx` | Valid category HTTP 200; page 1 articles 01–10; page 2 articles 11–12; bad category renders custom not-found UI with the known streamed HTTP 200 header | |
| 6 | Create detail page and related articles | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/web/app/ban-tin/[articleSlug]/page.tsx`, `apps/web/components/news/ArticleContent.tsx`, `RelatedNews.tsx` | Valid detail HTTP 200 with metadata/content/related links; bad article renders custom not-found UI with the known streamed HTTP 200 header | Uses backend-sanitized `contentHtml` only |
| 6 | Enforce Server/Client Component boundaries and fetch policy | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/web/lib/api-client.ts`, `apps/web/app/**`, `apps/web/components/news/NewsImage.tsx` | Typecheck passed; route pages have no `use client`; fetch uses `cache: 'no-store'`; only image fallback is client-side | |
| 6 | Implement CSS Modules and global CSS | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/web/app/globals.css`, `apps/web/**/*.module.css` | Production web build passed; no UI framework added | Responsive polish matrix remains Phase 7 |
| 7 | Loading/empty/error/404 states | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/web/app/ban-tin/loading.tsx`, `apps/web/app/ban-tin/error.tsx`, `apps/web/components/news/NewsStates.tsx`, `apps/web/app/not-found.tsx` | Headless Chrome/CDP on port 3002: skeleton stream; overflow empty message/link; live API-stop error UI with retry/home/Header/Footer; both unknown routes rendered custom 404/noindex DOM | Segment loading/error boundaries preserve root Header/Footer; Next streaming sends 200 headers before dynamic notFound resolves |
| 7 | Responsive and broken-image fallback | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/web/app/globals.css`, `apps/web/components/news/*.module.css`, `NewsImage.tsx` | Headless Chrome screenshots + exact CDP metrics at 375/768/1440; live invalid-image injection recovered to default SVG while retaining alt/dimensions; long-content detail 200 | Document scroll width equaled client width at all three viewports; 375px tabs overflow internally; cards clamp/wrap; content media is bounded |
| 7 | Basic SEO metadata | `VERIFIED` | 2026-07-22 | 2026-07-22 | `apps/web/app/layout.tsx`, `apps/web/app/ban-tin/**/page.tsx`, `md/04-TEST-CHECKLIST.md` | Live production HTML title/description/OG checks for overview/category/detail; one-H1 count | Route titles/descriptions differ appropriately and basic Open Graph fields are present |
| 8 | Test API/database | `VERIFIED` | 2026-07-22 | 2026-07-22 | `md/04-TEST-CHECKLIST.md` | Compose/Prisma deploy+seed/counts; live health/categories/list/detail/400/404/overflow/unpublished matrix passed; sanitizer and relation checks passed | Empty fresh DB was not reset per approval; deploy+idempotent seed evidence recorded |
| 8 | Test Redis hit/miss/fallback | `VERIFIED` | 2026-07-22 | 2026-07-22 | `md/04-TEST-CHECKLIST.md` | Scoped `news:*` delete; categories/list/detail MISS→HIT; keys and TTLs observed; Redis stop returned API 200; Redis restarted healthy | Cache-only behavior preserved |
| 8 | Test frontend/routing/responsive | `VERIFIED` | 2026-07-22 | 2026-07-22 | `md/04-TEST-CHECKLIST.md` | Curl spot-check of overview/category/page2/detail/bad slugs/page999; server-only API client/no-store/CSS Module checks; Phase 7 responsive/state evidence retained | Next streaming dynamic not-found HTTP 200 residual remains documented |
| 8 | Lint, typecheck, test, build | `VERIFIED` | 2026-07-22 | 2026-07-22 | `package.json`, `README.md`, `md/04-TEST-CHECKLIST.md` | Added minimal root `test:api` for all existing recursive node:test specs; 8 pass; web/api typechecks and production builds exited 0; `git diff --check` and lightweight scan passed | Lint is N/A because no lint script exists; no framework added |
| 9 | Finish README and scan secrets | `VERIFIED` | 2026-07-22 | 2026-07-22 | `README.md`, `apps/api/package.json`, `apps/web/app/not-found.tsx`, `md/04-TEST-CHECKLIST.md`, `md/05-PROGRESS.md` | Secret scan over 92 candidate tracked/untracked non-ignored files: 0 private-key/token hits; `.env` ignored and untracked; six env names match code; `git diff --check` exited 0 | `.env.example` and `.gitignore` were reviewed and already satisfied the required names/ignore patterns, so they have no Phase 9 diff. README includes clone, Compose, env, Windows `.cmd`, migrate, seed, run, test, typecheck, build, route demo, and streaming not-found behavior; no debug leftovers found |
| 9 | Re-run from a clean environment | `VERIFIED` | 2026-07-22 | 2026-07-22 | Temporary artifact-free copy of the workspace; no project files retained | `npm.cmd ci` (lockfile-enforced equivalent of the README's `npm install` step); Compose; Prisma validate/generate/migrate deploy/seed; 8 API tests; typechecks; web/API builds; production API/web smoke; overview/category/detail HTTP 200; unknown route rendered 404/noindex; Chrome console spot-check had 0 `CONSOLE`/`SEVERE` lines | Temporary verification copies and processes were removed; existing Compose services and user processes were left intact. `npm ci` reported 3 existing audit advisories; no dependency upgrade was attempted in Phase 9. |

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
| D-014 | Keep pre-landed Category/Article Prisma models; do not rewrite before migrate/seed | Models match Phase 3 field/index requirements; avoid duplicate work (Codex F-002) | 2026-07-22 |
| D-015 | Phase 0–2 gate closed after Codex re-test #2 GO; residual env notes are non-blocking | Unblocks Phase 3 migrate/seed/SVG without re-auditing Phase 1–2 | 2026-07-22 |
| D-016 | Hand-author initial migration SQL from existing schema (`init_news`) instead of `prisma migrate dev` interactive create | Shell unavailable in Grok Build session; SQL matches schema fields/indexes/FK; apply via `migrate deploy` | 2026-07-22 |

## Known issues

| ID | Description | Impact | How to reproduce | Status | Owner |
|---|---|---|---|---|---|
| ENV-001 | PowerShell blocks `npm.ps1`; use `npm.cmd` / `npx.cmd` | Direct `npm` fails in PowerShell; project still builds with `.cmd` | Run `npm --version` in PowerShell | OPEN (documented in README) | Developer |
| ENV-002 | Dependencies not installed (historical) | Was blocking typecheck | Pre-install typecheck | CLOSED | Developer |
| ENV-003 | Docker Compose user-config path access-denied warning; commands still succeed | Noise / rare env-specific compose friction | `docker compose config --quiet` | MONITOR | Developer |
| ENV-004 | Git previously reported invalid/empty | Was blocking status/diff/secret scan | `git rev-parse --is-inside-work-tree` | CLOSED | Developer |
| DOC-001 | README Postgres host port was 5432 vs live 5434 | Wrong host Postgres | Compare README vs compose | CLOSED | Developer |
| DOC-002 | Progress still said ENV-004 OPEN after CLI fixed (Codex F-005) | Tracker understated Git health | Compare progress vs `git status` | CLOSED | Lead |
| ENV-005 | Grok Build CLI shell tool fails: `terminal/create` Method not implemented | Cannot run docker/npm/prisma from agent; Phase 3 live verify blocked | Any `run_terminal_command` in this session | OPEN | Tooling |
| ENV-006 | API production `start` script points at `dist/main.js`, while Nest build emits `dist/src/main.js` | Fixed by targeting the emitted entry point | Run `npm.cmd run build:api` then `npm.cmd --workspace apps/api run start` | CLOSED 2026-07-22; isolated `/api/health` returned HTTP 200 on port 4100 | Developer |

## Technical debt

No technical debt yet. Do not list intentional out-of-scope features here; put those in the spec or decision log.

| ID | Debt | Why accepted | Follow-up | Priority | Status |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## Codex audits (2026-07-22)

### Re-test #1 (historical)
- Verdict: `PASS_WITH_FOLLOWUPS` + **NO-GO** Phase 3
- Open then: F-001 README port, F-002 tracker vs models, F-003 Git, F-004 npm.cmd note

### Re-test #2 (authoritative for gate)
- Verdict: `PASS_WITH_FOLLOWUPS` + **GO** Phase 3 remaining work
- Closed: F-001, F-002, F-003 (CLI), F-004
- Residual then: F-005 stale ENV-004 text in progress → closed this cleanup
- Evidence highlights: Git works; `.env` ignored/untracked; ports 5434 aligned; typecheck/build/health ok/degraded probes pass

### Phase 9 verification (2026-07-22)
- ENV-006 reproduced as `MODULE_NOT_FOUND` for `apps/api/dist/main.js`; after the one-line script fix, `apps/api/dist/src/main.js` started successfully and `/api/health` returned HTTP 200 on isolated port 4100.
- Actual workspace gates passed: `npm.cmd run test:api` (8 pass, 0 fail), `npm.cmd run typecheck` (web + API), `npm.cmd run build:web`, and `npm.cmd run build:api`.
- The clean-copy README flow passed `npm.cmd ci`, Compose health, Prisma validate/generate/migrate deploy/seed, tests, typechecks, builds, production API/web startup, and the three route smoke checks. The dynamic not-found residual remains HTTP 200 headers with rendered 404/noindex UI and is documented in README.
- Secret/ignore review found 0 private-key/token hits across 92 non-ignored candidate files; `.env` is ignored and untracked; `.env.example` has exactly the six names used by the app. No debug console spam or debugger/TODO/FIXME leftovers were found in `apps/**`.
- Headless Chrome checked overview/category/detail with zero `CONSOLE`/`SEVERE` lines. Lint remains intentionally N/A because there is no existing lint script and no framework was added solely for Phase 9.
- `apps/web/tsconfig.tsbuildinfo` is a pre-existing tracked generated-artifact modification from the Phase 0–8 worktree, not a Phase 9 source edit; it is left untouched to avoid discarding the human's prior work. Review or clean it separately before staging a submission if desired.

## Gate status (lead)

| Gate | Status |
|---|---|
| Phase 0 | `VERIFIED` |
| Phase 1 | `VERIFIED` |
| Phase 2 | `VERIFIED` |
| Phase 8 | `VERIFIED` |
| Phase 9 | `VERIFIED` |
| Ready for handoff | **YES** |
| Non-blocking residuals | ENV-001 (`npm.cmd`/`npx.cmd` on PowerShell), ENV-003 (Docker config warning), ENV-005 (historical Grok CLI limitation); fresh empty-DB, persistent-volume, and wrong-credential destructive checks intentionally not run; lint is intentionally N/A; Next streaming dynamic not-found responses use HTTP 200 headers while rendering the 404/noindex UI |

## Next action

1. Phase 9 is **VERIFIED** with the production-start fix, clone-to-run README, secret/ignore review, clean-copy smoke, console spot-check, and fresh workspace gates recorded above.
2. Handoff is ready. Keep the worktree uncommitted until the human/Lead explicitly chooses the commit or submission workflow.
3. No deployment, push, force-push, PR, or destructive database reset was performed.

## Update rules

- Move a task to `DONE` only after the work is finished.
- Move to `VERIFIED` only when a verification command and result are recorded in the Verification column.
- Do not mark a phase complete while required tasks remain unfinished.
- Use dates in `YYYY-MM-DD` format.
