# Project Specification — MyFuture News Module

## 1. Test context

The recruiter brief is: “Build the News screen with seven categories and an article detail page, using Next.js + React, NestJS + Fastify, PostgreSQL + Prisma, and Redis for cache/queue.” This specification turns that brief into a testable MVP. Redis is used for cache-aside read APIs; no queue is introduced because the brief defines no asynchronous business use case.

Scope is limited to the news module. Do not clone the entire MyFuture platform or implement other real-estate product features.

## 2. Project goals

- Recreate the news browsing flow: overview page, category filter, and article detail page.
- Show seven tabs in the UI while storing only six real categories in the database.
- Provide enough seed data to verify featured articles, category filters, pagination, and related articles.
- Run locally with Docker Compose for PostgreSQL and Redis.
- Expose clear APIs with validation, sensible HTTP errors, and fallback when Redis is unavailable.
- Include a README covering install, migration, seed, development, and production build.

## 3. Reference website

- Overview: <https://myfuture.vn/ban-tin.html>
- Sample category page: <https://myfuture.vn/ban-tin/phap-ly-du-an-c11726.html>
- Sample detail page: <https://myfuture.vn/ban-tin/MTEwNEZI.html>

Main observations on the live site:

- Header includes MyFuture branding, search/suggestions, and login; the system menu contains many features outside this test.
- The News area has a title, description, featured article, category tabs, and article list.
- Category pages have breadcrumb, article list, publish date, view count, and pagination.
- Detail pages have breadcrumb, featured badge, title, publish date, view count, reading time, keywords, rich-text content, images, source, share actions, previous/next article, and related articles.
- Footer includes copyright, policy links, and social links.

Article counts and stats on the live site change over time; demo data in this project must not hardcode a single snapshot number from the research date.

## 4. Required technology

- Frontend: Next.js + React + TypeScript.
- Backend: NestJS + Fastify + TypeScript.
- Database: PostgreSQL.
- ORM: Prisma.
- Cache: Redis, cache-aside for read APIs.
- Local infrastructure: Docker Compose for PostgreSQL and Redis.
- Styling: CSS Modules plus one global stylesheet; this is an implementation choice for a small assignment, not an additional recruiter requirement.
- Rendering/data fetching: Next.js Server Components by default for read-only pages; Client Components only for browser-only interactions. This is an implementation choice that keeps the read flow simple and SEO-friendly.
- HTML safety: backend sanitization with the `sanitize-html` package before article content is returned/rendered. This is a security decision for rich text.

Do not swap frameworks or add extra frameworks without a clear technical reason.

## 5. Technology limits

- No microservices.
- No Kubernetes.
- No BullMQ or other queue is required for the current read-only MVP. Add a queue only if the recruiter defines a concrete asynchronous use case.
- Do not use Redis as the primary database.
- Do not commit passwords, tokens, real connection strings, or `.env` files containing secrets.
- Do not embed full article bodies in the frontend as hardcoded data.
- Do not build an admin UI only to enter demo data; use Prisma seed.
- Do not use remote image URLs for required seed data; use local SVG placeholders committed under `apps/web/public/images/news/`.

## 5.1. Rendering, styling, images, and HTML policy

- `/ban-tin`, `/ban-tin/chuyen-muc/[slug]`, and `/ban-tin/[articleSlug]` are asynchronous Server Components that fetch read data from NestJS during the request.
- Category tabs and pagination use normal links/URL navigation so they do not require a client-side data store.
- A small Client Component is allowed for browser-only actions such as Copy link, retrying a failed request without navigation, or a mobile menu toggle.
- CSS uses Next.js built-in CSS Modules (`*.module.css`) and `globals.css`. No Tailwind, styled-components, Material UI, Chakra UI, or another UI framework is required.
- Seed images are local SVG files with stable paths, for example `/images/news/placeholder-01.svg`, `/images/news/placeholder-02.svg`, and `/images/news/placeholder-default.svg`.
- Article HTML is sanitized on the backend using `sanitize-html` with an explicit allowlist. Scripts, inline event handlers, unsafe protocols, and unknown tags must be removed.

