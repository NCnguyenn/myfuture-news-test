# Professional Monorepo Restructure Design

**Date:** 2026-07-23

**Status:** Approved for planning
**Baseline:** `main` at merge commit `980bec9`

## 1. Objective

Restructure MyFuture News into a clean npm monorepo whose frontend and backend are clearly separated, independently buildable, and independently deployable. Vercel must be able to deploy only the Next.js application by selecting `apps/frontend` as its Root Directory.

The restructure must preserve the current technology choices:

- Frontend: Next.js 15 and React 19
- Backend: NestJS 11 with Fastify
- Database: PostgreSQL with Prisma
- Cache: Redis

It must also preserve the 30 official articles, the 26 researched source images, the four fallback images, migrations, seed/import pipeline, API behavior, and existing automated tests.

## 2. Target Structure

```text
myfuture-news/
├── apps/
│   ├── frontend/
│   │   ├── app/
│   │   ├── components/
│   │   ├── data/
│   │   ├── lib/
│   │   ├── public/
│   │   ├── test/
│   │   ├── types/
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── backend/
│       ├── prisma/
│       │   ├── migrations/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       ├── src/
│       ├── test/
│       ├── nest-cli.json
│       ├── package.json
│       └── tsconfig.json
├── infrastructure/
│   └── docker-compose.yml
├── scripts/
│   ├── lib/
│   └── research/
├── docs/
│   ├── architecture/
│   ├── delivery/
│   ├── decisions/
│   ├── research/
│   └── internal/
├── mockups/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

No shared `packages/` directory will be introduced because the two applications currently do not share a publishable library. Adding an empty abstraction layer would increase maintenance without improving deployment.

## 3. Directory Mapping

| Current path | Target path | Purpose |
| --- | --- | --- |
| `apps/web/` | `apps/frontend/` | Deployable Next.js application |
| `apps/api/` | `apps/backend/` | Deployable NestJS application |
| `prisma/` | `apps/backend/prisma/` | Backend-owned database schema, migrations, and seed |
| `docker-compose.yml` | `infrastructure/docker-compose.yml` | Local PostgreSQL and Redis infrastructure |
| `scripts/*.ts` | `scripts/*.ts` | Operational import and verification commands |
| `scripts/lib/` | `scripts/lib/` | Shared code used by operational scripts |
| `md/01-*`, `md/02-*` | `docs/architecture/` | Product and technical architecture |
| `md/03-*`, `md/04-*`, `md/05-*` | `docs/delivery/` | Implementation, verification, and progress records |
| `md/06-*` and research reports/manifests | `docs/research/` | Content research evidence |
| `md/content-research/*.py` | `scripts/research/` | Research data-generation utilities |
| `docs/superpowers/` | `docs/decisions/` | Approved designs and implementation plans |
| `role/` | `docs/internal/` | Internal project operating notes |
| `mockup/` | `mockups/` | Curated UI reference screenshots |

## 4. Asset and File Cleanup

### Runtime assets that must be retained

Everything under the following paths is a product dependency and must not be removed:

- `apps/frontend/public/images/news/researched/` after the rename
- `apps/frontend/public/images/news/placeholder-01.svg`
- `apps/frontend/public/images/news/placeholder-02.svg`
- `apps/frontend/public/images/news/placeholder-03.svg`
- `apps/frontend/public/images/news/placeholder-default.svg`
- The researched-image manifest and any frontend data mapping that references those assets

The verification phase must confirm 26 researched source images and four fallback images remain available.

### Reference mockups that must be retained

The curated reference set contains exactly these eight screenshots:

- `01-ban-tin-toan-canh-full.png`
- `02-phap-ly-du-an-full.png`
- `03-quy-hoach-ha-tang-full.png`
- `04-lai-suat-tai-chinh-full.png`
- `05-thi-truong-gia-ca-full.png`
- `06-dau-tu-dong-tien-full.png`
- `07-cho-thue-full.png`
- `08-chi-tiet-bai-viet-full.png`

They will move from `mockup/` to `mockups/`, together with an updated `README.md`.

### Files approved for deletion

The following files are obsolete, duplicated references, or generated artifacts:

- `myfuture-ban-tin.png`
- `mockup/01-ban-tin-overview-full.png`
- `mockup/02-toan-canh-full.png`
- `mockup/03-phap-ly-du-an-full.png`
- `mockup/04-quy-hoach-ha-tang-full.png`
- `mockup/05-lai-suat-tai-chinh-full.png`
- `mockup/06-thi-truong-gia-ca-full.png`
- `mockup/07-dau-tu-dong-tien-full.png`
- `mockup/08-cho-thue-full.png`
- `mockup/09-bai-viet-chi-tiet-full.png`
- `apps/web/tsconfig.tsbuildinfo`
- The empty `.agents/` directory, if it is still present

`.gitignore` will explicitly exclude `*.tsbuildinfo` so the generated TypeScript cache is not committed again.

No article image or content-research evidence will be deleted merely to reduce repository size.

## 5. Workspace and Command Design

The root `package.json` remains the single command entry point. Its workspaces will change to:

```json
{
  "workspaces": [
    "apps/frontend",
    "apps/backend"
  ]
}
```

Existing command intent remains stable:

- `npm run dev:web`
- `npm run dev:api`
- `npm run build:web`
- `npm run build:api`
- `npm run build`
- `npm run typecheck`
- `npm run test:web`
- `npm run test:api`
- Prisma generation, validation, migration, seed, and official-news import

Prisma commands must receive the schema location explicitly where needed:

```text
apps/backend/prisma/schema.prisma
```

Docker commands in documentation and helper scripts must use:

```text
docker compose -f infrastructure/docker-compose.yml
```

The Compose file must still load the root environment configuration and preserve the current local PostgreSQL and Redis ports and volumes.

## 6. Deployment Boundaries

### Frontend on Vercel

- Repository: the existing GitHub repository
- Root Directory: `apps/frontend`
- Framework: Next.js
- Build command: the frontend package build command detected from its `package.json`
- Runtime variable: `API_BASE_URL`
- Static article images: deployed with `apps/frontend/public`

Vercel must not build or deploy `apps/backend`.

### Backend

The NestJS/Fastify server remains an independently deployable long-running Node.js service. This restructure does not convert it to a Vercel Function. Its eventual host can use `apps/backend` as the service root, while PostgreSQL and Redis remain externally managed production services.

## 7. Compatibility and Data Safety

The restructure changes filesystem locations only. It must not change:

- Database tables, columns, migrations, or article records
- Public API routes or response shapes
- Frontend URL routes
- Article slugs, category slugs, publication state, or source attribution
- Cache key behavior
- Image URLs exposed to the frontend

Any import path, test path, seed reference, documentation command, npm workspace entry, and package-lock workspace record affected by a move must be updated in the same change.

## 8. Verification

The restructure is complete only when all of the following pass from a fresh working tree:

1. `npm install` resolves both renamed workspaces.
2. Prisma schema validation and client generation use `apps/backend/prisma/schema.prisma`.
3. All frontend tests pass.
4. All backend tests pass.
5. Frontend and backend TypeScript checks pass.
6. Next.js production build passes from `apps/frontend`.
7. NestJS production build passes from `apps/backend`.
8. Docker Compose configuration validates from `infrastructure/docker-compose.yml`.
9. The repository contains 26 researched article images and four fallback images.
10. The curated `mockups/` directory contains exactly eight PNG screenshots plus its README.
11. No tracked `*.tsbuildinfo`, `.next/`, `dist/`, or obsolete screenshot remains.
12. Repository-wide searches find no active configuration or code reference to `apps/web`, `apps/api`, or the old root `prisma/` path. Historical documentation may mention old paths only when explicitly identified as history.

## 9. Risks and Controls

- **Stale branch risk:** implementation starts from the synchronized `main` baseline containing the official 30-article pipeline.
- **Broken workspace lockfile:** regenerate `package-lock.json` with npm after renaming workspaces.
- **Broken Prisma resolution:** update schema, seed, and generated-client commands before running database checks.
- **Broken image references:** preserve filenames and public URL structure even though the application folder moves.
- **Accidental asset loss:** compare the researched manifest and file count before and after cleanup.
- **Deployment coupling:** keep frontend API access environment-driven; do not import backend source into the frontend.

## 10. Out of Scope

This restructure does not:

- Redesign the UI/UX
- Deploy to Vercel or another production host
- Modify or clean the live PostgreSQL database
- Change the 30 approved articles
- Introduce a shared component/package system
- Convert the backend to serverless

UI/UX work begins only after the restructure passes verification. Deployment happens after the UI/UX is reviewed and approved.
