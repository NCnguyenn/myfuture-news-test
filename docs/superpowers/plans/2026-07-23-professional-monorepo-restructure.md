# Professional Monorepo Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure MyFuture News into independently deployable `apps/frontend` and `apps/backend` applications, place Prisma under the backend, organize infrastructure and documentation, and remove approved obsolete assets without losing the official article dataset.

**Architecture:** Keep one npm-workspace repository with two deployable applications. The Next.js frontend owns its static images and can be selected directly as Vercel Root Directory `apps/frontend`; the NestJS/Fastify backend owns Prisma and remains independently deployable. Root scripts continue to provide one stable developer entry point while Docker, operational scripts, and documentation live in clearly named supporting directories.

**Tech Stack:** Next.js 15, React 19, NestJS 11, Fastify 5, PostgreSQL 16, Prisma 6, Redis 7, npm workspaces, TypeScript 5.7, PowerShell, Docker Compose.

## Global Constraints

- Preserve the current 30 official articles across exactly six categories.
- Preserve 26 researched source images and four fallback SVG images.
- Do not change public frontend routes, API routes, article slugs, category slugs, or response shapes.
- Do not modify or clean the live PostgreSQL database.
- Do not convert the NestJS/Fastify backend to a Vercel Function.
- Vercel Root Directory must be `apps/frontend`.
- Keep frontend API access environment-driven through `API_BASE_URL`.
- Do not add an empty shared `packages/` abstraction.
- Delete only the obsolete screenshots and generated files explicitly approved in the design.
- Start from synchronized commit `980bec9` or a descendant containing the official-news pipeline.

---

## File Structure and Responsibilities

### Deployable applications

- `apps/frontend/`: Next.js App Router pages, components, frontend tests, API client, and public article images.
- `apps/backend/`: NestJS/Fastify application, backend tests, and the backend-owned Prisma schema, migrations, and seed.

### Supporting directories

- `infrastructure/docker-compose.yml`: local PostgreSQL and Redis only.
- `scripts/`: official-news import, image synchronization, verification, and shared TypeScript helpers.
- `scripts/research/`: Python utilities used to produce research manifests.
- `docs/architecture/`: project specification and technical architecture.
- `docs/delivery/`: implementation, testing, and historical progress records.
- `docs/decisions/specs/`: approved design documents.
- `docs/decisions/plans/`: implementation plans.
- `docs/research/`: source-validation manifests and research reports.
- `docs/internal/`: internal project operating notes.
- `mockups/`: exactly eight curated UI reference screenshots and one README.

### Files modified in place

- `package.json`: renamed workspaces, stable root commands, and explicit Prisma paths.
- `package-lock.json`: regenerated workspace entries.
- `.gitignore`: generated artifact exclusions.
- `.env.example`: environment contract, unchanged values unless comments require path clarification.
- `README.md`: new paths, Docker commands, Prisma commands, and deployment boundary.

---

### Task 1: Rename the Deployable Applications and Repair npm Workspaces

**Files:**

- Move: `apps/web/` → `apps/frontend/`
- Move: `apps/api/` → `apps/backend/`
- Modify: `package.json`
- Regenerate: `package-lock.json`
- Modify: `apps/frontend/test/news-presentation-source.spec.ts`
- Modify: `apps/frontend/test/news-route-source.spec.ts`
- Modify: `scripts/lib/official-news-data.ts`
- Modify: `scripts/sync-researched-news-images.ts`

**Interfaces:**

- Consumes: current workspace names `apps/web` and `apps/api`.
- Produces: npm workspaces `apps/frontend` and `apps/backend`; root commands continue to use the existing `*:web` and `*:api` names.

- [ ] **Step 1: Record the pre-move baseline**

Run:

```powershell
git status --short
git rev-parse --short HEAD
npm.cmd run test:web
npm.cmd run test:api
```

Expected:

- Working tree is clean.
- HEAD is `003a8a0` or a descendant of `980bec9`.
- Frontend reports 18 passing tests.
- Backend reports 12 passing tests.

