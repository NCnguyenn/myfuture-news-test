# Recruiter-Ready Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện, kiểm chứng và deploy MyFuture News trong 1 ngày để nhà tuyển dụng chỉ cần mở một link Vercel, đồng thời nhận được GitHub repository công khai có code sạch và tài liệu nhất quán.

**Architecture:** Giữ monorepo npm workspaces với Next.js frontend và NestJS/Fastify backend thành hai Vercel Projects. API chạy tại `sin1`, dùng Neon PostgreSQL pooled connection và Upstash Redis tại Singapore; frontend là URL duy nhất gửi nhà tuyển dụng, còn GitHub Actions và production smoke test là cổng chất lượng bắt buộc.

**Tech Stack:** Node.js 20, npm workspaces, Next.js 15/React 19, NestJS 11/Fastify 5, PostgreSQL 16, Prisma 6, Redis/ioredis, ESLint 9, Node test runner, GitHub Actions, Vercel, Neon và Upstash.

## Global Constraints

- Timebox là 1 ngày; ưu tiên lỗi bàn giao, deploy và reliability trước polish.
- Free tier là bắt buộc; không dùng VPS, Kubernetes hoặc dịch vụ cần thanh toán.
- Nhà tuyển dụng chỉ cần URL frontend công khai, không đăng nhập và không setup.
- Bản bàn giao gồm cả `https://github.com/NCnguyenn/myfuture-news-test` và URL production ổn định của Vercel frontend.
- Frontend/API là hai Vercel Projects có Root Directory lần lượt `apps/frontend` và `apps/backend`.
- Vercel Functions, Neon và Upstash đặt tại Singapore.
- Database có đúng 6 categories, 30 published articles, 5 articles/category và 5 featured.
- “Toàn cảnh” là tab aggregate UI, không phải Category database row.
- Redis chỉ là cache và luôn fail-soft về PostgreSQL.
- Không thêm auth, CMS, queue hoặc feature ngoài recruiter brief.
- Production secrets chỉ lưu ở Vercel/Neon/Upstash; không ghi vào Git hoặc logs.
- Mọi task kết thúc bằng test riêng và commit nhỏ; không stage file ngoài phạm vi task.
- Chỉ gửi bài khi toàn bộ Go/No-Go trong design spec đạt.

## One-Day Schedule

| Thời gian | Deliverable |
|---|---|
| 08:00–09:00 | Task 1–2: workspace, data và docs cleanup |
| 09:00–10:00 | Task 3: lint và root quality commands |
| 10:00–11:30 | Task 4: frontend reliability/pagination/redirect |
| 11:30–13:30 | Task 5–6: backend env, health và API integration |
| 13:30–14:30 | Task 7: deterministic seed và verification |
| 14:30–15:30 | Task 8–9: CI và deployment documentation |
| 15:30–17:30 | Task 10: Neon, Upstash và Vercel deployments |
| 17:30–19:00 | Task 11–12: production smoke, README, GitHub và final handoff |

## Target File Map

### Create

- `.github/workflows/ci.yml`: quality gate trên push/PR.
- `eslint.config.mjs`: một lint configuration cho toàn monorepo.
- `data/news/articles.json`: canonical 30-article seed dataset.
- `data/news/images.json`: article image provenance map.
- `apps/frontend/lib/news-config.ts`: page-size constants.
- `apps/frontend/test/api-client.spec.ts`: production URL/timeout/cache tests.
- `apps/frontend/test/data-layout.spec.ts`: submission data-location test.
- `apps/backend/src/app.factory.ts`: shared Nest/Fastify application setup.
- `apps/backend/src/config/runtime-env.ts`: validated runtime environment.
- `apps/backend/test/runtime-env.spec.ts`: environment validation tests.
- `apps/backend/test/api.integration.spec.ts`: Fastify injection tests.
- `apps/backend/test/seed-invariants.spec.ts`: deterministic data tests.
- `scripts/lib/seed-invariants.ts`: pure seed invariant validator.
- `scripts/verify-seed.ts`: live PostgreSQL verification command.
- `scripts/smoke-production.ts`: production frontend/API smoke test.
- `apps/backend/vercel.json`: region and daily health cron.
- `docs/architecture/README.md`: concise current architecture.
- `docs/deployment/README.md`: production runbook without secrets.

### Modify

- `.gitignore`
- `.env.example`
- `package.json`
- `package-lock.json`
- `apps/frontend/next.config.ts`
- `apps/frontend/lib/api-client.ts`
- `apps/frontend/lib/researched-news.ts`
- `apps/frontend/data/researched-images.ts`
- `apps/frontend/app/ban-tin/page.tsx`
- `apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx`
- `apps/frontend/app/ban-tin/[articleSlug]/page.tsx`
- relevant frontend source tests
- `apps/backend/package.json`
- `apps/backend/prisma/schema.prisma`
- `apps/backend/prisma/seed.ts`
- `apps/backend/src/main.ts`
- `apps/backend/src/health/health.service.ts`
- `scripts/lib/official-news-data.ts`
- `README.md`

### Remove

- root `NUL`
- stale `docs/decisions/`, `docs/delivery/`, `docs/internal/`, `docs/research/`
- obsolete `mockups/`
- obsolete research/import/sync scripts not used by build, seed or verification
- `apps/frontend/public/images/news/researched/manifest.json` after moving it to `data/news/images.json`

---

### Task 1: Isolate the Release Work and Clean Git Hygiene

**Files:**
- Modify: `.gitignore`
- Remove: `NUL`

**Interfaces:**
- Consumes: current branch at commit containing the approved design spec.
- Produces: isolated release branch/worktree and a repository that ignores Vercel/generated artifacts.

- [ ] **Step 1: Create the isolated execution workspace**

Invoke `using-git-worktrees` before changing files. Use branch:

```text
codex/recruiter-ready-production
```

Expected: the new worktree is based on the approved spec commit and no user change is overwritten.

- [ ] **Step 2: Record the baseline**

Run:

```powershell
git status --short --branch
git log -3 --oneline --decorate
git diff --check
```

Expected: only the known untracked `NUL` appears; the approved spec commit is present.

- [ ] **Step 3: Verify and remove only the reserved-name artifact**

Run:

```powershell
$nulPath = '\\?\D:\Personal_Project\myfuture-news-test\NUL'
git status --short --untracked-files=all
Remove-Item -LiteralPath $nulPath
git status --short --untracked-files=all
```

Expected: `NUL` disappears and no tracked file changes.

- [ ] **Step 4: Extend `.gitignore`**

Append exactly:

```gitignore
.vercel/
NUL
*.local
```

- [ ] **Step 5: Verify ignore behavior**

Run:

