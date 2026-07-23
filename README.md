# MyFuture News Module

A recruiter-ready News module built with Next.js App Router, React, NestJS with Fastify, PostgreSQL with Prisma, and Redis cache-aside.

The demo exposes seven UI tabs: one aggregate Overview plus six persisted Categories. Redis is used only as a read cache; there is no queue, authentication, admin UI, or CMS.

## Prerequisites

- Git
- Node.js 20 or newer with npm
- Docker Desktop (or Docker Engine) with Docker Compose

## Clone to run

Run every command from the repository root unless a step says to use a second terminal.

### 1. Clone the repository

```bash
git clone https://github.com/NCnguyenn/myfuture-news-test.git
cd myfuture-news-test
```

### 2. Start PostgreSQL and Redis

```bash
docker compose up -d
docker compose ps
```

Wait until both services are healthy. PostgreSQL maps container port `5432` to host port **`5434`**; Redis uses host port `6379`.

### 3. Create the local environment file

macOS/Linux:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

The checked-in example contains local-development placeholders only:

```dotenv
DATABASE_URL=postgresql://news:news@localhost:5434/myfuture_news
REDIS_URL=redis://localhost:6379
API_PORT=4000
WEB_ORIGIN=http://localhost:3000
API_BASE_URL=http://localhost:4000/api
NODE_ENV=development
```

`API_BASE_URL` is read only by the Next.js server. Do not rename it to a `NEXT_PUBLIC_*` variable. Keep `.env` local; it is ignored by Git.

### 4. Install dependencies and generate Prisma Client

```bash
npm install
npx prisma validate
npx prisma generate
```

### 5. Apply migrations and seed demo data

Use the committed migration so setup is deterministic:

```bash
npx prisma migrate deploy
npx prisma db seed
```

The idempotent seed creates exactly six Categories and 30 Articles. Overview / Toàn cảnh is a UI-only aggregate and is not inserted into the Category table. Seeded images are committed local SVG files under `apps/web/public/images/news/`.

### 6. Start the API and web app

Terminal 1:

```bash
npm run dev:api
```

Terminal 2:

```bash
npm run dev:web
```

The API listens on `http://localhost:4000/api`; the web app listens on `http://localhost:3000`.

### 7. Verify the demo

Check API, PostgreSQL, and Redis connectivity:

```bash
curl http://localhost:4000/api/health
```

Then open:

- `http://localhost:3000/ban-tin` — Overview, featured stories, and latest articles.
- `http://localhost:3000/ban-tin/chuyen-muc/phap-ly-du-an` — Category listing.
- `http://localhost:3000/ban-tin/phap-ly-du-an-bai-01` — Article detail and related articles.

An additional pagination sample is available at `http://localhost:3000/ban-tin/chuyen-muc/phap-ly-du-an?page=2`.

## Windows PowerShell commands

If PowerShell blocks `npm.ps1` or `npx.ps1` with `PSSecurityException`, use the `.cmd` shims. The complete setup sequence is:

```powershell
docker compose up -d
docker compose ps
Copy-Item .env.example .env
npm.cmd install
npx.cmd prisma validate
npx.cmd prisma generate
npx.cmd prisma migrate deploy
npx.cmd prisma db seed
npm.cmd run dev:api
```

Start the web app in a second PowerShell terminal:

```powershell
npm.cmd run dev:web
```

## Test, typecheck, and build

Run the reviewer gates from the repository root:

```bash
npm run test:api
npm run typecheck
npm run build:web
npm run build:api
```

Windows PowerShell equivalents:

```powershell
npm.cmd run test:api
npm.cmd run typecheck
npm.cmd run build:web
npm.cmd run build:api
```

The API production entry point can be checked after `build:api`:

```bash
npm --workspace apps/api run start
```

To run both production builds locally, start the API with the command above and run this in a second terminal:

```bash
npm --workspace apps/web run start
```

There is intentionally no lint script in this small take-home repository. The handoff gates are the existing focused API tests, TypeScript checks, and production builds; Phase 9 does not add an ESLint stack solely for checklist symmetry.

## API examples

```bash
curl http://localhost:4000/api/categories
curl "http://localhost:4000/api/articles?page=1&limit=10"
curl "http://localhost:4000/api/articles?category=phap-ly-du-an&featured=true"
curl http://localhost:4000/api/articles/phap-ly-du-an-bai-01
```

Article lists return `data` plus pagination `meta`. Invalid query parameters return HTTP 400, unknown API category/article slugs return HTTP 404, and page overflow returns HTTP 200 with an empty `data` array. Article `contentHtml` is sanitized by the backend before it is cached or returned.

## Redis behavior

Redis caches successful read responses only:

- Categories: 30 minutes.
- Article lists: 10 minutes.
- Article detail: 15 minutes.

If Redis is unavailable, reads fall back to PostgreSQL and the API remains usable. After reseeding, clear only News cache keys:

```bash
docker compose exec redis sh -c 'redis-cli --scan --pattern "news:*" | xargs -r redis-cli DEL'
```

## Known local behavior

- Dynamic App Router routes stream their response. For an unknown category or article, Next.js can send an HTTP 200 header before `notFound()` resolves; the rendered result is the custom 404 UI and carries `noindex` metadata. The backend API still returns HTTP 404 for unknown slugs.
- Some Windows PowerShell policies require `npm.cmd` / `npx.cmd`, as documented above.
- Docker Compose may print an environment-specific user-config access warning while still completing successfully; confirm actual service state with `docker compose ps`.

## Project documentation

- `md/` contains the project specification, architecture, implementation plan, test checklist, and progress evidence.
- `role/` contains the project-specific AI team-lead operating notes.

No deployment is required for local review.