- [ ] **Step 2: Write and run a failing structure assertion**

Run:

```powershell
$required = @(
  'apps/frontend/package.json',
  'apps/backend/package.json'
)
$missing = $required | Where-Object { -not (Test-Path -LiteralPath $_) }
if ($missing.Count -gt 0) {
  throw "Missing target paths: $($missing -join ', ')"
}
```

Expected: FAIL because both target application directories do not exist yet.

- [ ] **Step 3: Verify exact move targets and rename the applications**

Run:

```powershell
$repo = (Resolve-Path '.').Path
$web = (Resolve-Path 'apps/web').Path
$api = (Resolve-Path 'apps/api').Path
if (-not $web.StartsWith($repo) -or -not $api.StartsWith($repo)) {
  throw 'Application paths resolved outside the repository'
}
if (Test-Path 'apps/frontend') { throw 'apps/frontend already exists' }
if (Test-Path 'apps/backend') { throw 'apps/backend already exists' }
git mv -- 'apps/web' 'apps/frontend'
git mv -- 'apps/api' 'apps/backend'
```

Expected: both Git-tracked directory trees appear under their new names.

- [ ] **Step 4: Update root workspace and command paths**

Change `package.json` to retain the public script names while pointing them at the new directories:

```json
{
  "name": "myfuture-news-test",
  "private": true,
  "workspaces": [
    "apps/frontend",
    "apps/backend"
  ],
  "scripts": {
    "dev:web": "npm --workspace apps/frontend run dev",
    "dev:api": "npm --workspace apps/backend run dev",
    "build:web": "npm --workspace apps/frontend run build",
    "build:api": "npm --workspace apps/backend run build",
    "build": "npm run build:web && npm run build:api",
    "typecheck": "npm run typecheck:web && npm run typecheck:api",
    "test:web": "tsx --test apps/frontend/test/**/*.spec.ts",
    "test:api": "tsx --test apps/backend/test/**/*.spec.ts",
    "typecheck:web": "npm --workspace apps/frontend run typecheck",
    "typecheck:api": "npm --workspace apps/backend run typecheck",
    "db:validate": "prisma validate --schema apps/backend/prisma/schema.prisma",
    "db:migrate": "prisma migrate dev --schema apps/backend/prisma/schema.prisma",
    "db:migrate:deploy": "prisma migrate deploy --schema apps/backend/prisma/schema.prisma",
    "db:seed": "prisma db seed --schema apps/backend/prisma/schema.prisma",
    "db:generate": "prisma generate --schema apps/backend/prisma/schema.prisma",
    "sync:news-images": "tsx scripts/sync-researched-news-images.ts",
    "import:official-news": "tsx scripts/import-official-news.ts",
    "import:official-news:dry-run": "tsx scripts/import-official-news.ts --dry-run"
  },
  "prisma": {
    "seed": "npx tsx apps/backend/prisma/seed.ts"
  }
}
```

Keep the existing `dependencies` and `devDependencies` blocks unchanged.

- [ ] **Step 5: Update active source and test path literals**

In `apps/frontend/test/news-presentation-source.spec.ts`, replace each `apps/web/` literal with `apps/frontend/`.

In `apps/frontend/test/news-route-source.spec.ts`, replace each `apps/web/` literal with `apps/frontend/`.

In `scripts/lib/official-news-data.ts`, use:

```ts
return path.join(
  workspaceRoot,
  'apps/frontend/public',
  webPath.replace(/^\//, ''),
);
```

and:

```ts
path.join(
  workspaceRoot,
  'apps/frontend/public/images/news/researched/manifest.json',
);
```

In `scripts/sync-researched-news-images.ts`, update the source import:

```ts
import {
  extensionForContentType,
  extractOgImage,
} from '../apps/frontend/lib/source-image';
```

and change the output path segments from `'apps', 'web'` to:

```ts
'apps',
'frontend',
```