```powershell
git check-ignore -v .vercel/project.json
git check-ignore -v sample.local
git diff --check
```

Expected: both sample paths match `.gitignore`; whitespace check exits 0.

- [ ] **Step 6: Commit**

```powershell
git add .gitignore
git commit -m "chore: clean submission workspace"
```

Expected: commit contains only `.gitignore`; deleting untracked `NUL` creates no Git diff.

---

### Task 2: Move Canonical Data Out of Documentation and Remove Submission Noise

**Files:**
- Create: `apps/frontend/test/data-layout.spec.ts`
- Move: `docs/research/manifest-codex-2026-07-23.json` → `data/news/articles.json`
- Move: `apps/frontend/public/images/news/researched/manifest.json` → `data/news/images.json`
- Modify: `scripts/lib/official-news-data.ts`
- Modify: `apps/frontend/lib/researched-news.ts`
- Modify: `apps/frontend/data/researched-images.ts`
- Modify: `apps/frontend/test/researched-news.spec.ts`
- Modify: `package.json`
- Create: `docs/architecture/README.md`
- Remove: stale internal/process/research documentation and obsolete scripts listed in the Target File Map

**Interfaces:**
- Consumes: `loadOfficialArticles(): OfficialArticleSeed[]` and `getResearchedImage(slug, sourcePageUrl)`.
- Produces: the same public TypeScript interfaces backed by `data/news/articles.json` and `data/news/images.json`.

- [ ] **Step 1: Write the failing data-layout test**

Create `apps/frontend/test/data-layout.spec.ts`:

```ts
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..', '..', '..');

test('canonical submission data lives under data/news', () => {
  assert.equal(existsSync(path.join(root, 'data/news/articles.json')), true);
  assert.equal(existsSync(path.join(root, 'data/news/images.json')), true);
  assert.equal(existsSync(path.join(root, 'docs/research')), false);
  assert.equal(
    existsSync(
      path.join(
        root,
        'apps/frontend/public/images/news/researched/manifest.json',
      ),
    ),
    false,
  );
});

test('seed and preview loaders use canonical data paths', () => {
  const files = [
    'scripts/lib/official-news-data.ts',
    'apps/frontend/lib/researched-news.ts',
    'apps/frontend/data/researched-images.ts',
  ];
  for (const file of files) {
    const source = readFileSync(path.join(root, file), 'utf8');
    assert.match(source, /data[\\/]news/);
    assert.doesNotMatch(source, /docs[\\/]research/);
  }
});
```

- [ ] **Step 2: Run the test to prove the old layout fails**

Run:

```powershell
npm.cmd run test:web
```

Expected: the new test fails because `data/news` does not exist and `docs/research` still exists.

- [ ] **Step 3: Move the two canonical JSON files**

Run:

```powershell
New-Item -ItemType Directory -Force -Path 'data/news'
git mv 'docs/research/manifest-codex-2026-07-23.json' 'data/news/articles.json'
git mv 'apps/frontend/public/images/news/researched/manifest.json' 'data/news/images.json'
```

- [ ] **Step 4: Update all loaders**

In `scripts/lib/official-news-data.ts`, replace the manifest paths with:

```ts
const articleManifestPath = path.join(
  workspaceRoot,
  'data/news/articles.json',
);
const imageManifestPath = path.join(
  workspaceRoot,
  'data/news/images.json',
);
```

`loadImageManifest()` must read `imageManifestPath`, and `loadOfficialArticles()` must read `articleManifestPath`.

In `apps/frontend/lib/researched-news.ts`, make `readManifest()` use:

```ts
findWorkspaceFile('data/news/articles.json')
```

In `apps/frontend/data/researched-images.ts`, load:

```ts
records = require('../../../data/news/images.json') as Record<
  string,
  ImageRecord
>;
```

In `apps/frontend/test/researched-news.spec.ts`, read image metadata from:

```ts
path.join(workspaceRoot, 'data/news/images.json')
```

- [ ] **Step 5: Remove files that do not belong in the recruiter submission**

Remove with `git rm`:

```text
docs/architecture/01-PROJECT-SPEC.md
docs/architecture/02-TECHNICAL-ARCHITECTURE.md
docs/decisions/
docs/delivery/
docs/internal/
docs/research/
mockups/
scripts/import-official-news.ts
scripts/phase3-apply-and-verify.ps1
scripts/sync-researched-news-images.ts
scripts/research/
```

Keep:

```text
scripts/lib/markdown-to-html.ts
scripts/lib/official-news-data.ts
docs/superpowers/
apps/frontend/public/images/news/researched/*.jpg
apps/frontend/public/images/news/researched/*.png
```

- [ ] **Step 6: Remove obsolete package scripts**

The root `scripts` object must no longer include:

```json
{
  "sync:news-images": "tsx scripts/sync-researched-news-images.ts",
  "import:official-news": "tsx scripts/import-official-news.ts",
  "import:official-news:dry-run": "tsx scripts/import-official-news.ts --dry-run"
}
```

- [ ] **Step 7: Create concise architecture documentation**

Create `docs/architecture/README.md` with these exact sections:

```markdown
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
```

- [ ] **Step 8: Run data and frontend tests**

```powershell
npm.cmd run test:web
npm.cmd run db:validate
git diff --check
```

Expected: all frontend tests pass, Prisma schema remains valid and no old data path remains:

```powershell
Get-ChildItem apps,scripts,data -Recurse -File |
  Select-String -Pattern 'docs/research|manifest-codex-2026-07-23'
```

Expected: zero matches.

- [ ] **Step 9: Commit**

```powershell
git add package.json data apps/frontend scripts/lib docs/architecture
git add -u docs mockups scripts
git commit -m "refactor: streamline recruiter submission data"
```

---

### Task 3: Add a Monorepo Lint Gate

