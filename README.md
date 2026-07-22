# MyFuture News Module

A full-stack News module built with Next.js (App Router), NestJS (Fastify adapter), PostgreSQL (Prisma ORM), and Redis.

## Prerequisites

- Node.js v18+ & npm
- Docker & Docker Compose

## Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure default environment variables match local host services:
- `DATABASE_URL=postgresql://news:news@localhost:5432/myfuture_news`
- `REDIS_URL=redis://localhost:6379`
- `API_PORT=4000`
- `WEB_ORIGIN=http://localhost:3000`
- `API_BASE_URL=http://localhost:4000/api`

### 2. Start Infrastructure (PostgreSQL & Redis)

Start database and cache containers via Docker Compose:

```bash
docker compose up -d
```

Check service status:

```bash
docker compose ps
```

### 3. Install Dependencies & Generate Prisma Client

```bash
npm install
npx prisma validate
npx prisma generate
```

### 4. Run Development Servers

Run backend (NestJS API on port 4000):

```bash
npm run dev:api
```

Run frontend (Next.js App on port 3000):

```bash
npm run dev:web
```

### 5. Health Check

Verify health status (reporting API, PostgreSQL, and Redis connectivity):

```bash
curl http://localhost:4000/api/health
```

Expected response:

```json
{
  "data": {
    "status": "ok",
    "service": "myfuture-news-api",
    "checks": {
      "api": "up",
      "postgres": "up",
      "redis": "up"
    }
  }
}
```

### 6. Build & Typecheck

```bash
npm run typecheck
npm run build
```
