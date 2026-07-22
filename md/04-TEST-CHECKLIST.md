# Test Checklist — MyFuture News Module

## How to use

- Every item starts as `[ ]`.
- Mark `[x]` only after running the verification method and getting the expected result.
- On failure, leave `[ ]` and record the cause/fix in the Notes column.
- Commands below use the chosen package manager; if the repo uses pnpm, replace `npm` with `pnpm` as needed.

## 1. Environment

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| Node.js | Run `node --version` | Version meets Next.js/NestJS requirements | [ ] | |
| npm or pnpm | Run `npm --version` or `pnpm --version` | Package manager works | [ ] | |
| Git | Run `git status --short` | Correct repository; existing changes not lost | [ ] | |
| Docker | Run `docker --version` | Docker CLI works | [ ] | |
| Docker Compose | Run `docker compose version` | Compose plugin works | [ ] | |
| Environment | Compare `.env` with `.env.example` | Required vars present; no secrets committed | [ ] | |
| Server-only API URL | Inspect `.env.example` and frontend API client | Uses `API_BASE_URL`; no unnecessary `NEXT_PUBLIC_API_BASE_URL` exposure | [ ] | |

## 2. Docker, PostgreSQL, and Redis

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| PostgreSQL starts | `docker compose up -d postgres` | Container running/healthy | [ ] | |
| Redis starts | `docker compose up -d redis` | Container running/healthy | [ ] | |
| Full compose | `docker compose up -d` | Both services run | [ ] | |
| PostgreSQL health | Check `docker compose ps` or health API | PostgreSQL reported healthy | [ ] | |
| Redis health | `redis-cli ping` in container or health API | Returns `PONG`/healthy | [ ] | |
| Persistent volume | Restart Compose then inspect database | Data persists unless deliberately reset | [ ] | |
| Wrong credentials | Intentionally use bad credentials | Clear connection error; no secret leakage | [ ] | |

## 3. Prisma migration and seed

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| Schema validate | Run Prisma validate | No schema errors | [ ] | |
| Empty database | Create a new database or reset per README | Database is clean | [ ] | |
| Migration | Run the migrate command in README | Migration completes | [ ] | |
| Generate client | Run Prisma generate if needed | Prisma Client is generated | [ ] | |
| Seed | Run seed | Exactly six Categories and sample Articles | [ ] | |
| No Overview Category | Query Category table | No name/slug “Toàn cảnh” / “Overview” row | [ ] | |
| Unique slug | Re-seed or insert a duplicate slug | Database/service rejects correctly | [ ] | |
| Relations | Query Articles with Category | Each Article has a valid Category | [ ] | |
| Pagination data | Count Articles for a sample Category | At least one Category has more than 10 articles | [ ] | |
| Local seed images | Inspect seeded image paths and open each asset | Paths use `/images/news/*.svg`; files exist under Next.js `public` and need no external network | [ ] | |
| Default image | Use an article without a dedicated image | `/images/news/placeholder-default.svg` is used | [ ] | |

## 4. Category API

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| List categories | `GET /api/categories` | HTTP 200, six Categories | [ ] | |
| Category order | Inspect response multiple times | Stable order by `sortOrder` | [ ] | |
| Article count | Inspect `articleCount` if present | Count matches `isPublished` query | [ ] | |
| Redis category cache | Call endpoint twice and inspect logs | First miss, second hit | [ ] | |
| Redis down | Stop Redis then call endpoint | API still returns from PostgreSQL | [ ] | |

## 5. Article list, filter, and pagination API

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| Overview | `GET /api/articles?page=1&limit=10` | Returns articles from all Categories | [ ] | |
| Category filter | `GET /api/articles?category=phap-ly-du-an` | Only that Category’s articles | [ ] | |
| Sort | Compare `publishedAt` across items | Newest first by default | [ ] | |
| Featured | `GET /api/articles?featured=true` | Only `isFeatured=true` articles | [ ] | |
| First page | Call `page=1` | `meta.page=1`, item count ≤ limit | [ ] | |
| Middle page | Call another valid page | Items do not incorrectly overlap previous page | [ ] | |
| Last page | Call `page=totalPages` | `hasNextPage=false` | [ ] | |
| Page overflow | Call page greater than totalPages | HTTP 200, empty `data`, valid metadata; never 500 | [ ] | |
| Default limit | Omit `limit` | Uses default limit 10 | [ ] | |
| Invalid limit | `limit=0`, negative, or too large | HTTP 400 | [ ] | |
| Invalid page | `page=0`, negative, or non-numeric | HTTP 400 | [ ] | |
| Bad category | Use unknown slug | Clear HTTP 404 | [ ] | |
| List cache | Call the same query twice | Cache key includes category/page/limit/filter; second is hit | [ ] | |
| No cache bleed | Call two Categories or two pages | Each response matches its query | [ ] | |