**Files:**
- Create: `eslint.config.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `apps/backend/src/health/health.service.ts`

**Interfaces:**
- Consumes: all JavaScript/TypeScript source under `apps/` and `scripts/`.
- Produces: `npm run lint` and `npm run check`, both exiting nonzero on quality failures.

- [ ] **Step 1: Add scripts before installing ESLint**

Add to root `package.json`:

```json
{
  "scripts": {
    "lint": "eslint . --max-warnings=0",
    "check": "npm run lint && npm run db:validate && npm run test:web && npm run test:api && npm run typecheck && npm run build"
  }
}
```

- [ ] **Step 2: Prove the new gate is not yet available**

Run:

```powershell
npm.cmd run lint
```

Expected: failure because ESLint/config is absent.

- [ ] **Step 3: Install pinned-major lint dependencies**

Run:

```powershell
npm.cmd install --save-dev eslint@^9 @eslint/js@^9 typescript-eslint@^8 globals@^16
```

- [ ] **Step 4: Create the flat configuration**

Create `eslint.config.mjs`:

```js
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
    rules: js.configs.recommended.rules,
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
```

- [ ] **Step 5: Remove explicit `any` from health logging**

Add to `HealthService`:

```ts
private errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
```

Replace both `catch (err: any)` blocks with `catch (error: unknown)` and log:

```ts
this.logger.warn(`PostgreSQL probe failed: ${this.errorMessage(error)}`);
```

and:

```ts
this.logger.warn(`Redis probe failed: ${this.errorMessage(error)}`);
```

- [ ] **Step 6: Run and fix only real lint findings**

Run:

```powershell
npm.cmd run lint
```

Expected: exit 0 with zero warnings. Do not disable a rule globally to hide a source error.

- [ ] **Step 7: Run focused regression gates**

```powershell
npm.cmd run test:api
npm.cmd run typecheck
git diff --check
```

- [ ] **Step 8: Commit**

```powershell
git add eslint.config.mjs package.json package-lock.json apps/backend/src/health/health.service.ts
git commit -m "chore: add monorepo lint gate"
```

---

### Task 4: Make Frontend Fetching Production-Safe and Pagination Demonstrable

**Files:**
- Create: `apps/frontend/lib/news-config.ts`
- Create: `apps/frontend/test/api-client.spec.ts`
- Modify: `apps/frontend/lib/api-client.ts`
- Modify: `apps/frontend/next.config.ts`
- Modify: `apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx`
- Modify: `apps/frontend/test/news-route-source.spec.ts`

**Interfaces:**
- Produces: `resolveApiBaseUrl(env?: NodeJS.ProcessEnv): string`.
- Produces: `CATEGORY_PAGE_SIZE = 4`.
- Preserves: `getCategories()`, `getArticles(query)` and `getArticleBySlug(slug)`.

- [ ] **Step 1: Write failing API configuration tests**

Create `apps/frontend/test/api-client.spec.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveApiBaseUrl } from '../lib/api-client';

test('uses the configured API URL without trailing slashes', () => {
  assert.equal(
    resolveApiBaseUrl({
      NODE_ENV: 'production',
      API_BASE_URL: 'https://api.example.test/api///',
    }),
    'https://api.example.test/api',
  );
});

test('rejects a missing production API URL', () => {
  assert.throws(
    () => resolveApiBaseUrl({ NODE_ENV: 'production' }),
    /API_BASE_URL is required in production/,
  );
});

test('keeps the local API default outside production', () => {
  assert.equal(
    resolveApiBaseUrl({ NODE_ENV: 'development' }),
    'http://localhost:4000/api',
  );
});
```

Extend `apps/frontend/test/news-route-source.spec.ts`:

```ts
test('category pagination uses the demonstrable page size', () => {
  const source = readFileSync(
    path.join(
      workspaceRoot,
      'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx',
    ),
    'utf8',
  );
  assert.match(source, /CATEGORY_PAGE_SIZE/);
  assert.doesNotMatch(source, /limit:\s*10/);
});
```

- [ ] **Step 2: Run tests and confirm red state**

```powershell
npm.cmd run test:web
```

Expected: failures for missing `resolveApiBaseUrl` and `CATEGORY_PAGE_SIZE`.

- [ ] **Step 3: Add the page-size constant**

Create `apps/frontend/lib/news-config.ts`:

```ts
export const CATEGORY_PAGE_SIZE = 4;
export const NEWS_CACHE_SECONDS = 300;
export const NEWS_REQUEST_TIMEOUT_MS = 8_000;
```

- [ ] **Step 4: Replace API client configuration and add runtime cache**

At the top of `apps/frontend/lib/api-client.ts`, add:

```ts
import { unstable_cache } from 'next/cache';
import {
  NEWS_CACHE_SECONDS,
  NEWS_REQUEST_TIMEOUT_MS,
} from './news-config';

export function resolveApiBaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const configured = env.API_BASE_URL?.trim().replace(/\/+$/, '');
  if (configured) return configured;
  if (env.NODE_ENV === 'production') {
    throw new Error('API_BASE_URL is required in production');
  }
  return 'http://localhost:4000/api';
}
```

Replace the request function with:

```ts
async function requestUncached(path: string): Promise<unknown> {
  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(NEWS_REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    let errorBody: ErrorBody = {};
    try {
      errorBody = (await response.json()) as ErrorBody;
    } catch {
      errorBody = {};
    }
    throw new ApiClientError(
      response.status,
      errorBody.message ??
        `News API request failed with status ${response.status}`,
      errorBody.code,
    );
  }

  return response.json();
}

const requestCached = unstable_cache(
  requestUncached,
  ['news-api-read'],
  { revalidate: NEWS_CACHE_SECONDS },
);

async function request<T>(path: string): Promise<T> {
  return (await requestCached(path)) as T;
}
```

The dynamic routes remain dynamic so CI builds do not require a running API; `unstable_cache` caches API read results at runtime using `path` as an argument key.

- [ ] **Step 5: Make category pagination visible**

In category page, import:

```ts
import { CATEGORY_PAGE_SIZE } from '../../../../lib/news-config';
```

Replace:

```ts
limit: 10,
```

with:

```ts
limit: CATEGORY_PAGE_SIZE,
```

- [ ] **Step 6: Add the legacy URL redirect**

Update `apps/frontend/next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/ban-tin.html',
        destination: '/ban-tin',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 7: Run frontend gates**

```powershell
npm.cmd run test:web
npm.cmd run typecheck:web
npm.cmd run build:web
```

Expected: all pass; build lists all News routes as dynamic.

- [ ] **Step 8: Commit**

```powershell
git add apps/frontend
git commit -m "feat: harden production news delivery"
```

---

### Task 5: Validate Backend Runtime and Correct Health Semantics

**Files:**
- Create: `apps/backend/src/config/runtime-env.ts`
- Create: `apps/backend/test/runtime-env.spec.ts`
- Create: `apps/backend/src/app.factory.ts`
- Create: `apps/backend/vercel.json`
- Modify: `apps/backend/src/main.ts`
- Modify: `apps/backend/src/health/health.service.ts`
- Modify: `apps/backend/prisma/schema.prisma`
- Modify: `.env.example`

**Interfaces:**
- Produces: `getRuntimeEnv(env?: NodeJS.ProcessEnv): RuntimeEnv`.
- Produces: `configureApp(app, webOrigin): void`.
- Produces: `createApp(): Promise<{ app: NestFastifyApplication; runtime: RuntimeEnv }>`.

- [ ] **Step 1: Write failing environment tests**