- [ ] **Step 6: Regenerate workspace lockfile metadata**

Run:

```powershell
npm.cmd install --package-lock-only
```

Expected: exit code 0 and `package-lock.json` contains `apps/frontend` and `apps/backend` workspace entries.

- [ ] **Step 7: Re-run the structure assertion and focused tests**

Run:

```powershell
$required = @(
  'apps/frontend/package.json',
  'apps/backend/package.json'
)
$missing = $required | Where-Object { -not (Test-Path -LiteralPath $_) }
if ($missing.Count -gt 0) {
  throw "Missing target paths: $($missing -join ', ')"
}
if (Test-Path 'apps/web') { throw 'Old apps/web directory remains' }
if (Test-Path 'apps/api') { throw 'Old apps/api directory remains' }
npm.cmd run test:web
npm.cmd run test:api
npm.cmd run typecheck
```

Expected: structure assertion succeeds, 18 frontend tests pass, 12 backend tests pass, and both TypeScript checks pass.

- [ ] **Step 8: Commit the application rename**

Run:

```powershell
git add -- apps package.json package-lock.json scripts/lib/official-news-data.ts scripts/sync-researched-news-images.ts
git diff --cached --check
git commit -m "refactor: separate frontend and backend applications"
```

Expected: one commit containing the two directory renames and all workspace repairs.

---

### Task 2: Move Prisma Under the Backend and Repair Data Tooling

**Files:**

- Move: `prisma/` → `apps/backend/prisma/`
- Modify: `apps/backend/prisma/seed.ts`
- Modify: `scripts/import-official-news.ts`
- Modify: `scripts/phase3-apply-and-verify.ps1`
- Modify: `package.json` if Task 1 revealed Prisma CLI compatibility adjustments

**Interfaces:**

- Consumes: official-news data from `scripts/lib/official-news-data.ts`.
- Produces: canonical Prisma schema path `apps/backend/prisma/schema.prisma` and seed path `apps/backend/prisma/seed.ts`.

- [ ] **Step 1: Write and run a failing Prisma ownership assertion**

Run:

```powershell
if (-not (Test-Path 'apps/backend/prisma/schema.prisma')) {
  throw 'Backend does not own the Prisma schema'
}
if (Test-Path 'prisma/schema.prisma') {
  throw 'Legacy root Prisma schema remains'
}
```

Expected: FAIL because Prisma is still at the repository root.

- [ ] **Step 2: Verify and move the Prisma directory**

Run:

```powershell
$repo = (Resolve-Path '.').Path
$source = (Resolve-Path 'prisma').Path
if (-not $source.StartsWith($repo)) {
  throw 'Prisma path resolved outside the repository'
}
if (Test-Path 'apps/backend/prisma') {
  throw 'apps/backend/prisma already exists'
}
git mv -- 'prisma' 'apps/backend/prisma'
```

Expected: schema, both migrations, migration lock, and seed move together.

- [ ] **Step 3: Repair the seed import**

In `apps/backend/prisma/seed.ts`, change the official-news data import to:

```ts
import {
  CATEGORY_META,
  loadOfficialArticles,
  OFFICIAL_CATEGORY_ORDER,
  type OfficialArticleSeed,
} from '../../../scripts/lib/official-news-data';
```

- [ ] **Step 4: Repair workspace and environment discovery in the import command**

In `scripts/import-official-news.ts`, change the schema sentinel to:

```ts
if (
  existsSync(
    path.join(candidate, 'apps/backend/prisma/schema.prisma'),
  )
) {
  return candidate;
}
```

Change both backend environment candidates to:

```ts
path.join(root, 'apps/backend/.env')
```

The root `.env` remains the first environment source.

- [ ] **Step 5: Update the Windows apply-and-verify script**

In `scripts/phase3-apply-and-verify.ps1`, define:

```powershell
$ComposeFile = "infrastructure\docker-compose.yml"
$PrismaSchema = "apps\backend\prisma\schema.prisma"
```

Update Docker invocations to:

