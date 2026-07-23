# Test Checklist — MyFuture News Module

## How to use

- Every item starts as `[ ]`.
- Mark `[x]` only after running the verification method and getting the expected result.
- On failure, leave `[ ]` and record the cause/fix in the Notes column.
- Commands below use the chosen package manager; if the repo uses pnpm, replace `npm` with `pnpm` as needed.

## 1. Environment

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| Node.js | Run `node --version` | Version meets Next.js/NestJS requirements | [x] | Phase 8 2026-07-22: `node --version` -> v24.15.0. |
| npm or pnpm | Run `npm --version` or `pnpm --version` | Package manager works | [x] | Phase 8 2026-07-22: `npm.cmd --version` -> 11.12.1 (PowerShell uses the `.cmd` shim per ENV-001). |
| Git | Run `git status --short` | Correct repository; existing changes not lost | [x] | Phase 8 2026-07-22: `git status --short` ran successfully and showed the pre-existing Phase 0-7 worktree changes; no reset or checkout used. |
| Docker | Run `docker --version` | Docker CLI works | [x] | Phase 8 2026-07-22: Docker 29.4.0; Docker config access warning is the documented ENV-003 residual. |
| Docker Compose | Run `docker compose version` | Compose plugin works | [x] | Phase 8 2026-07-22: Docker Compose v5.1.2. |
| Environment | Compare `.env` with `.env.example` | Required vars present; no secrets committed | [x] | Phase 8 2026-07-22: both files contain the same six variable names; `.env` is ignored by `.gitignore` and `git ls-files .env` returned no path. |
| Server-only API URL | Inspect `.env.example` and frontend API client | Uses `API_BASE_URL`; no unnecessary `NEXT_PUBLIC_API_BASE_URL` exposure | [x] | Phase 8 2026-07-22: `apps/frontend/lib/api-client.ts` reads `process.env.API_BASE_URL`; source scan found no `NEXT_PUBLIC_API_BASE_URL`; requests use `cache: 'no-store'`. |

## 2. Docker, PostgreSQL, and Redis

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| PostgreSQL starts | `docker compose -f infrastructure/docker-compose.yml up -d postgres` | Container running/healthy | [x] | Phase 8 2026-07-22: `docker compose -f infrastructure/docker-compose.yml up -d` left `myfuture-news-test-postgres-1` Up (healthy), mapped host port 5434. |
| Redis starts | `docker compose -f infrastructure/docker-compose.yml up -d redis` | Container running/healthy | [x] | Phase 8 2026-07-22: `docker compose -f infrastructure/docker-compose.yml up -d` left Redis Up (healthy), mapped host port 6379. |
| Full compose | `docker compose -f infrastructure/docker-compose.yml up -d` | Both services run | [x] | Phase 8 2026-07-22: `docker compose -f infrastructure/docker-compose.yml up -d` succeeded; `docker compose -f infrastructure/docker-compose.yml ps` showed both services healthy. |
| PostgreSQL health | Check `docker compose -f infrastructure/docker-compose.yml ps` or health API | PostgreSQL reported healthy | [x] | Phase 8 2026-07-22: Compose health `healthy`; `/api/health` reported `postgres=up`. |
| Redis health | `redis-cli ping` in container or health API | Returns `PONG`/healthy | [x] | Phase 8 2026-07-22: Compose health `healthy`; `/api/health` reported `redis=up`. |
| Persistent volume | Restart Compose then inspect database | Data persists unless deliberately reset | [ ] | Not independently re-tested in Phase 8; no volume reset was authorized. Migrate deploy and idempotent seed preserved the existing dataset. |
| Wrong credentials | Intentionally use bad credentials | Clear connection error; no secret leakage | [ ] | Not exercised because it would require changing connection configuration; no credential mutation was authorized. |