Create `apps/backend/test/runtime-env.spec.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { getRuntimeEnv } from '../src/config/runtime-env';

const productionEnv = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://user:pass@db.example.test/news',
  DIRECT_URL: 'postgresql://user:pass@db.example.test/news',
  REDIS_URL: 'rediss://default:pass@redis.example.test:6379',
  WEB_ORIGIN: 'https://web.example.test',
};

test('validates production URLs and Vercel PORT', () => {
  const result = getRuntimeEnv({ ...productionEnv, PORT: '3000' });
  assert.equal(result.port, 3000);
  assert.equal(result.webOrigin, 'https://web.example.test');
});

test('rejects a missing production variable', () => {
  const { REDIS_URL: _removed, ...env } = productionEnv;
  assert.throws(() => getRuntimeEnv(env), /REDIS_URL is required/);
});

test('uses safe local defaults in development', () => {
  const result = getRuntimeEnv({ NODE_ENV: 'development' });
  assert.equal(result.port, 4000);
  assert.equal(result.webOrigin, 'http://localhost:3000');
});
```

- [ ] **Step 2: Run tests and confirm failure**

```powershell
npm.cmd run test:api
```

Expected: module-not-found for `runtime-env`.

- [ ] **Step 3: Implement strict runtime environment validation**

Create `apps/backend/src/config/runtime-env.ts`:

```ts
export type RuntimeEnv = {
  port: number;
  webOrigin: string;
  databaseUrl: string;
  directUrl: string;
  redisUrl: string;
};

function required(
  env: NodeJS.ProcessEnv,
  name: string,
  fallback?: string,
): string {
  const value = env[name]?.trim() || fallback;
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function validatedUrl(
  env: NodeJS.ProcessEnv,
  name: string,
  fallback: string | undefined,
  protocols: string[],
): string {
  const value = required(env, name, fallback);
  const url = new URL(value);
  if (!protocols.includes(url.protocol)) {
    throw new Error(`${name} has an unsupported protocol`);
  }
  return value;
}

export function getRuntimeEnv(
  env: NodeJS.ProcessEnv = process.env,
): RuntimeEnv {
  const production = env.NODE_ENV === 'production';
  const port = Number(env.PORT ?? env.API_PORT ?? 4000);
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return {
    port,
    webOrigin: validatedUrl(
      env,
      'WEB_ORIGIN',
      production ? undefined : 'http://localhost:3000',
      ['http:', 'https:'],
    ),
    databaseUrl: validatedUrl(
      env,
      'DATABASE_URL',
      production
        ? undefined
        : 'postgresql://news:news@localhost:5434/myfuture_news',
      ['postgresql:', 'postgres:'],
    ),
    directUrl: validatedUrl(
      env,
      'DIRECT_URL',
      production
        ? undefined
        : 'postgresql://news:news@localhost:5434/myfuture_news',
      ['postgresql:', 'postgres:'],
    ),
    redisUrl: validatedUrl(
      env,
      'REDIS_URL',
      production ? undefined : 'redis://localhost:6379',
      ['redis:', 'rediss:'],
    ),
  };
}
```

- [ ] **Step 4: Extract shared Nest/Fastify setup**

Create `apps/backend/src/app.factory.ts`:

```ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { getRuntimeEnv } from './config/runtime-env';

export function configureApp(
  app: NestFastifyApplication,
  webOrigin: string,
): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableCors({ origin: webOrigin });
}

export async function createApp() {
  const runtime = getRuntimeEnv();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  configureApp(app, runtime.webOrigin);
  return { app, runtime };
}
```

Replace `main.ts` bootstrap body with:

```ts
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createApp } from './app.factory';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

async function bootstrap() {
  const { app, runtime } = await createApp();
  await app.listen(runtime.port, '0.0.0.0');
}

void bootstrap();
```

- [ ] **Step 5: Make PostgreSQL failure an error health state**

Replace the status calculation in `HealthService`:

```ts
const status =
  postgresStatus === 'down'
    ? 'error'
    : redisStatus === 'down'
      ? 'degraded'
      : 'ok';
```

- [ ] **Step 6: Add direct migration URL and local example**

In Prisma datasource:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Set `.env.example` to:

```dotenv
DATABASE_URL=postgresql://news:news@localhost:5434/myfuture_news
DIRECT_URL=postgresql://news:news@localhost:5434/myfuture_news
REDIS_URL=redis://localhost:6379
API_PORT=4000
WEB_ORIGIN=http://localhost:3000
API_BASE_URL=http://localhost:4000/api
NODE_ENV=development
```

Update the ignored local `.env` with the same local `DIRECT_URL` value before
running Prisma commands:

```dotenv
DIRECT_URL=postgresql://news:news@localhost:5434/myfuture_news
```

Do not stage `.env`.

- [ ] **Step 7: Guarantee Prisma Client generation on clean installs**

Add to `apps/backend/package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate --schema prisma/schema.prisma"
  }
}
```

Run:

```powershell
npm.cmd install
```

Expected: Prisma Client generation succeeds from the backend workspace.

- [ ] **Step 8: Add Vercel region and cron configuration**

Create `apps/backend/vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "regions": ["sin1"],
  "crons": [
    {
      "path": "/api/health",
      "schedule": "0 1 * * *"
    }
  ]
}
```

- [ ] **Step 9: Run backend gates**

```powershell
npm.cmd run test:api
npm.cmd run typecheck:api
npm.cmd run db:validate
npm.cmd run build:api
```

Expected: all pass.

- [ ] **Step 10: Commit**

```powershell
git add .env.example apps/backend
git commit -m "feat: validate production API runtime"
```

---

### Task 6: Add Fastify API Integration Coverage

**Files:**
- Create: `apps/backend/test/api.integration.spec.ts`
- Modify: `apps/backend/package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `configureApp(app, webOrigin)`.
- Produces: in-memory HTTP assertions through Fastify `inject()` without a TCP port.

- [ ] **Step 1: Install the Nest testing package**

```powershell
npm.cmd install --workspace apps/backend --save-dev @nestjs/testing@^11
```

- [ ] **Step 2: Write the integration test**

Create `apps/backend/test/api.integration.spec.ts`:

```ts
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import type { FastifyInstance } from 'fastify';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.factory';
import { CacheService } from '../src/cache/cache.service';
import { PrismaService } from '../src/prisma/prisma.service';

let app: NestFastifyApplication;
let fastify: FastifyInstance;

const categories = Array.from({ length: 6 }, (_, index) => ({
  id: `category-${index + 1}`,
  name: `Category ${index + 1}`,
  slug: `category-${index + 1}`,
  description: null,
  _count: { articles: 5 },
}));

