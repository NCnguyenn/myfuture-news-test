# MyFuture News

Recruitment take-home implementing the seven-tab News flow and article detail
experience with Next.js, NestJS/Fastify, PostgreSQL/Prisma and Redis.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Open%20production-0f766e?style=flat-square)](https://myfuture-news-web.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/NCnguyenn/myfuture-news-test)

## Live Demo and Repository

- [Live demo](https://myfuture-news-web.vercel.app)
- [GitHub repository](https://github.com/NCnguyenn/myfuture-news-test)

## Scope and screenshot-free feature summary

MyFuture News is a public, recruiter-facing news experience with no login or
setup required to inspect the deployed demo. It provides:

- Seven visible news tabs: one aggregate overview and six persisted database
  categories.
- A deterministic editorial dataset of 42 published articles across six
  intentionally uneven categories, including exactly 5 featured stories,
  complete provenance, and idempotent verification.
- Responsive overview, category, pagination, article-detail, related-story,
  loading, empty, and error states.
- Public API-backed navigation and detail pages, including these production
  routes:
  - [/ban-tin](https://myfuture-news-web.vercel.app/ban-tin)
  - [/ban-tin/chuyen-muc/phap-ly-du-an](https://myfuture-news-web.vercel.app/ban-tin/chuyen-muc/phap-ly-du-an)
  - [/ban-tin/chuyen-muc/phap-ly-du-an?page=2](https://myfuture-news-web.vercel.app/ban-tin/chuyen-muc/phap-ly-du-an?page=2)
  - [/ban-tin/hai-luat-nha-o-kinh-doanh-bat-dong-san-sua-doi-cap-bach-2026](https://myfuture-news-web.vercel.app/ban-tin/hai-luat-nha-o-kinh-doanh-bat-dong-san-sua-doi-cap-bach-2026)

## Architecture

This npm-workspaces monorepo separates the web application from the API.
The browser requests Next.js routes; Next.js reads the NestJS/Fastify API;
the API uses Prisma with PostgreSQL as the source of truth. Redis implements
cache-aside for successful reads only, while article HTML is sanitized before
it is cached or returned.

## Tech stack

- Frontend: Next.js App Router, React, TypeScript, and CSS Modules.
- Backend: NestJS, Fastify, Prisma, TypeScript, and PostgreSQL.
- Cache: Redis **cache-aside only** (no job queue). Reads fall back to PostgreSQL
  when Redis is unavailable.
- Production: Vercel frontend and API projects, Neon PostgreSQL, and Upstash
  Redis in Singapore.
- Runtime: production uses Node.js 22; CI validates Node.js 20 and Node.js 22.

## Local setup

Prerequisites: Git, Node.js 22, npm, Docker, and Docker Compose. Node.js 22
matches production; CI also checks compatibility with Node.js 20.

```bash
git clone https://github.com/NCnguyenn/myfuture-news-test.git
cd myfuture-news-test
docker compose -f infrastructure/docker-compose.yml up -d
cp .env.example .env
npm ci
npm run db:validate
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
npm run db:verify
```

On Windows PowerShell, use `Copy-Item .env.example .env` and the `npm.cmd`
equivalent if execution policy blocks `npm.ps1`. PostgreSQL is exposed on
`localhost:5434`, Redis on `localhost:6379`, the API on
`http://localhost:4000/api`, and the web app on `http://localhost:3000`.

Start the API and web application in separate terminals.

Terminal 1 (API):

```bash
npm run dev:api
```

Terminal 2 (web):

```bash
npm run dev:web
```

## Test/build commands

Run these commands from the repository root after dependencies are installed:

```bash
npm run lint
npm run db:validate
npm run db:generate
npm test
npm run test:web
npm run test:api
npm run typecheck
npm run build
```

`npm test` runs both application suites; `test:web` and `test:api` remain
available for focused debugging. CI runs the quality gates on Node.js 20 and
Node.js 22; Vercel production builds use Node.js 22.

## API examples

The local API base URL is `http://localhost:4000/api`.

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/categories
curl "http://localhost:4000/api/articles?page=1&limit=10"
curl "http://localhost:4000/api/articles?category=phap-ly-du-an&featured=true"
curl http://localhost:4000/api/articles/hai-luat-nha-o-kinh-doanh-bat-dong-san-sua-doi-cap-bach-2026
```

Lists return `data` and pagination `meta`. Invalid query parameters return
HTTP 400, and unknown category or article slugs return HTTP 404.

## Production deployment summary

The stable production frontend is [myfuture-news-web.vercel.app](https://myfuture-news-web.vercel.app),
and the stable backend API is [myfuture-news-api.vercel.app/api](https://myfuture-news-api.vercel.app/api).
The frontend and backend are separate Vercel projects in Singapore. Neon
provides PostgreSQL and Upstash provides Redis; provider values remain only in
their dashboards. See [the deployment runbook](docs/deployment/README.md) for
runtime, migration, deployment-order, and rollback guidance.

Secondary verification link: [Production API health](https://myfuture-news-api.vercel.app/api/health).

## Redis fallback

Redis is an optional **read cache only** (not a queue). If it is unavailable,
the API continues to serve reads from PostgreSQL; cache failures do not make
the news experience unavailable. Health checks report the state of both
services.

After `npm run db:seed`, the seeder clears `news:*` keys when `REDIS_URL` is
configured so list/detail/category responses do not serve stale snapshots.
Manual clear: `npm run cache:clear:news`.

## Intentional non-goals

- Authentication, authorization, and user accounts.
- An editorial admin interface or CMS.
- Background jobs, queues, and content authoring workflows.
- Redis as a source of truth or a dependency for successful database reads.
