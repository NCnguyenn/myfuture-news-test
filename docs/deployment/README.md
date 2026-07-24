# Deployment Runbook

## Projects

- GitHub: `https://github.com/NCnguyenn/myfuture-news-test`
- Vercel frontend project: `myfuture-news-web`, root `apps/frontend`
- Vercel backend project: `myfuture-news-api`, root `apps/backend`
- Function/database/cache region: Singapore

## Required environment names

Backend: `DATABASE_URL`, `DIRECT_URL`, `REDIS_URL`, `WEB_ORIGIN`.
Frontend: `API_BASE_URL`.

Values are stored only in provider dashboards. `DATABASE_URL` uses the Neon
pooled hostname; `DIRECT_URL` uses the Neon direct hostname; `REDIS_URL` uses
the Upstash TLS scheme.

## Database release

Run Prisma generate, migrate deploy, seed and `db:verify` from a trusted local
shell with temporary environment variables. Never run `migrate dev` against
production.

## Deployment order

Provision Neon and Upstash, release the database, deploy backend, verify API,
deploy frontend, verify browser routes, then add the verified live URL to
README.

## Rollback

Rollback frontend/backend from Vercel Deployments. Do not reset PostgreSQL
after sharing the demo. Redis is disposable and only `news:*` keys may be
cleared.