before(async () => {
  const prisma = {
    category: {
      findMany: async () => categories,
      findUnique: async ({ where }: { where: { slug: string } }) =>
        categories.find((item) => item.slug === where.slug) ?? null,
    },
    article: {
      count: async () => 0,
      findMany: async () => [],
      findFirst: async () => null,
    },
  };
  const cache = {
    getJson: async () => null,
    setJson: async () => true,
  };

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .overrideProvider(CacheService)
    .useValue(cache)
    .compile();

  app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );
  configureApp(app, 'http://localhost:3000');
  await app.init();
  fastify = app.getHttpAdapter().getInstance() as FastifyInstance;
  await fastify.ready();
});

after(async () => {
  await app.close();
});

test('GET /api/categories returns six categories', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/api/categories',
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.length, 6);
});

test('invalid pagination returns the normalized 400 envelope', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/api/articles?page=0',
  });
  assert.equal(response.statusCode, 400);
  assert.equal(response.json().code, 'INVALID_REQUEST');
});

test('unknown category returns CATEGORY_NOT_FOUND', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/api/articles?category=missing-category',
  });
  assert.equal(response.statusCode, 404);
  assert.equal(response.json().code, 'CATEGORY_NOT_FOUND');
});

test('unknown article returns ARTICLE_NOT_FOUND', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/api/articles/missing-article',
  });
  assert.equal(response.statusCode, 404);
  assert.equal(response.json().code, 'ARTICLE_NOT_FOUND');
});
```

- [ ] **Step 3: Run the integration test**

```powershell
npm.cmd run test:api
```

Expected: existing unit tests and four new HTTP integration tests pass without PostgreSQL/Redis.

- [ ] **Step 4: Run typecheck and lint**

```powershell
npm.cmd run lint
npm.cmd run typecheck:api
```

- [ ] **Step 5: Commit**

```powershell
git add apps/backend/package.json apps/backend/test/api.integration.spec.ts package-lock.json
git commit -m "test: cover Fastify API contracts"
```

---

### Task 7: Make Demo Seed Deterministic and Verifiable

**Files:**
- Create: `scripts/lib/seed-invariants.ts`
- Create: `apps/backend/test/seed-invariants.spec.ts`
- Create: `scripts/verify-seed.ts`
- Modify: `apps/backend/prisma/seed.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `assertSeedSnapshot(snapshot: SeedSnapshot): void`.
- Produces: `npm run db:verify`.
- Guarantees: exact dataset counts after `npm run db:seed`.

- [ ] **Step 1: Write failing invariant tests**

Create `apps/backend/test/seed-invariants.spec.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertSeedSnapshot,
  type SeedSnapshot,
} from '../../../scripts/lib/seed-invariants';

const valid: SeedSnapshot = {
  categories: Array.from({ length: 6 }, (_, index) => ({
    slug: `category-${index + 1}`,
    publishedArticleCount: 5,
  })),
  articles: Array.from({ length: 30 }, (_, index) => ({
    slug: `article-${index + 1}`,
    sourceUrl: `https://source.example.test/${index + 1}`,
    isFeatured: index < 5,
    categorySlug: `category-${Math.floor(index / 5) + 1}`,
  })),
  overviewCategoryCount: 0,
};

test('accepts the exact recruiter dataset', () => {
  assert.doesNotThrow(() => assertSeedSnapshot(valid));
});

test('rejects duplicate article slugs', () => {
  const invalid = structuredClone(valid);
  invalid.articles[1].slug = invalid.articles[0].slug;
  assert.throws(() => assertSeedSnapshot(invalid), /article slugs/);
});

test('rejects an incorrect featured count', () => {
  const invalid = structuredClone(valid);
  invalid.articles[5].isFeatured = true;
  assert.throws(() => assertSeedSnapshot(invalid), /5 featured/);
});
```

- [ ] **Step 2: Run test and confirm missing module**

```powershell
npm.cmd run test:api
```

Expected: failure for missing `scripts/lib/seed-invariants`.

- [ ] **Step 3: Implement the pure validator**

Create `scripts/lib/seed-invariants.ts`:

```ts
export type SeedSnapshot = {
  categories: Array<{
    slug: string;
    publishedArticleCount: number;
  }>;
  articles: Array<{
    slug: string;
    sourceUrl: string | null;
    isFeatured: boolean;
    categorySlug: string;
  }>;
  overviewCategoryCount: number;
};

function uniqueCount(values: string[]): number {
  return new Set(values).size;
}

export function assertSeedSnapshot(snapshot: SeedSnapshot): void {
  if (snapshot.categories.length !== 6) {
    throw new Error('Seed must contain exactly 6 categories');
  }
  if (snapshot.articles.length !== 30) {
    throw new Error('Seed must contain exactly 30 published articles');
  }
  if (snapshot.overviewCategoryCount !== 0) {
    throw new Error('Overview must not be stored as a category');
  }
  if (
    snapshot.categories.some(
      (category) => category.publishedArticleCount !== 5,
    )
  ) {
    throw new Error('Each category must contain 5 published articles');
  }
  const slugs = snapshot.articles.map((article) => article.slug);
  if (uniqueCount(slugs) !== slugs.length) {
    throw new Error('Seed must contain unique article slugs');
  }
  const sourceUrls = snapshot.articles.map((article) => article.sourceUrl);
  if (
    sourceUrls.some((value) => !value) ||
    uniqueCount(sourceUrls as string[]) !== sourceUrls.length
  ) {
    throw new Error('Seed must contain unique non-empty source URLs');
  }
  if (snapshot.articles.filter((article) => article.isFeatured).length !== 5) {
    throw new Error('Seed must contain exactly 5 featured articles');
  }
  const categorySlugs = new Set(
    snapshot.categories.map((category) => category.slug),
  );
  if (
    snapshot.articles.some(
      (article) => !categorySlugs.has(article.categorySlug),
    )
  ) {
    throw new Error('Every article must reference a known category');
  }
}
```

- [ ] **Step 4: Make seed prune stale demo rows before upsert**

At the beginning of `main()` in `apps/backend/prisma/seed.ts`, load the dataset before category upserts:

```ts
const articles = loadOfficialArticles();
const articleSlugs = articles.map((article) => article.slug);