```powershell
docker compose -f $ComposeFile up -d
docker compose -f $ComposeFile ps
```

Update Prisma invocations to:

```powershell
npx.cmd prisma validate --schema $PrismaSchema
npx.cmd prisma migrate deploy --schema $PrismaSchema
npx.cmd prisma generate --schema $PrismaSchema
npx.cmd prisma db seed --schema $PrismaSchema
```

Replace the stale database assertions with the official dataset contract:

```ts
const categories = await p.category.findMany({
  where: { isActive: true },
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
const published = await p.article.count({ where: { isPublished: true } });
const officialPerCategory = categories.map((category) => ({
  slug: category.slug,
  published: category._count.articles,
}));
console.log(JSON.stringify({ published, officialPerCategory }, null, 2));
if (categories.length !== 6) throw new Error('Expected 6 active categories');
if (published !== 30) throw new Error('Expected exactly 30 published articles');
if (officialPerCategory.some((item) => item.published !== 5)) {
  throw new Error('Expected exactly 5 published articles per category');
}
await p.$disconnect();
console.log('ALL DATA CHECKS PASSED');
```

Update the four fallback image paths from `apps\web` to `apps\frontend`.

- [ ] **Step 6: Run Prisma and data-tool verification**

Run:

```powershell
npm.cmd run db:validate
npm.cmd run db:generate
npm.cmd run import:official-news:dry-run
npm.cmd run test:api
npm.cmd run typecheck:api
```

Expected:

- Prisma schema validation succeeds.
- Prisma Client generation succeeds.
- Dry run reports 30 official articles and makes no database changes.
- 12 backend tests pass.
- Backend TypeScript check passes.

- [ ] **Step 7: Commit backend database ownership**

Run:

```powershell
git add -- apps/backend/prisma package.json package-lock.json scripts/import-official-news.ts scripts/phase3-apply-and-verify.ps1
git diff --cached --check
git commit -m "refactor: move Prisma into backend application"
```

Expected: one commit establishing the backend-owned database boundary.

---

### Task 3: Organize Infrastructure, Research Utilities, and Documentation

**Files:**

- Move: `docker-compose.yml` → `infrastructure/docker-compose.yml`
- Move: `md/content-research/build_clean_manifest.py` → `scripts/research/build_clean_manifest.py`
- Move: `md/content-research/build_data.py` → `scripts/research/build_data.py`
- Move: `md/content-research/build_full_manifest.py` → `scripts/research/build_full_manifest.py`
- Move: research JSON/Markdown artifacts → `docs/research/`
- Move: project and technical specifications → `docs/architecture/`
- Move: delivery records → `docs/delivery/`
- Move: `docs/superpowers/specs/` → `docs/decisions/specs/`
- Move: `docs/superpowers/plans/` → `docs/decisions/plans/`
- Move: `role/AI-NEWS-TEAM-LEAD.md` → `docs/internal/AI-NEWS-TEAM-LEAD.md`
- Modify: `scripts/sync-researched-news-images.ts`
- Modify: `README.md`
- Modify: moved Markdown files containing active path commands

**Interfaces:**

- Consumes: the current research manifest `manifest-codex-2026-07-23.json`.
- Produces: Docker entry point `infrastructure/docker-compose.yml` and canonical research manifest `docs/research/manifest-codex-2026-07-23.json`.

- [ ] **Step 1: Write and run a failing organization assertion**

Run:

```powershell
$required = @(
  'infrastructure/docker-compose.yml',
  'docs/architecture',
  'docs/delivery',
  'docs/decisions/specs',
  'docs/decisions/plans',
  'docs/research',
  'docs/internal',
  'scripts/research'
)
$missing = $required | Where-Object { -not (Test-Path -LiteralPath $_) }
if ($missing.Count -gt 0) {
  throw "Missing organized paths: $($missing -join ', ')"
}
```

Expected: FAIL because the supporting files still use their legacy locations.

- [ ] **Step 2: Create target directories through tracked placeholder-free moves**