## 3. Prisma migration and seed

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| Schema validate | Run Prisma validate | No schema errors | [x] | Phase 8 2026-07-22: `npx.cmd prisma validate` passed. |
| Empty database | Create a new database or reset per README | Database is clean | [ ] | Honest limitation: no fresh DB/volume or reset was run per the approved no-destructive-change constraint. `migrate deploy` on the current DB and a second idempotent seed both passed. |
| Migration | Run the migrate command in README | Migration completes | [x] | Phase 8 2026-07-22: `npx.cmd prisma migrate deploy` reported the single migration applied/no pending migrations. |
| Generate client | Run Prisma generate if needed | Prisma Client is generated | [x] | Phase 8 2026-07-22: `npx.cmd prisma generate` generated Prisma Client v6.4.0. |
| Seed | Run seed | Exactly six Categories and sample Articles | [x] | Phase 8 2026-07-22: `npx.cmd prisma db seed` passed twice; each summary reported 6 categories, 30 articles, 29 published, 9 featured published, 1 unpublished. |
| No Overview Category | Query Category table | No name/slug “Toàn cảnh” / “Overview” row | [x] | Phase 8 read-only SQL count: `categories=6`, `overview_categories=0`. |
| Unique slug | Re-seed or insert a duplicate slug | Database/service rejects correctly | [x] | Phase 8 2026-07-22: transaction-scoped duplicate Category slug insert failed with `Category_slug_key`; rollback completed and follow-up count was 0. Second idempotent seed also kept 30 articles/6 categories. |
| Relations | Query Articles with Category | Each Article has a valid Category | [x] | Phase 8 read-only SQL returned `orphan_articles=0`; API list items included category slugs. |
| Pagination data | Count Articles for a sample Category | At least one Category has more than 10 articles | [x] | Phase 8 SQL: published counts by category were 12/4/3/4/3/3; maximum published category count 12. |
| Local seed images | Inspect seeded image paths and open each asset | Paths use `/images/news/*.svg`; files exist under Next.js `public` and need no external network | [x] | Phase 8 SQL returned four `/images/news/*.svg` paths and `non_local_image_paths=0`; all four SVG files exist under `apps/frontend/public/images/news/`. |
| Default image | Use an article without a dedicated image | `/images/news/placeholder-default.svg` is used | [x] | Phase 8 SQL found 7 articles using `/images/news/placeholder-default.svg`; asset exists. |

## 4. Category API

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| List categories | `GET /api/categories` | HTTP 200, six Categories | [x] | Phase 8 2026-07-22: live HTTP 200; six ordered rows with slugs `phap-ly-du-an`, `quy-hoach-ha-tang`, `lai-suat-tai-chinh`, `thi-truong-gia-ca`, `dau-tu-dong-tien`, `cho-thue`. |
| Category order | Inspect response multiple times | Stable order by `sortOrder` | [x] | Phase 8: repeated live calls returned the same six-slug order; Prisma query orders by `sortOrder`. |
| Article count | Inspect `articleCount` if present | Count matches `isPublished` query | [x] | Phase 8: API counts were 12/4/3/4/3/3, matching the read-only published SQL counts. |
| Redis category cache | Call endpoint twice and inspect logs | First miss, second hit | [x] | Phase 8: after deleting only `news:*`, categories returned 200 twice; API logs showed `MISS news:categories` then `HIT`; Redis TTL was 1798s. |
| Redis down | Stop Redis then call endpoint | API still returns from PostgreSQL | [x] | Phase 8: after `docker compose stop redis`, categories returned HTTP 200 with 6 rows; Redis was started again and healthy. |