await prisma.article.deleteMany({
  where: { slug: { notIn: articleSlugs } },
});
await prisma.category.deleteMany({
  where: { slug: { notIn: [...OFFICIAL_CATEGORY_ORDER] } },
});
```

Remove the later duplicate `const articles = loadOfficialArticles();`.

This database is a dedicated read-only recruiter demo; deterministic pruning is intentional and must be documented.

- [ ] **Step 5: Implement live database verification**

Create `scripts/verify-seed.ts`:

```ts
import { PrismaClient } from '@prisma/client';
import { assertSeedSnapshot } from './lib/seed-invariants';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: {
      slug: true,
      _count: {
        select: {
          articles: { where: { isPublished: true } },
        },
      },
    },
  });
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    select: {
      slug: true,
      sourceUrl: true,
      isFeatured: true,
      category: { select: { slug: true } },
    },
  });
  const overviewCategoryCount = await prisma.category.count({
    where: {
      OR: [
        { slug: { in: ['overview', 'toan-canh'] } },
        { name: { in: ['Overview', 'Toàn cảnh'] } },
      ],
    },
  });

  assertSeedSnapshot({
    categories: categories.map((category) => ({
      slug: category.slug,
      publishedArticleCount: category._count.articles,
    })),
    articles: articles.map((article) => ({
      slug: article.slug,
      sourceUrl: article.sourceUrl,
      isFeatured: article.isFeatured,
      categorySlug: article.category.slug,
    })),
    overviewCategoryCount,
  });

  console.log(
    JSON.stringify({
      categories: categories.length,
      publishedArticles: articles.length,
      featuredArticles: articles.filter((article) => article.isFeatured).length,
      status: 'ok',
    }),
  );
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add root script:

```json
{
  "db:verify": "tsx scripts/verify-seed.ts"
}
```

- [ ] **Step 6: Run pure tests**

```powershell
npm.cmd run test:api
npm.cmd run lint
npm.cmd run typecheck
```

Expected: pass without requiring live database.

- [ ] **Step 7: If local Docker is available, verify idempotency**

```powershell
docker compose -f infrastructure/docker-compose.yml up -d
npm.cmd run db:migrate:deploy
npm.cmd run db:seed
npm.cmd run db:verify
npm.cmd run db:seed
npm.cmd run db:verify
```

Expected after both runs:

```json
{"categories":6,"publishedArticles":30,"featuredArticles":5,"status":"ok"}
```

If Docker is unavailable, production Neon verification in Task 10 is mandatory and this local step remains recorded as environment-unavailable rather than passed.

- [ ] **Step 8: Commit**

```powershell
git add apps/backend/prisma/seed.ts apps/backend/test/seed-invariants.spec.ts scripts package.json
git commit -m "feat: verify deterministic news seed"
```

---

### Task 8: Add GitHub Continuous Integration

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `package.json`

**Interfaces:**
- Consumes: `npm run lint`, `db:validate`, tests, typecheck and builds.
- Produces: a required `quality` job suitable for branch protection.

- [ ] **Step 1: Add a workflow source test**

Create `apps/backend/test/ci-source.spec.ts`:

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..', '..', '..');