Run:

```powershell
New-Item -ItemType Directory -Force `
  'infrastructure', `
  'docs/architecture', `
  'docs/delivery', `
  'docs/decisions/specs', `
  'docs/decisions/plans', `
  'docs/research', `
  'docs/internal', `
  'scripts/research' | Out-Null
```

Expected: all target directories exist inside the repository.

- [ ] **Step 3: Move infrastructure and research utilities**

Run:

```powershell
git mv -- 'docker-compose.yml' 'infrastructure/docker-compose.yml'
git mv -- 'md/content-research/build_clean_manifest.py' 'scripts/research/build_clean_manifest.py'
git mv -- 'md/content-research/build_data.py' 'scripts/research/build_data.py'
git mv -- 'md/content-research/build_full_manifest.py' 'scripts/research/build_full_manifest.py'
```

- [ ] **Step 4: Move architecture, delivery, and research records**

Run:

```powershell
git mv -- 'md/01-PROJECT-SPEC.md' 'docs/architecture/01-PROJECT-SPEC.md'
git mv -- 'md/02-TECHNICAL-ARCHITECTURE.md' 'docs/architecture/02-TECHNICAL-ARCHITECTURE.md'
git mv -- 'md/03-IMPLEMENTATION-PLAN.md' 'docs/delivery/03-IMPLEMENTATION-PLAN.md'
git mv -- 'md/04-TEST-CHECKLIST.md' 'docs/delivery/04-TEST-CHECKLIST.md'
git mv -- 'md/05-PROGRESS.md' 'docs/delivery/05-PROGRESS.md'
git mv -- 'md/06-ANTIGRAVITY-CONTENT-RESEARCH.md' 'docs/research/06-ANTIGRAVITY-CONTENT-RESEARCH.md'
git mv -- 'md/content-research/manifest-2026-07-23.json' 'docs/research/manifest-2026-07-23.json'
git mv -- 'md/content-research/manifest-codex-2026-07-23.json' 'docs/research/manifest-codex-2026-07-23.json'
git mv -- 'md/content-research/research-report-2026-07-23.md' 'docs/research/research-report-2026-07-23.md'
git mv -- 'md/content-research/research-report-codex-2026-07-23.md' 'docs/research/research-report-codex-2026-07-23.md'
git mv -- 'md/content-research/source-validation-codex-2026-07-23.json' 'docs/research/source-validation-codex-2026-07-23.json'
git mv -- 'role/AI-NEWS-TEAM-LEAD.md' 'docs/internal/AI-NEWS-TEAM-LEAD.md'
```

- [ ] **Step 5: Move decision records**

Run:

```powershell
Get-ChildItem 'docs/superpowers/specs' -File | ForEach-Object {
  git mv -- $_.FullName 'docs/decisions/specs/'
}
Get-ChildItem 'docs/superpowers/plans' -File | ForEach-Object {
  git mv -- $_.FullName 'docs/decisions/plans/'
}
```

Expected: this approved design and this implementation plan are retained under `docs/decisions/`.

- [ ] **Step 6: Update the image synchronization manifest path**

In `scripts/sync-researched-news-images.ts`, replace the source manifest path construction with:

```ts
const sourceManifestPath = path.join(
  workspaceRoot,
  'docs',
  'research',
  'manifest-codex-2026-07-23.json',
);
```

Inspect the moved Python utilities and update literal `md/content-research` output/input paths to `docs/research`. Keep generated reports and manifests out of `scripts/research`.

- [ ] **Step 7: Update root documentation and active commands**

Update `README.md` so setup commands use:

```powershell
docker compose -f infrastructure/docker-compose.yml up -d
docker compose -f infrastructure/docker-compose.yml ps
npm.cmd run db:validate
npm.cmd run db:generate
npm.cmd run db:migrate:deploy
npm.cmd run db:seed
```

Document:

```text
Frontend source: apps/frontend
Backend source: apps/backend
Prisma schema: apps/backend/prisma/schema.prisma
Vercel Root Directory: apps/frontend
```

