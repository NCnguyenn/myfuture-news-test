# Technical Architecture — MyFuture News Module

This document describes the proposed architecture for the assignment. It is small enough for one candidate to finish and clear enough for another coding agent to continue without adding systems outside scope.

## 1. Architecture principles

- One monorepo containing frontend and backend.
- Frontend calls backend APIs only; it never talks to PostgreSQL or Redis directly.
- Backend is a single NestJS application with the Fastify adapter.
- PostgreSQL is the source of truth.
- Prisma handles data access and migrations.
- Redis is used only as cache-aside for read APIs.
- No authentication, admin, queue, microservice, or crawler in the MVP. Redis is cache-only because there is no asynchronous business use case.
- Category names and article data come from the API. The UI-only aggregate `Overview` tab is a deliberate frontend configuration item because it has no database row.
- Next.js read-only pages use Server Components by default; Client Components are limited to browser-only interactions.
- Styling uses built-in CSS Modules and `globals.css`; no Tailwind or UI framework is needed.
- Article HTML is sanitized by the backend with `sanitize-html` before it is returned to the frontend.

## 2. High-level architecture

```text
Browser
  |
  | HTTP/HTTPS
  v
Next.js + React + TypeScript
  |
  | REST JSON, server-only API_BASE_URL
  v
NestJS + Fastify + TypeScript
  |                 |
  | Prisma          | cache-aside
  v                 v
PostgreSQL       Redis
```

Normal request flow:

1. Browser opens a Next.js route.
2. An async Next.js Server Component calls the NestJS API for initial read data.
3. Backend normalizes the query and validates input with DTOs.
4. Backend reads Redis by cache key.
5. On cache hit, return JSON from Redis.
6. On cache miss, Prisma reads PostgreSQL; backend serializes the result and writes Redis with a TTL.
7. On Redis failure, log a warning and fall back to PostgreSQL; Redis must not take the API down.

## 3. Proposed monorepo layout

```text
myfuture-news-test/
├─ apps/
│  ├─ web/                 # Next.js frontend
│  └─ api/                 # NestJS + Fastify backend
├─ packages/
│  └─ shared/              # Only if shared types are needed; optional
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts
├─ docker-compose.yml
├─ .env.example
├─ package.json
├─ pnpm-workspace.yaml     # Or npm workspaces if npm is chosen
├─ README.md
└─ md/
```

Do not create `packages/shared` if shared types only add config overhead without clear benefit. In a small assignment, response types may be defined separately on frontend and backend.

## 4. Expected frontend structure

```text
apps/frontend/
├─ app/
│  ├─ layout.tsx
│  ├─ globals.css
│  ├─ not-found.tsx
│  ├─ error.tsx
│  └─ ban-tin/
│     ├─ page.tsx
│     ├─ chuyen-muc/
│     │  └─ [slug]/page.tsx
│     └─ [articleSlug]/page.tsx
├─ components/
│  ├─ news/
│  │  ├─ NewsTabs.tsx
│  │  ├─ FeaturedNews.tsx
│  │  ├─ NewsCard.tsx
│  │  ├─ NewsList.tsx
│  │  ├─ Pagination.tsx
│  │  ├─ ArticleContent.tsx
│  │  ├─ RelatedNews.tsx
│  │  └─ NewsStates.tsx
│  ├─ layout/
│  │  ├─ Header.tsx
│  │  └─ Footer.tsx
│  └─ ui/
├─ lib/
│  ├─ api-client.ts
│  └─ format-date.ts
├─ types/
│  └─ news.ts
└─ public/
│  └─ images/news/
│     ├─ placeholder-01.svg
│     ├─ placeholder-02.svg
│     ├─ placeholder-03.svg
│     └─ placeholder-default.svg
```

File names may follow Next.js conventions, but each component should have one responsibility. Do not put fetch logic, pagination, and rich-text rendering into one giant component.

### 4.1. Server vs Client Components and data fetching

- `app/ban-tin/page.tsx`, `app/ban-tin/chuyen-muc/[slug]/page.tsx`, and `app/ban-tin/[articleSlug]/page.tsx` are async Server Components.
- They fetch read data from NestJS using a small server-side API client and the non-public `API_BASE_URL` environment variable. The frontend does not query PostgreSQL or Redis directly.
- Category tabs and pagination are rendered as links with URL parameters; navigation causes the relevant Server Component to fetch the next result.
- Do not add a global client data store for this read-only module.
- Use Client Components only where browser APIs or local interaction are required: Copy link, a retry button that avoids navigation, or a mobile-menu toggle.
- When calling the NestJS API, prefer `cache: 'no-store'` or an explicitly documented revalidation policy so the backend Redis cache remains the single application cache. Do not create a second, conflicting data cache in Next.js.
- Route-level `loading.tsx`, `error.tsx`, and `not-found.tsx` handle loading, failure, and missing slug states.

### 4.2. CSS strategy