## 6. Seven UI tabs

1. Overview (Toàn cảnh)
2. Project Legal (Pháp lý dự án)
3. Planning & Infrastructure (Quy hoạch - Hạ tầng)
4. Interest Rates & Finance (Lãi suất - Tài chính)
5. Market & Prices (Thị trường - Giá cả)
6. Investment & Cash Flow (Đầu tư - Dòng tiền)
7. Rental (Cho thuê)

“Overview” is an all-articles aggregate tab, not a real Category. The database has only six Categories:

- `phap-ly-du-an`
- `quy-hoach-ha-tang`
- `lai-suat-tai-chinh`
- `thi-truong-gia-ca`
- `dau-tu-dong-tien`
- `cho-thue`

## 7. Functional scope

### 7.1. Page `/ban-tin`

- Show the News module title and description.
- Show the seven-tab bar.
- Show featured articles: one primary article plus secondary items when data exists.
- Show the latest article list.
- Show loading, empty, and error states.
- Article cards navigate to the detail page.

### 7.2. Page `/ban-tin/chuyen-muc/[slug]`

- Show breadcrumb.
- Show category name and description.
- Show articles for that Category.
- Support `page` and `limit`.
- Support pagination.
- Support loading, empty, and error states.
- Unknown Category must return a clear 404 / not-found state.

### 7.3. Page `/ban-tin/[articleSlug]`

- Show breadcrumb.
- Show featured badge when the article is featured.
- Show title, thumbnail/content image, excerpt, content, publish date, and view count.
- Show article source when available.
- Show related articles when data exists (MVP requirement).
- Show tags and previous/next navigation when data exists (recommended enhancement).
- Unknown slug must return 404.

## 8. Out of scope

The following are outside the recruiter’s stated News-module MVP and should not delay delivery:

- Login, registration, JWT, session, or authorization.
- Admin UI, CMS, or article CRUD in the UI.
- Image upload.
- Comments, likes, bookmarks, or follow.
- Payments, CRM, or real-estate consulting.
- AI and Pro features.
- Video, podcast, and PDF reports.
- Automated news crawlers.
- Project, investor, inventory, or apartment lookup data.
- Microservices, Kubernetes, queues, or event buses without an explicit asynchronous use case.

## 8.1. Explicit assumptions and decision rules

- The seven UI tabs are one aggregate `Overview` tab plus six persisted Categories. `Overview` is not stored in PostgreSQL.
- The clean application routes are `/ban-tin`, `/ban-tin/chuyen-muc/[slug]`, and `/ban-tin/[articleSlug]`. Exact legacy `.html` URLs are not required unless the recruiter explicitly asks for them.
- The test targets the News core flow. Extra live-site blocks such as projects, reports, videos, Pro features, and CRM tools are not required.
- Seed images use committed local SVG placeholders so the demo works without external image hosting.
- Article list overflow uses HTTP 200 with an empty `data` array and valid pagination metadata; unknown Category and article slugs use HTTP 404.
- Tags, reading time, social sharing, and previous/next navigation are recommended but must not block the core flow.
- If the recruiter later clarifies a queue use case, update this file and the architecture before implementing it.

## 9. User flow

1. User opens `/ban-tin`.
2. Frontend calls APIs for categories, featured articles, and latest articles.
3. User selects a category tab.
4. Frontend navigates to `/ban-tin/chuyen-muc/[slug]` and calls the API with a Category filter.
5. User changes page via pagination.
6. User clicks an article card.
7. Frontend navigates to `/ban-tin/[articleSlug]`.
8. Backend returns article detail, category, tags, related articles, and navigation info when available.
9. If the slug does not exist, the frontend shows 404.

## 10. Must-have features