## 5. Article list, filter, and pagination API

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| Overview | `GET /api/articles?page=1&limit=10` | Returns articles from all Categories | [x] | Phase 8: HTTP 200, 10 items, 29 published total, 3 pages; response included multiple category slugs. |
| Category filter | `GET /api/articles?category=phap-ly-du-an` | Only that Category’s articles | [x] | Phase 8: HTTP 200, total 12; page 1 slugs were all `phap-ly-du-an`. |
| Sort | Compare `publishedAt` across items | Newest first by default | [x] | Phase 8 default dates were descending (2026-07-19 through 2026-07-14); explicit `sort=oldest` returned ascending dates. |
| Featured | `GET /api/articles?featured=true` | Only `isFeatured=true` articles | [x] | Phase 8: HTTP 200 returned 9 items; total matched the SQL count of 9 published featured articles and the service filter. |
| First page | Call `page=1` | `meta.page=1`, item count ≤ limit | [x] | Phase 8: overview page 1 returned `meta.page=1`, 10 items with limit 10. |
| Middle page | Call another valid page | Items do not incorrectly overlap previous page | [x] | Phase 8: category page 1 contained articles 01–10; page 2 contained 11–12 with no overlap. |
| Last page | Call `page=totalPages` | `hasNextPage=false` | [x] | Phase 8: `phap-ly-du-an&page=2` returned 2 items and `hasNextPage=false`. |
| Page overflow | Call page greater than totalPages | HTTP 200, empty `data`, valid metadata; never 500 | [x] | Phase 8: overview page 999 returned HTTP 200, `items=0`, `totalPages=3`; category page 3 returned HTTP 200, `items=0`, `totalPages=2`. |
| Default limit | Omit `limit` | Uses default limit 10 | [x] | Phase 8: `GET /api/articles` returned 10 items and `meta.limit=10`. |
| Invalid limit | `limit=0`, negative, or too large | HTTP 400 | [x] | Phase 8: `limit=0` and `limit=51` returned HTTP 400 with `INVALID_REQUEST`. |
| Invalid page | `page=0`, negative, or non-numeric | HTTP 400 | [x] | Phase 8: `page=0` and `page=abc` returned HTTP 400 with `INVALID_REQUEST`. |
| Bad category | Use unknown slug | Clear HTTP 404 | [x] | Phase 8: `category=no-such` returned HTTP 404 with `CATEGORY_NOT_FOUND`. |
| List cache | Call the same query twice | Cache key includes category/page/limit/filter; second is hit | [x] | Phase 8: after deleting only `news:*`, overview returned 200 twice; logs showed MISS→HIT and key `news:articles:all:1:10:any:newest` had TTL 599s. |
| No cache bleed | Call two Categories or two pages | Each response matches its query | [x] | Phase 8: category page 1/2/overflow responses and Redis keys remained distinct (`phap-ly-du-an:1`, `:2`, `:3`). |

## 6. Article detail API

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| Valid detail | `GET /api/articles/:slug` with a seeded slug | HTTP 200 with title/excerpt/content/category | [x] | Phase 8: `phap-ly-du-an-bai-01` returned HTTP 200 with detail fields and category. |
| Metadata | Check `publishedAt`, `viewCount`, `readingTime` | Types and values match contract | [x] | Phase 8: valid detail returned ISO `publishedAt`, numeric `viewCount`, and `readingTime=3`. |
| Source | Use an article that has source fields | `sourceName`/`sourceUrl` present as expected | [x] | Phase 8: `phap-ly-du-an-bai-03` returned `sourceName` and `sourceUrl`. |
| Related articles | Inspect related payload | Related items exist and do not self-link | [x] | Phase 8: valid details returned 5 related articles; self-link count was 0. |
| Unsafe content | Seed script/event-handler markup in test only | Script does not execute when content is rendered | [x] | Phase 8: live detail content contained no `<script`, `onerror`, or `onclick`; focused sanitizer spec also passed. |
| Sanitizer package | Inspect backend dependencies and sanitizer service | Backend uses `sanitize-html`, not an unspecified/custom regex sanitizer | [x] | Phase 8: `sanitize-html` is in `apps/backend/package.json` and `ContentSanitizerService` imports it. |
| Sanitization before cache | Clear cache, request unsafe test article, inspect response/cache | Unsafe markup is removed before the value is written to Redis | [x] | Phase 8: after scoped `news:*` delete, detail MISS→HIT logs and Redis TTL (~899s) were observed; returned/cached content had no unsafe markup. |
| Detail cache | Call same slug twice | First miss, second hit | [x] | Phase 8: detail returned HTTP 200 twice; logs showed `MISS news:article:phap-ly-du-an-bai-01` then `HIT`; TTL 899s. |
| Bad slug | Use unknown slug | HTTP 404 | [x] | Phase 8: `/api/articles/no-such` returned HTTP 404 with `ARTICLE_NOT_FOUND`. |
| Unpublished slug | Use `isPublished=false` if seeded | Not exposed as a public article | [x] | Phase 8: `/api/articles/phap-ly-du-an-draft-unpublished` returned HTTP 404 with `ARTICLE_NOT_FOUND`. |
| Redis down | Stop Redis then call detail | API falls back to PostgreSQL | [x] | Phase 8: detail returned HTTP 200 while Redis was stopped; Redis was restarted and healthy afterward. |