- Use `apps/frontend/app/globals.css` for reset, font variables, colors, base typography, and layout tokens.
- Use colocated `*.module.css` files for Header, tabs, cards, lists, pagination, article content, and responsive rules.
- Use CSS media queries for mobile/tablet/desktop breakpoints.
- Do not add Tailwind, styled-components, Material UI, Chakra UI, or another CSS/UI framework.

### 4.3. Seed image strategy

- Commit a small set of local SVG placeholders under `apps/frontend/public/images/news/`.
- Store relative paths such as `/images/news/placeholder-01.svg` in seeded `thumbnailUrl`/`coverImageUrl` fields.
- Include at least three visual variants plus `placeholder-default.svg` for missing/broken-image fallback.
- This keeps seed data deterministic and makes the app usable without external image hosting or network access.

## 5. Expected backend structure

```text
apps/backend/
├─ src/
│  ├─ main.ts
│  ├─ app.module.ts
│  ├─ health/
│  │  ├─ health.controller.ts
│  │  └─ health.service.ts
│  ├─ categories/
│  │  ├─ categories.controller.ts
│  │  ├─ categories.service.ts
│  │  └─ dto/
│  ├─ articles/
│  │  ├─ articles.controller.ts
│  │  ├─ articles.service.ts
│  │  ├─ dto/
│  │  └─ presenters/
│  ├─ content/
│  │  └─ content-sanitizer.service.ts
│  ├─ prisma/
│  │  ├─ prisma.module.ts
│  │  └─ prisma.service.ts
│  └─ cache/
│     ├─ cache.module.ts
│     ├─ cache.service.ts
│     └─ cache.keys.ts
├─ test/
└─ tsconfig.json
```

`main.ts` must bootstrap `FastifyAdapter`, enable CORS, set a global validation pipe, and use the `/api` prefix. Controllers only handle request/response; database queries, cache, and mapping live in services.

### 5.1. HTML sanitization dependency

- Choose `sanitize-html`, not DOMPurify, because sanitization happens in the Node.js/NestJS backend before Redis and the API response. DOMPurify is browser-DOM-oriented and would require an extra DOM/JSDOM layer on the backend.
- Add runtime dependency `sanitize-html` to the backend and its TypeScript type package if required by the selected version.
- Sanitize `contentHtml` in the Article service/presenter before caching and returning the detail response. Sanitizing before caching prevents unsafe HTML from being stored in Redis.
- Use an explicit allowlist suitable for articles: `p`, `h2`, `h3`, `h4`, `ul`, `ol`, `li`, `strong`, `em`, `blockquote`, `a`, `figure`, `figcaption`, `br`, and `img`.
- Allow only the required attributes: `href`, `target`, and `rel` for links; `src`, `alt`, `width`, `height`, and `loading` for images.
- Allow only `http`/`https` and safe relative URLs. Remove `script`, `style`, iframe, inline event attributes such as `onerror`, unsafe protocols, and unknown tags.
- The frontend `ArticleContent` component may render the already-sanitized HTML, but it must not accept arbitrary raw HTML from client input.

## 6. Prisma and PostgreSQL design

### 6.1. Category

Minimum fields:

- `id`: UUID or cuid, primary key.
- `name`: display name.
- `slug`: unique, used in URLs.
- `description`: short description, nullable.
- `sortOrder`: display order.
- `isActive`: show/hide Category.
- `createdAt`, `updatedAt`.

### 6.2. Article

Minimum fields:

- `id`: UUID or cuid, primary key.
- `title`: title.
- `slug`: unique, used in URLs.
- `excerpt`: short description.
- `contentHtml`: rich-text content stored in PostgreSQL and sanitized with backend `sanitize-html` before caching/returning.
- `thumbnailUrl`: card image.
- `coverImageUrl`: lead image if different from thumbnail, nullable.
- `publishedAt`: publish timestamp.
- `isPublished`: only return published articles.
- `isFeatured`: used for featured block.
- `viewCount`: initial seed or display views.
- `readingTime`: reading time in minutes, nullable.
- `sourceName`, `sourceUrl`: article source, nullable.
- `categoryId`: foreign key to Category.
- `createdAt`, `updatedAt`.

Relationship: one Category has many Articles; each Article belongs to exactly one Category in this assignment.

### 6.3. Optional Tag

If tags are needed:

- `Tag`: `id`, `name`, `slug`.
- `ArticleTag`: `articleId`, `tagId`, composite unique.

Tag is recommended for detail-page keywords but is not required for the MVP. Skip the many-to-many Tag model if it would delay the core flow.

### 6.4. Constraints and indexes

- Unique: `Category.slug`, `Article.slug`, `Tag.slug` if present.
- Indexes: `Article.categoryId`, `Article.publishedAt`, `Article.isPublished`, `Article.isFeatured`.
- Recommended composite index: `(categoryId, publishedAt)`.
- List queries always filter `isPublished = true`.

## 7. Required APIs

### `GET /api/categories`

Returns the six real Categories ordered by `sortOrder`, optionally including `articleCount`.

Sample response:

```json
{
  "data": [
    {
      "id": "category-id",
      "name": "Pháp lý dự án",
      "slug": "phap-ly-du-an",
      "description": "...",
      "articleCount": 12
    }
  ]
}
```

The frontend prepends the aggregate “Overview” tab before this list.

### `GET /api/articles`

Query parameters:

- `category`: Category slug; empty means Overview (all).
- `page`: positive integer, default `1`.
- `limit`: integer from 1–50, default `10`.
- `featured`: `true` or `false`, optional.
- `sort`: only allowlisted values, default newest first.

Pagination response:

```json
{
  "data": [
    {
      "id": "article-id",
      "title": "Article title",
      "slug": "article-title",
      "excerpt": "Short description",
      "thumbnailUrl": "/images/news/placeholder-01.svg",
      "publishedAt": "2026-07-21T00:00:00.000Z",
      "viewCount": 12,
      "category": {
        "name": "Pháp lý dự án",
        "slug": "phap-ly-du-an"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 12,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### `GET /api/articles/:slug`

Returns article detail, Category, related articles, and optionally tags and previous/next articles. Related articles are limited to five items and must not include the current article.

Sample response:

```json
{
  "data": {
    "id": "article-id",
    "title": "Article title",
    "slug": "article-title",
    "excerpt": "Short description",
    "contentHtml": "<p>Content...</p>",
    "thumbnailUrl": "/images/news/placeholder-01.svg",
    "publishedAt": "2026-07-21T00:00:00.000Z",
    "viewCount": 12,
    "readingTime": 5,
    "sourceName": "Reference source",
    "sourceUrl": "https://source.example/article",
    "isFeatured": true,
    "category": {
      "name": "Quy hoạch - Hạ tầng",
      "slug": "quy-hoach-ha-tang"
    },
    "relatedArticles": [],
    "previousArticle": null,
    "nextArticle": null
  }
}
```

### 7.1. Frozen response and error rules

- Success envelopes are `{ "data": ... }`; paginated article lists also include `meta`.
- List-page overflow returns HTTP 200 with `data: []` and valid metadata.
- Unknown Category or article slug returns HTTP 404.
- Invalid query parameters return HTTP 400.
- Unexpected failures return HTTP 500 without stack traces.
- Error bodies use `{ "statusCode": number, "message": string, "code": string }`.
- Dates are serialized as ISO 8601 UTC strings.
- `limit` defaults to 10 and is capped at 50; `page` defaults to 1.

## 8. Errors and validation

- `400 Bad Request`: invalid `page`, `limit`, `featured`, or other filters.
- `404 Not Found`: unknown Category slug or article slug.
- `500 Internal Server Error`: unexpected database or service failures.
- Do not return stack traces in production responses.
- Use DTOs with class-validator or an equivalent NestJS validation approach.
- Cap `limit` to avoid oversized queries.
- Distinguish unknown Category from an empty article list.

## 9. CORS and environment variables

Minimum variables:

```text
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
API_PORT=4000
WEB_ORIGIN=http://localhost:3000
API_BASE_URL=http://localhost:4000/api
NODE_ENV=development
```

Rules:

- Commit `.env.example`; never commit `.env`.
- Production secrets must come from the deployment environment.
- CORS allows only the frontend origin for that environment.
- Do not log connection strings.
- Do not prefix `API_BASE_URL` with `NEXT_PUBLIC_` unless a documented Client Component must call the API directly; the planned initial data flow is server-side.

## 10. Redis cache-aside

Suggested cache keys:

- `news:categories`
- `news:articles:{categoryOrAll}:{page}:{limit}:{featured}:{sort}`
- `news:article:{slug}`

Suggested TTLs:

- Categories: 30 minutes.
- Article lists: 5–10 minutes.
- Featured articles: 5–10 minutes.
- Detail: 10–30 minutes.

Cache flow:

1. Service builds a key from normalized query values.
2. Attempt Redis read.
3. Cache hit: parse JSON and return.
4. Cache miss: query Prisma, serialize response, write Redis with TTL.
5. Redis exception: log warning, skip cache, read PostgreSQL.

Do not cache 500 responses. Do not cache responses based on non-normalized queries. There are no public mutations in the MVP, so TTL plus a documented flush command after seed is sufficient. Do not introduce a queue, worker, or BullMQ unless a concrete asynchronous requirement is added.

## 11. Docker Compose

Compose needs two services:

- `postgres`: PostgreSQL with a data volume, healthcheck, and local port.
- `redis`: Redis with healthcheck and local port.

Backend may run outside Compose in development; if it runs in a container, use the service name as hostname instead of `localhost`.

Minimum health checks:

- PostgreSQL via `pg_isready`.
- Redis via `redis-cli ping`.

Frontend/backend containers are optional if they increase complexity; README must clearly describe how to run them on the host.

## 12. Explicit non-goals

- No authentication to protect the API.
- No admin/CMS to enter articles.
- No queue, because reads are synchronous only.
- No database access from Next.js.
- No Project, Investor, or Report modules without matching acceptance criteria.
- Do not store “Overview” as a Category.