- Seven tabs, with “Overview” as an aggregate filter.
- Six real Categories seeded into PostgreSQL.
- API `GET /api/categories`.
- API `GET /api/articles` with filters and pagination.
- API `GET /api/articles/:slug`.
- Redis cache-aside for read APIs.
- Server Component page-level data fetching with explicit, minimal Client Component boundaries.
- CSS Modules plus global CSS; no Tailwind/UI framework.
- Local SVG placeholders for all required seed images.
- Backend `sanitize-html` allowlist before article HTML enters Redis or the response.
- Overview, category, and detail pages.
- Breadcrumb, cards, featured block, related articles.
- Loading, empty, error, 404, and broken-image fallback.
- Docker Compose for PostgreSQL and Redis.
- README and `.env.example`.

## 11. Nice-to-have features

- SEO metadata per article and Category.
- Basic Open Graph tags.
- Reading time.
- Article tags.
- Copy link.
- Previous/next article buttons.
- Skeleton loading.
- Responsive layout for mobile, tablet, and desktop.
- Cache hit/miss logging in development.
- Minimal unit tests for services and integration tests for controllers.

## 12. Optional only if time remains

- Dedicated aggregate endpoint for the overview page.
- Keyword search.
- Tag filter.
- Dynamic sitemap.
- JSON-LD structured data for Article.
- View-count tracking via Redis `INCR` with later flush to PostgreSQL.

Do not let these items delay the must-have scope.

## 13. Acceptance Criteria

### Page `/ban-tin`

- [ ] URL opens without error and shows the News module layout.
- [ ] All seven tabs exist; “Overview” does not create a separate Category.
- [ ] At least one featured article comes from API data.
- [ ] Latest list exists and cards are clickable.
- [ ] Loading, empty, and error states exist.
- [ ] Hard refresh still loads data.
- [ ] Initial read data is loaded by a Server Component; no unnecessary client-side fetch store is used.

### Category page

- [ ] URL matches `/ban-tin/chuyen-muc/[slug]`.
- [ ] Breadcrumb and category name match data.
- [ ] Only articles from the selected Category are shown.
- [ ] Pagination keeps the Category filter.
- [ ] Missing pages return a clear 404.
- [ ] Empty lists show empty state.
- [ ] Category and pagination navigation works with links/URL changes without requiring a global client state library.

### Detail page

- [ ] URL matches the article slug.
- [ ] Shows title, image, excerpt, content, publish date, and view count.
- [ ] Shows source and related articles when data exists.
- [ ] Rich-text content renders safely.
- [ ] Content containing script/event-handler markup is sanitized and does not execute.
- [ ] Seed article images resolve from committed local SVG placeholders without network access.
- [ ] Unknown slug returns 404.
- [ ] Basic SEO metadata exists.

### Backend, database, and Redis

- [ ] Prisma migrations run successfully.
- [ ] Seed creates six Categories and sample articles.
- [ ] APIs return HTTP 200, 400, 404, and 500 as appropriate.
- [ ] List responses include pagination metadata.
- [ ] Cache is written and re-read for read APIs.
- [ ] When Redis is down, APIs fall back to PostgreSQL.
- [ ] No real secrets exist in the repository.
- [ ] Styling uses CSS Modules/global CSS only, with no unapproved CSS framework.

### Infrastructure and handoff

- [ ] `docker compose up` starts PostgreSQL and Redis.
- [ ] Frontend and backend build successfully.
- [ ] README documents end-to-end run commands.
- [ ] No serious console errors on main flows.

## 14. Definition of Done

The project is complete when:

- All Acceptance Criteria above are checked and marked passed.
- Another person can clone the repository, create `.env`, run Docker Compose, migrate, seed, and start frontend/backend using the README.
- All three dynamic page types work against real PostgreSQL data.
- Redis cache-aside and fallback have been verified.
- No out-of-scope features add unnecessary complexity.
- Assumptions, known issues, and unfinished items are documented if any remain.