## 7. Frontend routing and data

Phase 8 spot-check (2026-07-22) re-ran the main overview, category, page 2, detail, bad-slug, and page-999 overflow routes. The deeper loading/error/responsive evidence below remains the Phase 7 evidence for the unchanged UI implementation.

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| Overview page | Open `/ban-tin` | Renders title, seven tabs, featured, and list | [x] | Phase 8 `curl.exe`: HTTP 200, title `Bản tin thị trường`, seven-tab/category markers, featured/latest data present. |
| Server Component pages | Inspect the three route page files and server requests | Page files have no unnecessary `use client`; initial data is fetched on the server | [x] | Route pages are async Server Components; API calls are in `lib/api-client.ts` |
| Client boundaries | Inspect Copy link/retry/mobile-menu components | Only browser-dependent interactions use `use client` | [x] | `NewsImage.tsx` uses `use client` for image `onError`; `/ban-tin/error.tsx` uses it for `reset()`; route pages and other content components stay server-rendered |
| Cache ownership | Inspect frontend fetch options and repeat a request | Next.js fetch policy is explicit; backend Redis remains the documented application cache | [x] | All API client requests use `cache: 'no-store'` |
| Overview tab | Click first tab | URL and list use aggregate filter | [x] | Overview uses `/ban-tin` and requests articles without a category slug |
| Category tab | Click each tab | Navigates to `/ban-tin/chuyen-muc/[slug]` | [x] | Seven tab labels rendered; six API category links use the static `chuyen-muc` segment |
| Category route | Open category route directly | Breadcrumb, title, and list are correct | [x] | Phase 8 `curl.exe`: `/ban-tin/chuyen-muc/phap-ly-du-an` HTTP 200 with the category H1 and list data. |
| Category refresh | Refresh category route | Slug/page preserved; no hydration error | [x] | Phase 8 repeated direct GETs returned HTTP 200 with the same route title. |
| Pagination URL | Click page 2 | Page query updates and list changes | [x] | Phase 8: page 1 contained articles 01–10; `?page=2` rendered markers for articles 11–12. |
| Card navigation | Click title/card | Opens `/ban-tin/[articleSlug]` | [x] | `NewsCard` and featured cards generate article-slug links; live detail route returned HTTP 200 |
| Detail refresh | Refresh detail route | Content still loads from API | [x] | Phase 8 `curl.exe`: `/ban-tin/phap-ly-du-an-bai-01` HTTP 200 with article H1, metadata, content, and related data. |
| Category 404 | Open bad Category slug | Clear not-found UI | [x] | Phase 8 bad category route rendered custom `Không tìm thấy nội dung` UI; HTTP header remains 200 because of the known Next streaming `notFound()` residual. |
| Article 404 | Open bad Article slug | Clear not-found UI | [x] | Phase 8 bad article route rendered custom `Không tìm thấy nội dung` UI; HTTP header remains 200 because of the known Next streaming `notFound()` residual. |

## 8. UI states and responsive