Replace active `apps/web` and `apps/api` commands in the moved architecture/delivery documents with `apps/frontend` and `apps/backend`. Historical statements may retain old names only when explicitly labeled as historical.

- [ ] **Step 8: Validate Compose and organization**

Run:

```powershell
docker compose -f infrastructure/docker-compose.yml config --quiet
$required = @(
  'infrastructure/docker-compose.yml',
  'docs/architecture',
  'docs/delivery',
  'docs/decisions/specs',
  'docs/decisions/plans',
  'docs/research',
  'docs/internal',
  'scripts/research'
)
$missing = $required | Where-Object { -not (Test-Path -LiteralPath $_) }
if ($missing.Count -gt 0) {
  throw "Missing organized paths: $($missing -join ', ')"
}
```

Expected: Compose configuration is valid and every organized path exists.

- [ ] **Step 9: Commit repository organization**

Run:

```powershell
git add -- infrastructure scripts docs README.md
git diff --cached --check
git commit -m "chore: organize infrastructure and project documentation"
```

Expected: one commit containing only supporting-file organization and corresponding path repairs.

---

### Task 4: Remove Approved Obsolete Assets and Generated Files

**Files:**

- Move: `mockup/` → `mockups/`
- Modify: `mockups/README.md`
- Modify: `.gitignore`
- Delete: `myfuture-ban-tin.png`
- Delete: nine approved duplicate mockup screenshots
- Delete: `apps/frontend/tsconfig.tsbuildinfo`
- Remove if empty: `.agents/`, `md/`, `role/`, and `docs/superpowers/`

**Interfaces:**

- Consumes: the approved cleanup list from the design.
- Produces: exactly eight curated PNG mockups, 26 researched source images, and four fallback SVG images.

- [ ] **Step 1: Record protected runtime asset counts**

Run:

```powershell
$researched = Get-ChildItem 'apps/frontend/public/images/news/researched' -File |
  Where-Object { $_.Name -ne 'manifest.json' }
$fallbacks = Get-ChildItem 'apps/frontend/public/images/news' -File -Filter 'placeholder-*.svg'
if ($researched.Count -ne 26) {
  throw "Expected 26 researched images, found $($researched.Count)"
}
if ($fallbacks.Count -ne 4) {
  throw "Expected 4 fallback images, found $($fallbacks.Count)"
}
```

Expected: 26 researched images and four fallback images.

- [ ] **Step 2: Rename the curated mockup directory**

Run:

```powershell
if (Test-Path 'mockups') { throw 'mockups already exists' }
git mv -- 'mockup' 'mockups'
```

- [ ] **Step 3: Verify exact deletion targets**

Run:

```powershell
$deleteFiles = @(
  'myfuture-ban-tin.png',
  'mockups/01-ban-tin-overview-full.png',
  'mockups/02-toan-canh-full.png',
  'mockups/03-phap-ly-du-an-full.png',
  'mockups/04-quy-hoach-ha-tang-full.png',
  'mockups/05-lai-suat-tai-chinh-full.png',
  'mockups/06-thi-truong-gia-ca-full.png',
  'mockups/07-dau-tu-dong-tien-full.png',
  'mockups/08-cho-thue-full.png',
  'mockups/09-bai-viet-chi-tiet-full.png',
  'apps/frontend/tsconfig.tsbuildinfo'
)
$repo = (Resolve-Path '.').Path
foreach ($file in $deleteFiles) {
  if (-not (Test-Path -LiteralPath $file)) {
    throw "Approved deletion target is missing: $file"
  }
  $resolved = (Resolve-Path -LiteralPath $file).Path
  if (-not $resolved.StartsWith($repo)) {
    throw "Deletion target resolved outside repository: $file"
  }
}
```

Expected: every target exists and resolves inside the repository.

- [ ] **Step 4: Delete only the approved files**

Run:

```powershell
$deleteFiles = @(
  'myfuture-ban-tin.png',
  'mockups/01-ban-tin-overview-full.png',
  'mockups/02-toan-canh-full.png',
  'mockups/03-phap-ly-du-an-full.png',
  'mockups/04-quy-hoach-ha-tang-full.png',
  'mockups/05-lai-suat-tai-chinh-full.png',
  'mockups/06-thi-truong-gia-ca-full.png',
  'mockups/07-dau-tu-dong-tien-full.png',
  'mockups/08-cho-thue-full.png',
  'mockups/09-bai-viet-chi-tiet-full.png',
  'apps/frontend/tsconfig.tsbuildinfo'
)
Remove-Item -LiteralPath $deleteFiles -Force
```

Expected: no other runtime image or documentation file is removed.

- [ ] **Step 5: Ignore generated TypeScript build metadata**

Append this exact rule to `.gitignore` if it is not already present:

```gitignore
*.tsbuildinfo
```

Update `mockups/README.md` so it lists only:

```text
01-ban-tin-toan-canh-full.png
02-phap-ly-du-an-full.png
03-quy-hoach-ha-tang-full.png
04-lai-suat-tai-chinh-full.png
05-thi-truong-gia-ca-full.png
06-dau-tu-dong-tien-full.png
07-cho-thue-full.png
08-chi-tiet-bai-viet-full.png
```

- [ ] **Step 6: Remove empty legacy directories**

Run:

```powershell
$legacyDirectories = @('.agents', 'md', 'role', 'docs/superpowers')
foreach ($directory in $legacyDirectories) {
  if (Test-Path -LiteralPath $directory) {
    $children = Get-ChildItem -LiteralPath $directory -Force -Recurse
    if ($children.Count -eq 0) {
      Remove-Item -LiteralPath $directory -Force
    }
  }
}
```

Expected: only empty directories are removed.

- [ ] **Step 7: Assert curated and protected asset counts**

Run:

```powershell
$mockupPngs = Get-ChildItem 'mockups' -File -Filter '*.png'
$researched = Get-ChildItem 'apps/frontend/public/images/news/researched' -File |
  Where-Object { $_.Name -ne 'manifest.json' }
$fallbacks = Get-ChildItem 'apps/frontend/public/images/news' -File -Filter 'placeholder-*.svg'
if ($mockupPngs.Count -ne 8) {
  throw "Expected 8 curated mockups, found $($mockupPngs.Count)"
}
if ($researched.Count -ne 26) {
  throw "Expected 26 researched images, found $($researched.Count)"
}
if ($fallbacks.Count -ne 4) {
  throw "Expected 4 fallback images, found $($fallbacks.Count)"
}
if (git ls-files '*.tsbuildinfo') {
  throw 'Tracked tsbuildinfo remains'
}
```

Expected: 8 mockups, 26 researched images, four fallbacks, and no tracked TypeScript build cache.

- [ ] **Step 8: Commit the approved cleanup**

Run:

```powershell
git add -A -- .gitignore mockups myfuture-ban-tin.png apps/frontend/tsconfig.tsbuildinfo
git diff --cached --check
git commit -m "chore: remove obsolete visual assets"
```

Expected: Git records the mockup rename, exact approved deletions, and ignore rule.

---

### Task 5: Run Full Verification and Close Active Path Gaps

**Files:**

- Modify: only files found by verification to contain an active stale path.
- No database content changes.

**Interfaces:**

- Consumes: completed directory restructure.
- Produces: a clean, buildable monorepo ready for frontend UI/UX work and later Vercel configuration.

- [ ] **Step 1: Search active code and configuration for stale paths**

Run:

```powershell
$activeFiles = Get-ChildItem -Recurse -File |
  Where-Object {
    $_.FullName -notmatch '\\(node_modules|\.next|dist|\.git|docs|mockups)\\' -and
    $_.Extension -in @('.json', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.ps1', '.yml', '.yaml')
  }
$stale = $activeFiles | Select-String -Pattern 'apps/web|apps\\web|apps/api|apps\\api|prisma/schema\.prisma|prisma\\schema\.prisma'
if ($stale) {
  $stale | ForEach-Object {
    Write-Host "$($_.Path):$($_.LineNumber): $($_.Line.Trim())"
  }
  throw 'Active stale paths remain'
}
```

