# Architecture

MyFuture News is an npm-workspaces monorepo.

## Runtime

- `apps/frontend`: Next.js Server Components and CSS Modules.
- `apps/backend`: NestJS with Fastify, Prisma and Redis cache-aside.
- PostgreSQL is the source of truth; Redis is optional read acceleration.

## Data flow

The browser requests a Next.js route. The Next.js server reads the NestJS API.
The API checks Redis, queries PostgreSQL on a miss, sanitizes article HTML, then
caches successful responses.

## Categories

The database stores six categories. “Toàn cảnh” is a UI-only aggregate, which
produces seven visible news tabs without an extra database row.

## Production

Frontend and backend are separate Vercel Projects in Singapore. Neon provides
PostgreSQL and Upstash provides Redis.