Phase 8 route spot-check (2026-07-22) re-confirmed the overflow empty state; Phase 7's headless viewport/state evidence remains valid because no UI code changed in Phase 8.

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| Loading | Throttle network or delay API | Skeleton/loading shown; no blank screen | [x] | Production stream from `http://localhost:3002/ban-tin` contains the route skeleton with `aria-busy="true"`; `apps/frontend/app/ban-tin/loading.tsx` covers all News navigations |
| Empty | Use a temporary empty-category fixture or isolated test database state | Empty state with way back | [x] | `GET /ban-tin/chuyen-muc/phap-ly-du-an?page=999` returned HTTP 200 with the reusable empty-state link and no misleading overflow pagination; no database mutation |
| API error | Stop backend or force 500 | Error state; layout does not break | [x] | Stopped API port 4000 and hard-navigated with headless Chrome: DOM showed `Không thể tải bản tin`, retry button, overview link, Header, and Footer; API health returned 200 after restart |
| Broken image | Use invalid image URL | Fallback image; no large layout shift | [x] | Headless Chrome changed the primary image to an invalid URL; DOM recovered to `/images/news/placeholder-default.svg`, retained the article-title alt text, and kept its measured `739.828x300` wrapper dimensions |
| Long content | Open long article | No horizontal overflow; headings/images readable | [x] | Headless Chrome opened seeded long article `phap-ly-du-an-bai-04` at 375px: document `clientWidth=375`, `scrollWidth=375`, article body/cover both 347px; rich media/pre/table overflow rules are bounded |
| Long title | Use long title on card | Text clamps/wraps; card does not break | [x] | List and featured primary/secondary headings clamp to three lines and use `overflow-wrap: anywhere`; computed mobile list-card right edge 346px stayed within the 360px client area |
| Mobile | Viewport ~375px | Tabs scroll; cards readable; no overflow | [x] | Headless Chrome/CDP at exact 375px: `clientWidth=375`, `scrollWidth=375`; tabs are internally scrollable (`345/983` client/scroll width); shell bounds `14..361`; cards render in the mobile layout |
| Tablet | Viewport ~768px | Reasonable grid/sidebar | [x] | Headless Chrome/CDP: document `clientWidth=753`, `scrollWidth=753`; featured columns measured `440.953px 248.047px`; screenshot shows readable cards/list |
| Desktop | Viewport ~1440px | Main layout and sidebar balanced | [x] | Headless Chrome/CDP: document `clientWidth=1425`, `scrollWidth=1425`; 1180px shell bounds `122.5..1302.5`; featured columns measured `739.828px 416.156px` |
| Footer | Scroll to bottom | Footer stable; links do not throw JS errors | [x] | Live overview/category/detail responses include the shared Footer and `/ban-tin` link; Footer has a mobile column layout |
| CSS strategy | Inspect dependencies and styles | Uses `globals.css` plus CSS Modules; no Tailwind/UI framework added | [x] | `apps/frontend/package.json` has only Next/React dependencies; styles remain `globals.css` plus colocated `*.module.css` |

## 9. Basic SEO and accessibility

Phase 8 preserved the Phase 7 SEO/accessibility evidence; route HTML spot-checks still returned route-specific titles and one visible H1 on valid pages.

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| Page title | Inspect `<title>` per route | Title changes by page/article | [x] | Production checks: overview `Bản tin | MyFuture News`, category `Pháp lý dự án | Bản tin MyFuture`, and detail title includes the article title |
| Description | Inspect metadata | Suitable description present | [x] | Overview/category/detail responses include route-appropriate descriptions; fallback metadata remains present for failed/unknown slugs |
| Open Graph | Inspect source or DevTools | Basic title/image/url if implemented | [x] | Root/overview/category/detail metadata now includes `og:title`, `og:description`, and `og:type` |
| Heading | Check H1/H2 | One sensible H1 per page; heading levels orderly | [x] | Live overview/category/detail HTML each contained one H1; list, featured, related sections use H2 headings |
| Alt text | Inspect images | Content images have alt; decorative images use empty alt | [x] | All `NewsImage` call sites pass article titles as meaningful alt text; skeleton/decorative spans are `aria-hidden`; rich-content media is constrained |
| Keyboard | Use Tab/Enter | Tabs, cards, pagination, and copy-link are usable | [x] | Tabs/cards/pagination are native links, active tabs expose `aria-current="page"`, retry is a native button, and a two-tone white/brand-dark `:focus-visible` ring remains visible on light and brand surfaces |