Expected: no active stale path is reported.

- [ ] **Step 2: Verify npm installation and Prisma**

Run:

```powershell
npm.cmd install
npm.cmd run db:validate
npm.cmd run db:generate
```

Expected: npm installation, Prisma validation, and Prisma Client generation exit successfully.

- [ ] **Step 3: Run all automated tests**

Run:

```powershell
npm.cmd run test:web
npm.cmd run test:api
```

Expected: 18 frontend tests and 12 backend tests pass.

- [ ] **Step 4: Run all TypeScript checks**

Run:

```powershell
npm.cmd run typecheck
```

Expected: frontend and backend TypeScript checks exit with code 0.

- [ ] **Step 5: Run both production builds**

Run:

```powershell
npm.cmd run build:web
npm.cmd run build:api
```

Expected:

- Next.js production build completes for `apps/frontend`.
- NestJS build emits `apps/backend/dist/src/main.js`.

- [ ] **Step 6: Validate infrastructure without mutating services**

Run:

```powershell
docker compose -f infrastructure/docker-compose.yml config --quiet
```

Expected: Compose configuration exits with code 0.

- [ ] **Step 7: Run read-only official-data verification**

Run:

```powershell
npm.cmd run import:official-news:dry-run
```

Expected: the command loads 30 official articles, prints audit output, and explicitly reports that no database changes were made.

- [ ] **Step 8: Verify repository shape and cleanliness**

Run:

```powershell
$required = @(
  'apps/frontend/package.json',
  'apps/backend/package.json',
  'apps/backend/prisma/schema.prisma',
  'infrastructure/docker-compose.yml',
  'docs/architecture',
  'docs/delivery',
  'docs/decisions',
  'docs/research',
  'docs/internal',
  'scripts/research',
  'mockups'
)
$forbidden = @(
  'apps/web',
  'apps/api',
  'prisma',
  'docker-compose.yml',
  'mockup',
  'myfuture-ban-tin.png'
)
$missing = $required | Where-Object { -not (Test-Path -LiteralPath $_) }
$remaining = $forbidden | Where-Object { Test-Path -LiteralPath $_ }
if ($missing.Count -gt 0) {
  throw "Missing required paths: $($missing -join ', ')"
}
if ($remaining.Count -gt 0) {
  throw "Legacy paths remain: $($remaining -join ', ')"
}
git status --short
```

Expected: all required paths exist, no forbidden path remains, and only intentional verification fixes are uncommitted.

- [ ] **Step 9: Commit any verification-only fixes**

If Step 1 through Step 8 required path corrections, run:

```powershell
git add -A
git diff --cached --check
git commit -m "fix: close monorepo restructure path gaps"
```

If there are no fixes, do not create an empty commit.

- [ ] **Step 10: Capture final evidence**

Run:

```powershell
git status --short
git log -6 --oneline --decorate
```

Expected: clean working tree and a short commit series covering application rename, Prisma ownership, repository organization, cleanup, and any final verification fix.

---

## Completion Criteria

The work may be reported complete only when:

- `apps/frontend` is independently buildable and is the documented Vercel Root Directory.
- `apps/backend` is independently buildable and owns `prisma/`.
- All 30 automated tests pass.
- Both production builds and both TypeScript checks pass.
- Prisma validates and generates from `apps/backend/prisma/schema.prisma`.
- Docker Compose validates from `infrastructure/docker-compose.yml`.
- The official-news dry run proves it makes no database changes.
- All 26 researched images and four fallback SVGs are retained.
- Exactly eight curated mockup PNGs remain.
- No obsolete screenshot, tracked `*.tsbuildinfo`, or active old path remains.
- The Git working tree is clean.