test('CI runs every recruiter quality gate', () => {
  const source = readFileSync(
    path.join(root, '.github/workflows/ci.yml'),
    'utf8',
  );
  for (const command of [
    'npm ci',
    'npm run lint',
    'npm run db:validate',
    'npm run test:web',
    'npm run test:api',
    'npm run typecheck',
    'npm run build',
  ]) {
    assert.match(source, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
```

- [ ] **Step 2: Run test and confirm missing workflow**

```powershell
npm.cmd run test:api
```

Expected: file-not-found for `.github/workflows/ci.yml`.

- [ ] **Step 3: Create the workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, "codex/**"]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  quality:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    env:
      DATABASE_URL: postgresql://news:news@localhost:5434/myfuture_news
      DIRECT_URL: postgresql://news:news@localhost:5434/myfuture_news
      API_BASE_URL: http://localhost:4000/api
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run db:validate
      - run: npm run db:generate
      - run: npm run test:web
      - run: npm run test:api
      - run: npm run typecheck
      - run: npm run build
```

The database URLs are syntactically valid local examples used only for schema/build evaluation; the workflow never connects to them.

- [ ] **Step 4: Run the complete local equivalent**

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd run db:validate
npm.cmd run db:generate
npm.cmd run test:web
npm.cmd run test:api
npm.cmd run typecheck
npm.cmd run build
```

Expected: every command exits 0.

- [ ] **Step 5: Commit**

```powershell
git add .github/workflows/ci.yml apps/backend/test/ci-source.spec.ts
git commit -m "ci: enforce recruiter quality gates"
```

---

### Task 9: Write the Deployment Runbook Before Touching Cloud State

**Files:**
- Create: `docs/deployment/README.md`

**Interfaces:**
- Consumes: architecture and environment variable names.
- Produces: exact no-secret runbook for Neon, Upstash, Vercel, smoke and rollback.

- [ ] **Step 1: Create the runbook**

The file must include these sections and exact decisions:

```markdown
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
```

- [ ] **Step 2: Check for leaked values or incomplete markers**

Run:

```powershell
Select-String -Path 'docs/deployment/README.md' `
  -Pattern 'postgresql://|rediss://'
```

Expected: zero matches.

- [ ] **Step 3: Commit**

```powershell
git add docs/deployment/README.md
git commit -m "docs: add production deployment runbook"
```

---

### Task 10: Provision Neon and Upstash, Then Deploy Both Vercel Projects

**Files:**
- No secret-bearing local files.
- Provider state: Neon, Upstash and two Vercel Projects.

**Interfaces:**
- Produces: stable backend production origin and stable frontend production origin.
- Produces: production PostgreSQL with verified seed and active Redis.

- [ ] **Step 1: Push the release branch and wait for CI**

```powershell
git push -u origin codex/recruiter-ready-production
```

Open GitHub Actions for the pushed commit. Expected: `CI / quality` is green before provisioning.

- [ ] **Step 2: Confirm repository visibility**

Run with GitHub CLI if authenticated:

```powershell
gh repo view NCnguyenn/myfuture-news-test --json url,visibility,defaultBranchRef
```

Expected:

```json
{"url":"https://github.com/NCnguyenn/myfuture-news-test","visibility":"PUBLIC","defaultBranchRef":{"name":"main"}}
```

If visibility is not `PUBLIC`, change it in GitHub Settings → General → Danger Zone before final handoff.

- [ ] **Step 3: Create Neon PostgreSQL**

In Neon:

1. Create project `myfuture-news-test`.
2. Select AWS Asia Pacific Singapore.
3. Create database `myfuture_news`.
4. Copy the pooled connection string for `DATABASE_URL`.
5. Copy the direct connection string for `DIRECT_URL`.
6. Keep both only in the current shell and password manager/provider dashboard.

- [ ] **Step 4: Release and verify the production database**

In PowerShell:

```powershell
$env:DATABASE_URL = Read-Host 'Paste Neon pooled DATABASE_URL'
$env:DIRECT_URL = Read-Host 'Paste Neon direct DIRECT_URL'
npm.cmd run db:generate
npm.cmd run db:migrate:deploy
npm.cmd run db:seed
npm.cmd run db:verify
```

Expected:

```json
{"categories":6,"publishedArticles":30,"featuredArticles":5,"status":"ok"}
```

Do not close the shell until backend Vercel environment variables are configured.

- [ ] **Step 5: Create Upstash Redis**

In Upstash:

1. Create database `myfuture-news-cache`.
2. Select Singapore as primary region.
3. Select the Free plan.
4. Copy the TLS Redis connection string beginning with `rediss://`.

Temporarily set:

```powershell
$env:REDIS_URL = Read-Host 'Paste Upstash REDIS_URL'
```

- [ ] **Step 6: Create both Vercel Projects and reserve stable domains**

In Vercel Dashboard:

1. Add New Project and import `NCnguyenn/myfuture-news-test`.
2. Name it `myfuture-news-api`.
3. Root Directory: `apps/backend`.
4. Create a second project from the same repository named `myfuture-news-web`.
5. Set the second project's Root Directory to `apps/frontend`.
6. Copy the stable production domains assigned to both projects.
7. Return to backend settings and keep Framework Preset auto-detected.
8. Add Production/Preview variables `DATABASE_URL`, `DIRECT_URL`, `REDIS_URL`.
9. Set `WEB_ORIGIN` to the exact stable frontend production origin.
10. Deploy backend and retain its stable production origin.

Confirm the deployed function region is Singapore in project settings/logs.

- [ ] **Step 7: Verify backend before frontend**

Set the stable API origin, including `/api`:

```powershell
$env:API_BASE_URL = Read-Host 'Paste stable backend origin ending in /api'
Invoke-RestMethod "$env:API_BASE_URL/health" | ConvertTo-Json -Depth 5
Invoke-RestMethod "$env:API_BASE_URL/categories" | ConvertTo-Json -Depth 5
Invoke-RestMethod "$env:API_BASE_URL/articles?page=1&limit=50" |
  ConvertTo-Json -Depth 5
```

Expected:

- health `status` is `ok`;
- categories length is 6;
- article metadata total is 30.

- [ ] **Step 8: Import the frontend Vercel Project**

In the already-created `myfuture-news-web` project:

1. Set Production/Preview `API_BASE_URL` to the stable backend origin plus `/api`.
2. Deploy.
3. Confirm its stable frontend production origin; this is the URL sent to the recruiter.
4. Return to backend settings and ensure `WEB_ORIGIN` exactly equals this frontend origin.
5. Redeploy backend only if `WEB_ORIGIN` changed.

- [ ] **Step 9: Remove secrets from the local process**

```powershell
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:DIRECT_URL -ErrorAction SilentlyContinue
Remove-Item Env:REDIS_URL -ErrorAction SilentlyContinue
```

Keep only public origins when running smoke tests.

---

### Task 11: Add and Run Production Smoke Tests

**Files:**
- Create: `scripts/smoke-production.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: public `WEB_BASE_URL` and `API_BASE_URL`.
- Produces: `npm run smoke:production` with exit 0 only when all production contracts pass.

- [ ] **Step 1: Add the script command before its file**

Add:

```json
{
  "smoke:production": "tsx scripts/smoke-production.ts"
}
```

Run:

```powershell
npm.cmd run smoke:production
```

Expected: failure because `scripts/smoke-production.ts` does not exist.

- [ ] **Step 2: Implement the smoke test**

Create `scripts/smoke-production.ts`:

```ts
import assert from 'node:assert/strict';

type Category = { id: string; name: string; slug: string };
type Article = {
  slug: string;
  title: string;
  category: { slug: string };
};
type ListResponse = {
  data: Article[];
  meta: { totalItems: number };
};

function requiredOrigin(name: 'WEB_BASE_URL' | 'API_BASE_URL'): string {
  const value = process.env[name]?.trim().replace(/\/+$/, '');
  if (!value) throw new Error(`${name} is required`);
  const url = new URL(value);
  assert.equal(url.protocol, 'https:', `${name} must use HTTPS`);
  return value;
}

async function expectOk(url: string): Promise<Response> {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(
    response.ok,
    true,
    `${url} returned ${response.status}`,
  );
  return response;
}

async function json<T>(url: string): Promise<T> {
  return (await (await expectOk(url)).json()) as T;
}

async function main() {
  const web = requiredOrigin('WEB_BASE_URL');
  const api = requiredOrigin('API_BASE_URL');

  const health = await json<{
    data: {
      status: string;
      checks: { postgres: string; redis: string };
    };
  }>(`${api}/health`);
  assert.equal(health.data.status, 'ok');
  assert.equal(health.data.checks.postgres, 'up');
  assert.equal(health.data.checks.redis, 'up');

  const categories = await json<{ data: Category[] }>(`${api}/categories`);
  assert.equal(categories.data.length, 6);

  const articles = await json<ListResponse>(
    `${api}/articles?page=1&limit=50`,
  );
  assert.equal(articles.meta.totalItems, 30);
  assert.equal(articles.data.length, 30);

  const category = categories.data[0];
  const categoryArticles = await json<ListResponse>(
    `${api}/articles?category=${encodeURIComponent(category.slug)}&page=1&limit=4`,
  );
  assert.equal(categoryArticles.meta.totalItems, 5);
  assert.equal(
    categoryArticles.data.every(
      (article) => article.category.slug === category.slug,
    ),
    true,
  );

  const article = articles.data[0];
  const detail = await json<{ data: Article }>(
    `${api}/articles/${encodeURIComponent(article.slug)}`,
  );
  assert.equal(detail.data.slug, article.slug);

  const badCategory = await fetch(
    `${api}/articles?category=missing-category`,
  );
  assert.equal(badCategory.status, 404);
  const badArticle = await fetch(`${api}/articles/missing-article`);
  assert.equal(badArticle.status, 404);

  for (const path of [
    '/',
    '/ban-tin',
    `/ban-tin/chuyen-muc/${category.slug}`,
    `/ban-tin/chuyen-muc/${category.slug}?page=2`,
    `/ban-tin/${article.slug}`,
    '/ban-tin.html',
  ]) {
    const response = await expectOk(`${web}${path}`);
    const contentType = response.headers.get('content-type') ?? '';
    assert.match(contentType, /text\/html/);
  }

  console.log(
    JSON.stringify({
      status: 'ok',
      categories: categories.data.length,
      articles: articles.meta.totalItems,
      category: category.slug,
      article: article.slug,
    }),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
```

- [ ] **Step 3: Verify missing environment fails clearly**

```powershell
Remove-Item Env:WEB_BASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:API_BASE_URL -ErrorAction SilentlyContinue
npm.cmd run smoke:production
```

Expected: nonzero exit with `WEB_BASE_URL is required`.

- [ ] **Step 4: Run production smoke three consecutive times**

```powershell
$env:WEB_BASE_URL = Read-Host 'Paste stable frontend production origin'
$env:API_BASE_URL = Read-Host 'Paste stable backend origin ending in /api'
1..3 | ForEach-Object {
  npm.cmd run smoke:production
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

Expected: three JSON lines with `"status":"ok"`.

- [ ] **Step 5: Commit and push**

```powershell
git add package.json scripts/smoke-production.ts
git commit -m "test: add production smoke gate"
git push
```

Wait for GitHub CI and both Vercel preview/production checks to finish.

---

### Task 12: Finalize README, Merge, Redeploy and Prepare the Two-Link Handoff

**Files:**
- Modify: `README.md`
- Modify: `docs/deployment/README.md`

**Interfaces:**
- Consumes: verified stable frontend URL, stable backend URL and public GitHub URL.
- Produces: final recruiter handoff with exactly one demo link and one repository link.

- [ ] **Step 1: Capture the two public URLs**

The repository URL is:

```text
https://github.com/NCnguyenn/myfuture-news-test
```

Copy the stable production domain from Vercel project `myfuture-news-web`. Do not use a preview-deployment URL containing a commit-specific suffix.

- [ ] **Step 2: Rewrite README as a concise recruiter document**

README must start with:

```markdown
# MyFuture News

Recruitment take-home implementing the seven-tab News flow and article detail
experience with Next.js, NestJS/Fastify, PostgreSQL/Prisma and Redis.
```

Immediately below, add two visible badges/links:

- `Live Demo` linked to the verified stable frontend production domain.
- `GitHub Repository` linked to `https://github.com/NCnguyenn/myfuture-news-test`.

Use these real route examples:

```text
/ban-tin
/ban-tin/chuyen-muc/phap-ly-du-an
/ban-tin/chuyen-muc/phap-ly-du-an?page=2
/ban-tin/hai-luat-nha-o-kinh-doanh-bat-dong-san-sua-doi-cap-bach-2026
```

README sections, in order:

1. Live Demo and Repository.
2. Scope and screenshot-free feature summary.
3. Architecture.
4. Tech stack.
5. Local setup.
6. Test/build commands.
7. API examples.
8. Production deployment summary.
9. Redis fallback.
10. Intentional non-goals.

Remove every mention of:

```text
phap-ly-du-an-bai-01
No deployment is required
29 published
9 featured
```

- [ ] **Step 3: Add the actual production domains to the runbook**

Add a `Verified production` section to `docs/deployment/README.md` containing:

- the stable frontend origin;
- the stable backend origin;
- the UTC timestamp of the third successful smoke run;
- the Git commit SHA tested by smoke.

These are public values, not secrets.

- [ ] **Step 4: Run documentation and secret checks**

```powershell
Select-String -Path README.md,docs/deployment/README.md `
  -Pattern 'phap-ly-du-an-bai-01|No deployment is required'
git diff --check
```

Exclude documented local-only examples and planning documents from the secret
scan:

```powershell
git grep -n -I -E `
  '(BEGIN [A-Z ]*PRIVATE KEY|DATABASE_URL=postgresql|REDIS_URL=rediss)' `
  -- `
  ':!package-lock.json' `
  ':!.env.example' `
  ':!README.md' `
  ':!infrastructure/docker-compose.yml' `
  ':!docs/superpowers/**'
```

Expected: the scoped scan has zero matches and whitespace check exits 0.

- [ ] **Step 5: Run the complete final local gate**

Invoke `verification-before-completion`, then run fresh:

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd run db:validate
npm.cmd run db:generate
npm.cmd run test:web
npm.cmd run test:api
npm.cmd run typecheck
npm.cmd run build
git status --short
```

Expected: all commands exit 0; status contains only the intended README/runbook changes before commit.

- [ ] **Step 6: Commit final public links**

```powershell
git add README.md docs/deployment/README.md
git commit -m "docs: publish verified demo handoff"
git push
```

- [ ] **Step 7: Request code review and merge**

Invoke `requesting-code-review`. Address only verified findings.

Create a pull request:

```powershell
gh pr create `
  --base main `
  --head codex/recruiter-ready-production `
  --title "feat: prepare recruiter-ready production demo" `
  --body "Adds deterministic data verification, CI, production hardening, Vercel deployment configuration, smoke tests, and the verified demo handoff."
```

Merge only after:

- GitHub CI is green.
- Vercel frontend/backend deployments are successful.
- Review has no blocking finding.

- [ ] **Step 8: Verify the merged production deployment**

After merge, wait for main-branch Vercel deployments. Run:

```powershell
git switch main
git pull --ff-only
$env:WEB_BASE_URL = Read-Host 'Paste stable frontend production origin'
$env:API_BASE_URL = Read-Host 'Paste stable backend origin ending in /api'
1..3 | ForEach-Object {
  npm.cmd run smoke:production
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
git status --short --branch
```

Expected: three passes, clean `main`, synchronized with `origin/main`.

- [ ] **Step 9: Perform the recruiter-view check**

In a logged-out/private browser:

1. Open the GitHub repository URL and confirm it is public.
2. Open the frontend demo URL.
3. Click all seven tabs.
4. Open category page 2.
5. Open at least two article details.
6. Resize to 375 px and 1440 px.
7. Confirm no login prompt, broken image, 500 page or browser console error.
8. Open backend `/api/health` and confirm `status=ok`.

- [ ] **Step 10: Send the handoff message**

Generate the concise message from the already verified environment values:

```powershell
$repoUrl = 'https://github.com/NCnguyenn/myfuture-news-test'
$handoff = @"
Em gửi anh/chị bài test MyFuture News:

- Website demo: $env:WEB_BASE_URL
- GitHub source code: $repoUrl

Tech stack: Next.js/React, NestJS/Fastify, PostgreSQL/Prisma và Redis.
Website đã có dữ liệu demo, không cần đăng nhập hoặc setup để kiểm tra.
README trong repository có hướng dẫn chạy local, migrations, seed và test.
"@
$handoff
```

Do not send the message until the merged-commit smoke test and private-browser check both pass.

## Final Definition of Done

- [ ] Public GitHub repository opens while logged out.
- [ ] Stable Vercel frontend URL opens while logged out.
- [ ] GitHub README contains both verified public links.
- [ ] CI is green on merged `main`.
- [ ] Vercel frontend/backend show successful production deployments for merged `main`.
- [ ] Neon verification reports 6 categories, 30 published articles and 5 featured.
- [ ] API health is `ok` with PostgreSQL and Redis both `up`.
- [ ] Production smoke passes three consecutive times after merge.
- [ ] Private-browser walkthrough has no login, 5xx, broken image or console error.
- [ ] Worktree is clean and `main` equals `origin/main`.