## 10. Build, code quality, and handoff

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| Frontend typecheck | Run web typecheck/build script | No TypeScript errors | [x] | Phase 8 2026-07-22: `npm.cmd run typecheck:web` exited 0; `build:web` also completed. |
| Backend typecheck | Run api typecheck/build script | No TypeScript errors | [x] | Phase 8 2026-07-22: `npm.cmd run typecheck:api` exited 0; `build:api` also completed. |
| Lint | Run workspace lint | No blocking lint errors | [ ] | N/A by Phase 9 decision: no lint script exists, and this small take-home does not add an ESLint stack solely for checklist symmetry. README documents the decision; typecheck, tests, and production builds remain the automated quality gates. |
| Unit/integration tests | Run test script | Written tests pass | [x] | Phase 8 2026-07-22: after the red missing-script check, `npm.cmd run test:api` ran all existing recursive node:test specs: 8 pass, 0 fail. |
| Production build | Build frontend/backend | Builds complete | [x] | Phase 9 2026-07-22: `npm.cmd run build:web` and `npm.cmd run build:api` exited 0. After the API build, `npm.cmd --workspace apps/backend run start` launched `dist/src/main.js`; `/api/health` returned HTTP 200 on isolated port 4100. ENV-006 is closed. |
| README | Follow README in a clean environment | Another person can run from zero | [x] | Phase 9 2026-07-22: an artifact-free temporary copy followed clone-path steps with `npm.cmd ci`, Compose, `.env`, Prisma validate/generate, migrate deploy, seed, tests, typechecks, and builds; the three demo routes returned usable HTML. |
| `.env.example` | Compare with code | No missing vars; no secrets | [x] | Phase 9: six env names match code and `.env`; `.env` is ignored/untracked; candidate-file private-key/token scan found 0 hits. |
| Console | Open DevTools on main flows | No serious console errors | [x] | Phase 9 2026-07-22: installed Chrome headless spot-check of overview, category, and detail routes exited 0 with zero `CONSOLE`/`SEVERE` log lines. |
| Git diff | Run `git diff --check` and review | No whitespace errors; no out-of-scope files | [x] | Phase 9 final check: `git diff --check` exited 0; the allowed Phase 9 edits are README, API start script, not-found metadata, checklist, and progress while the pre-existing Phase 0-8 worktree was preserved. |
| Secrets scan | Search for passwords/tokens/connection strings | No real secrets in Git | [x] | Phase 9: `git ls-files .env` returned empty; ignored `.env` was excluded; 92 non-ignored candidate files produced 0 private-key/token hits. |

## 11. Summary results

- Total items: 95 checklist rows.
- Passed: 91 marked `[x]`.
- Failed: 0.
- Blocked/N/A: 4 marked `[ ]` with notes (fresh empty DB, persistent-volume re-test, wrong-credential exercise, and lint decision).
- Test date: 2026-07-22.
- Tester: Codex Phase 9.
- Commit/revision: `main` at `06743b9` plus the existing uncommitted Phase 0-8 worktree; Phase 9 changes are intentionally uncommitted.
- Environment: Windows PowerShell; Node v24.15.0; npm.cmd 11.12.1; Docker 29.4.0; Compose v5.1.2; PostgreSQL 16 Compose service on host 5434; Redis 7 Compose service on host 6379; API 4000; web 3000.