## 6. Article detail API

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| Valid detail | `GET /api/articles/:slug` with a seeded slug | HTTP 200 with title/excerpt/content/category | [ ] | |
| Metadata | Check `publishedAt`, `viewCount`, `readingTime` | Types and values match contract | [ ] | |
| Source | Use an article that has source fields | `sourceName`/`sourceUrl` present as expected | [ ] | |
| Related articles | Inspect related payload | Related items exist and do not self-link | [ ] | |
| Unsafe content | Seed script/event-handler markup in test only | Script does not execute when content is rendered | [ ] | |
| Sanitizer package | Inspect backend dependencies and sanitizer service | Backend uses `sanitize-html`, not an unspecified/custom regex sanitizer | [ ] | |
| Sanitization before cache | Clear cache, request unsafe test article, inspect response/cache | Unsafe markup is removed before the value is written to Redis | [ ] | |
| Detail cache | Call same slug twice | First miss, second hit | [ ] | |
| Bad slug | Use unknown slug | HTTP 404 | [ ] | |
| Unpublished slug | Use `isPublished=false` if seeded | Not exposed as a public article | [ ] | |
| Redis down | Stop Redis then call detail | API falls back to PostgreSQL | [ ] | |

## 7. Frontend routing and data

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| Overview page | Open `/ban-tin` | Renders title, seven tabs, featured, and list | [ ] | |
| Server Component pages | Inspect the three route page files and server requests | Page files have no unnecessary `use client`; initial data is fetched on the server | [ ] | |
| Client boundaries | Inspect Copy link/retry/mobile-menu components | Only browser-dependent interactions use `use client` | [ ] | |
| Cache ownership | Inspect frontend fetch options and repeat a request | Next.js fetch policy is explicit; backend Redis remains the documented application cache | [ ] | |
| Overview tab | Click first tab | URL and list use aggregate filter | [ ] | |
| Category tab | Click each tab | Navigates to `/ban-tin/chuyen-muc/[slug]` | [ ] | |
| Category route | Open category route directly | Breadcrumb, title, and list are correct | [ ] | |
| Category refresh | Refresh category route | Slug/page preserved; no hydration error | [ ] | |
| Pagination URL | Click page 2 | Page query updates and list changes | [ ] | |
| Card navigation | Click title/card | Opens `/ban-tin/[articleSlug]` | [ ] | |
| Detail refresh | Refresh detail route | Content still loads from API | [ ] | |
| Category 404 | Open bad Category slug | Clear not-found UI | [ ] | |
| Article 404 | Open bad Article slug | Clear not-found UI | [ ] | |

## 8. UI states and responsive

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| Loading | Throttle network or delay API | Skeleton/loading shown; no blank screen | [ ] | |
| Empty | Use a temporary empty-category fixture or isolated test database state | Empty state with way back | [ ] | |
| API error | Stop backend or force 500 | Error state; layout does not break | [ ] | |
| Broken image | Use invalid image URL | Fallback image; no large layout shift | [ ] | |
| Long content | Open long article | No horizontal overflow; headings/images readable | [ ] | |
| Long title | Use long title on card | Text clamps/wraps; card does not break | [ ] | |
| Mobile | Viewport ~375px | Tabs scroll; cards readable; no overflow | [ ] | |
| Tablet | Viewport ~768px | Reasonable grid/sidebar | [ ] | |
| Desktop | Viewport ~1440px | Main layout and sidebar balanced | [ ] | |
| Footer | Scroll to bottom | Footer stable; links do not throw JS errors | [ ] | |
| CSS strategy | Inspect dependencies and styles | Uses `globals.css` plus CSS Modules; no Tailwind/UI framework added | [ ] | |

## 9. Basic SEO and accessibility

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| Page title | Inspect `<title>` per route | Title changes by page/article | [ ] | |
| Description | Inspect metadata | Suitable description present | [ ] | |
| Open Graph | Inspect source or DevTools | Basic title/image/url if implemented | [ ] | |
| Heading | Check H1/H2 | One sensible H1 per page; heading levels orderly | [ ] | |
| Alt text | Inspect images | Content images have alt; decorative images use empty alt | [ ] | |
| Keyboard | Use Tab/Enter | Tabs, cards, pagination, and copy-link are usable | [ ] | |

## 10. Build, code quality, and handoff

| Check | How to verify | Expected result | Status | Notes |
|---|---|---|---|---|
| Frontend typecheck | Run web typecheck/build script | No TypeScript errors | [ ] | |
| Backend typecheck | Run api typecheck/build script | No TypeScript errors | [ ] | |
| Lint | Run workspace lint | No blocking lint errors | [ ] | |
| Unit/integration tests | Run test script | Written tests pass | [ ] | |
| Production build | Build frontend/backend | Builds complete | [ ] | |
| README | Follow README in a clean environment | Another person can run from zero | [ ] | |
| `.env.example` | Compare with code | No missing vars; no secrets | [ ] | |
| Console | Open DevTools on main flows | No serious console errors | [ ] | |
| Git diff | Run `git diff --check` and review | No whitespace errors; no out-of-scope files | [ ] | |
| Secrets scan | Search for passwords/tokens/connection strings | No real secrets in Git | [ ] | |

## 11. Summary results

- Total items: fill after checklist stabilizes.
- Passed: fill after testing.
- Failed: fill after testing.
- Blocked: record cause and dependency/person.
- Test date:
- Tester:
- Commit/revision:
- Environment:
