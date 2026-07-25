# Deployment Runbook

## Verified production

- Stable frontend origin: `https://myfuture-news-web.vercel.app`
- Stable backend origin: `https://myfuture-news-api.vercel.app/api`
- Third successful production smoke run (UTC): `2026-07-25T05:11:09Z`
- Git commit tested by smoke: `374918f60d2e911aa64cfd0a6d565db114b622c1`

## Projects

- GitHub: `https://github.com/NCnguyenn/myfuture-news-test`
- Vercel frontend project: `myfuture-news-web`, root `apps/frontend`
- Vercel backend project: `myfuture-news-api`, root `apps/backend`
- Vercel, Neon PostgreSQL, and Upstash Redis run in Singapore.

## Runtime

Configure both Vercel projects to use Node.js 22.x for production builds and
runtime. CI runs the same quality gates on Node.js 20 and Node.js 22 for
compatibility and production parity.

## Required environment names

Backend: `DATABASE_URL`, `DIRECT_URL`, `REDIS_URL`, `WEB_ORIGIN`.
Frontend: `API_BASE_URL`.

Store values only in the relevant provider dashboards. `DATABASE_URL` uses the
Neon pooled hostname, `DIRECT_URL` uses the Neon direct hostname, and
`REDIS_URL` uses the Upstash TLS scheme.

## Database release

From a trusted shell with temporary environment variables, run Prisma generate,
`migrate deploy`, seed, and `db:verify`. Never run `migrate dev` against
production.

## Deployment order

Provision Neon and Upstash, release and verify the database, deploy the
backend, verify the API health endpoint, deploy the frontend, then verify the
public browser routes and production smoke test.

## Rollback

Rollback frontend or backend from Vercel Deployments. Do not reset PostgreSQL
after sharing the demo. Redis is disposable; clear only `news:*` keys when a
cache reset is required.
