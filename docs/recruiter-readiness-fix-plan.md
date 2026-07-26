# Recruiter Readiness Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the remaining release-gate defects, complete the missing production verification, and produce evidence that MyFuture News is safe to submit to the recruiter.

**Architecture:** Keep the application architecture unchanged. Fix the release tooling at its source, add a conventional root test command, enable the official Next.js lint rules, and finish with a read-only production verification run. Responsive and deployment-SHA checks are verification activities; runtime code should change only if those checks expose a real user-visible defect.

**Tech Stack:** npm workspaces, Next.js 15, React 19, NestJS 11, Fastify 5, PostgreSQL, Prisma 6, Redis/ioredis, Node test runner, TypeScript, ESLint 9, Vercel.

## Global Constraints

- Do not delete, reseed, update, or otherwise mutate production data during verification.
- Do not commit `.env`, Vercel tokens, database credentials, Redis credentials, or screenshots containing secrets.
- Keep the existing monorepo boundaries: `apps/frontend` and `apps/backend`.
- Preserve the current production routes and API response contracts.
- Treat “Bản tin 7 chuyên mục” as one overview tab plus six persisted API categories.
- Redis remains cache-aside only; do not add a queue solely to make the technology list look larger.
- Do not deploy until local quality gates and production smoke tests are green.
- Do not merge or push directly to `main`; use a reviewed branch and confirm the final SHA.
- All user-visible Vietnamese text must remain valid UTF-8.
- Add no new runtime dependency unless a verified defect requires it.

---

## 1. Audit Baseline

This plan is based on the final read-only audit performed on 2026-07-26.

### Git baseline

- GitHub `main`: `0d1f368288c9dbf611d991b8dad8909e140b52d6`
- Latest commit subject: `merge: add article search and reading enhancements`
- Local audited branch: `codex/frontend-editorial-ui`
- Local HEAD, local `main`, cached `origin/main`, GitHub API, and `git ls-remote` all returned the same SHA.
- Working tree was clean after the audit.
- `.env` was ignored; no tracked secret file or private key was found.

### Local quality baseline

`npm.cmd run check` completed with exit code `0`:

- ESLint passed.
- Prisma schema validation passed.
- Frontend tests: 97 passed, 0 failed.
- Backend tests: 62 passed, 0 failed.
- Frontend and backend typecheck passed.
- Next.js and NestJS builds passed.

Known local tooling issues:

1. `npm.cmd test` failed because the root package has no `test` script.
2. Next.js build printed that the Next.js ESLint plugin was not detected.

### Production baseline

- API health returned HTTP 200 with API, PostgreSQL, and Redis all `up`.
- Categories returned six persisted categories and 42 articles in total.
- Overview and category pagination returned real page-two data.
- Search with and without Vietnamese diacritics returned equivalent ranked results.
- A one-character search returned HTTP 400 with `INVALID_REQUEST`.
- Frontend BFF search returned HTTP 200 JSON.
- Three article detail endpoints returned HTTP 200 with content and provenance.
- Missing API article returned HTTP 404 with `ARTICLE_NOT_FOUND`.
- `/ban-tin.html` returned HTTP 308 to `/ban-tin`.
- The web not-found page displayed professional 404 content and `noindex`, but the streamed HTML response status was HTTP 200.
- Raw UTF-8 responses and source files did not contain user-visible mojibake.

Known production verification issue:

`npm run smoke:production` reached the search-page assertion and failed with:

```text
search page must not fall through to article not-found
```

The visible server-rendered markup contained the successful search heading and results. The false failure was caused by serialized Next.js RSC script payloads that also contained hidden not-found fallback text.

---

## 2. File Map

Expected files for the remediation:

- Create: `scripts/lib/production-smoke-html.ts`
  - Pure helper for removing serialized `<script>` payloads from server HTML before visible-content assertions.
- Create: `apps/frontend/test/production-smoke-html.spec.ts`
  - Regression tests for search HTML containing successful visible content and hidden RSC fallbacks.
- Modify: `scripts/smoke-production.ts`
  - Use visible markup for search-page assertions.
- Modify: `package.json`
  - Add the conventional root `test` script.
- Modify: `apps/backend/test/ci-source.spec.ts`
  - Lock the root test contract and Next.js lint configuration into source tests.
- Modify: `eslint.config.mjs`
  - Register the official Next.js ESLint plugin for frontend source files.
- Modify: `package.json`
  - Add `@next/eslint-plugin-next` as a development dependency matching Next.js 15.
- Modify: `package-lock.json`
  - Record the lint plugin dependency deterministically.
- Modify: `scripts/release-checklist.md`
  - Add responsive, browser-console, SHA, encoding, and final evidence gates.
- Modify if needed after visual verification:
  - Only the specific frontend component or CSS module proven defective by screenshots or browser measurements.

Files that should not change unless a new verified defect is found:

- `apps/backend/prisma/schema.prisma`
- `apps/backend/prisma/migrations/**`
- `apps/backend/prisma/seed.ts`
- `data/news/**`
- Production environment files and provider dashboards, except for correcting a missing or wrong environment value.

---

## 3. Priority and Submission Rule

| Priority | Work item | Submission impact |
|---|---|---|
| P1 | Fix the false-negative production smoke test | Must be green before submission |
| P2 | Add a root `npm test` command | Prevents reviewer-facing command failure |
| P2 | Verify responsive UI, console, keyboard, and direct navigation | Required evidence before declaring UI ready |
| P2 | Verify GitHub/Vercel deployment SHAs and production environment mapping | Prevents submitting a stale deployment |
| P2 | Decide and document streamed web 404 status behavior | Avoids an unexplained HTTP-status surprise |
| P3 | Enable official Next.js ESLint rules and remove the build warning | Quality and maintainability polish |
| P3 | Consolidate the final release checklist and evidence record | Makes the submission reproducible |

The final result is **NO-GO** while any P1 remains, while production health is not `ok`, or while web/API production is not traceable to the intended commits.

---

### Task 1: Fix the Search Production Smoke False-Positive

**Files:**

- Create: `scripts/lib/production-smoke-html.ts`
- Create: `apps/frontend/test/production-smoke-html.spec.ts`
- Modify: `scripts/smoke-production.ts:256-268`

**Interfaces:**

- Produces: `visibleServerMarkup(html: string): string`
- Consumes: raw HTML returned by `expectPublicHtml`
- Preserves: existing production routes, API requests, and smoke-test output schema

- [ ] **Step 1: Add a failing regression test**

Create `apps/frontend/test/production-smoke-html.spec.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { visibleServerMarkup } from '../../../scripts/lib/production-smoke-html';

test('production smoke ignores not-found copy serialized inside RSC scripts', () => {
  const html = [
    '<main>',
    '<h1>Kết quả tìm kiếm</h1>',
    '<p>Tìm thấy 36 bài viết cho “hung yen”.</p>',
    '</main>',
    '<script>self.__next_f.push(["Không tìm thấy nội dung"])</script>',
  ].join('');

  const visible = visibleServerMarkup(html);

  assert.match(visible, /Kết quả tìm kiếm/);
  assert.doesNotMatch(visible, /Không tìm thấy nội dung/);
});

test('production smoke retains a visible not-found page', () => {
  const html =
    '<main><h1>Không tìm thấy nội dung</h1><p>Quay lại Bản tin</p></main>';

  assert.match(visibleServerMarkup(html), /Không tìm thấy nội dung/);
});
```

- [ ] **Step 2: Run the test and confirm the red state**

Run:

```powershell
npm.cmd run test:web -- --test-name-pattern "production smoke"
```

Expected: FAIL because `scripts/lib/production-smoke-html.ts` does not exist.

- [ ] **Step 3: Add the minimal HTML helper**

Create `scripts/lib/production-smoke-html.ts`:

```ts
export function visibleServerMarkup(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
}
```

This deliberately removes only script elements. It must not remove hidden HTML elements, headings, error panels, or other markup that a browser could render.

- [ ] **Step 4: Re-run the focused regression tests**

Run:

```powershell
npm.cmd run test:web -- --test-name-pattern "production smoke"
```

Expected: 2 tests pass, 0 fail.

- [ ] **Step 5: Update the production smoke assertion**

In `scripts/smoke-production.ts`, import the helper:

```ts
import { visibleServerMarkup } from './lib/production-smoke-html';
```

Replace the search assertions with:

```ts
const visibleSearchHtml = visibleServerMarkup(searchHtml);

assert.doesNotMatch(
  visibleSearchHtml,
  /Không tìm thấy nội dung|không tồn tại hoặc bài viết chưa được xuất bản/i,
  'search page must not render article not-found chrome',
);
assert.match(
  visibleSearchHtml,
  /Kết quả tìm kiếm|Tìm thấy/i,
  'search page must render search chrome',
);
```

- [ ] **Step 6: Run the full frontend tests**

Run:

```powershell
npm.cmd run test:web
```

Expected: all existing 97 tests plus the 2 new tests pass.

- [ ] **Step 7: Run the production smoke test**

Run:

```powershell
$env:WEB_BASE_URL="https://myfuture-news-web.vercel.app"
$env:API_BASE_URL="https://myfuture-news-api.vercel.app/api"
npm.cmd run smoke:production
```

Expected: exit code `0` and JSON output containing:

```json
{
  "status": "ok",
  "categories": 6,
  "articles": 42
}
```

The search hit counts may change as data changes, but they must remain positive and the BFF data array must be present.

- [ ] **Step 8: Review the diff**

Run:

```powershell
git diff --check
git diff -- scripts/smoke-production.ts scripts/lib/production-smoke-html.ts apps/frontend/test/production-smoke-html.spec.ts
```

Expected: no whitespace errors; no application runtime behavior changed.

- [ ] **Step 9: Commit after review**

Suggested commit:

```text
test(smoke): ignore serialized RSC fallback payloads
```

---

### Task 2: Add the Conventional Root Test Command

**Files:**

- Modify: `package.json`
- Modify: `apps/backend/test/ci-source.spec.ts`
- Modify: `README.md` only if the documented command list is updated to prefer `npm test`

**Interfaces:**

- Produces: root command `npm test`
- Delegates to: `npm run test:web` followed by `npm run test:api`

- [ ] **Step 1: Add a failing package-script contract test**

Append to `apps/backend/test/ci-source.spec.ts`:

```ts
test('root npm test runs both application test suites', () => {
  const packageJson = JSON.parse(
    readFileSync(path.join(root, 'package.json'), 'utf8'),
  ) as { scripts?: Record<string, string> };

  assert.equal(
    packageJson.scripts?.test,
    'npm run test:web && npm run test:api',
  );
});
```

- [ ] **Step 2: Verify the contract test fails**

Run:

```powershell
npm.cmd run test:api -- --test-name-pattern "root npm test"
```

Expected: FAIL because `scripts.test` is absent.

- [ ] **Step 3: Add the root script**

Add this entry inside the root `package.json` `scripts` object:

```json
"test": "npm run test:web && npm run test:api"
```

Keep `test:web` and `test:api` unchanged so CI and focused development commands remain available.

- [ ] **Step 4: Verify the focused contract test**

Run:

```powershell
npm.cmd run test:api -- --test-name-pattern "root npm test"
```

Expected: PASS.

- [ ] **Step 5: Verify the reviewer-facing command**

Run:

```powershell
npm.cmd test
```

Expected:

- Frontend suite passes.
- Backend suite passes.
- Exit code `0`.

- [ ] **Step 6: Confirm documentation is consistent**

Ensure the README test section contains either `npm test` or the explicit `test:web` and `test:api` commands. If both are shown, explain that `npm test` runs both suites and the focused scripts are available for debugging.

- [ ] **Step 7: Commit after review**

Suggested commit:

```text
chore(test): add root test command
```

---

### Task 3: Enable Official Next.js ESLint Rules

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `eslint.config.mjs`
- Modify: `apps/backend/test/ci-source.spec.ts`

**Interfaces:**

- Produces: ESLint plugin key `@next/next` for `apps/frontend/**/*.{js,jsx,ts,tsx}`
- Preserves: existing TypeScript ESLint rules and zero-warning policy

- [ ] **Step 1: Add a failing source-contract test**

Append to `apps/backend/test/ci-source.spec.ts`:

```ts
test('frontend lint enables the official Next.js rules', () => {
  const packageJson = JSON.parse(
    readFileSync(path.join(root, 'package.json'), 'utf8'),
  ) as { devDependencies?: Record<string, string> };
  const eslintSource = readFileSync(
    path.join(root, 'eslint.config.mjs'),
    'utf8',
  );

  assert.ok(packageJson.devDependencies?.['@next/eslint-plugin-next']);
  assert.match(eslintSource, /@next\/eslint-plugin-next/);
  assert.match(eslintSource, /'@next\/next'/);
  assert.match(eslintSource, /core-web-vitals/);
});
```

- [ ] **Step 2: Verify the source-contract test fails**

Run:

```powershell
npm.cmd run test:api -- --test-name-pattern "official Next.js rules"
```

Expected: FAIL because the dependency and config are absent.

- [ ] **Step 3: Install the plugin matching the frontend major/minor**

Run:

```powershell
npm.cmd install --save-dev @next/eslint-plugin-next@^15.5.21
```

Expected: `package.json` and `package-lock.json` update; no runtime dependency is added.

- [ ] **Step 4: Register the plugin in the flat ESLint config**

At the top of `eslint.config.mjs`, add:

```js
import nextPlugin from '@next/eslint-plugin-next';
```

Add this configuration before the file-specific exceptions:

```js
{
  files: ['apps/frontend/**/*.{js,jsx,ts,tsx}'],
  plugins: {
    '@next/next': nextPlugin,
  },
  rules: {
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs['core-web-vitals'].rules,
  },
},
```

- [ ] **Step 5: Run the focused contract test**

Run:

```powershell
npm.cmd run test:api -- --test-name-pattern "official Next.js rules"
```

Expected: PASS.

- [ ] **Step 6: Run lint and address only real Next.js findings**

Run:

```powershell
npm.cmd run lint
```

Expected: exit code `0`.

If a Next.js rule reports a real issue, change only the implicated frontend file, add or update a focused test, and re-run lint. Do not suppress a rule globally merely to obtain a green command.

- [ ] **Step 7: Verify the Next.js build warning is gone**

Run:

```powershell
npm.cmd run build:web
```

Expected:

- Exit code `0`.
- No “Next.js plugin was not detected” warning.
- `/ban-tin`, category, search, BFF, and article routes remain in the build output.

- [ ] **Step 8: Commit after review**

Suggested commit:

```text
chore(lint): enable Next.js core web vitals rules
```

---

### Task 4: Complete Browser and Responsive Verification

**Files:**

- Modify only if a defect is reproduced:
  - The specific route component under `apps/frontend/app/ban-tin/**`
  - The specific shared component under `apps/frontend/components/**`
  - Its colocated CSS module
  - A focused source or behavior test under `apps/frontend/test/**`
- Record results in: `scripts/release-checklist.md`

**Interfaces:**

- Consumes: deployed frontend and API URLs
- Produces: a dated pass/fail evidence matrix for desktop, laptop, tablet, and mobile

- [ ] **Step 1: Open a clean browser session**

Use an incognito/private window with browser extensions disabled. Test against:

```text
https://myfuture-news-web.vercel.app/ban-tin
```

Keep DevTools Console and Network panels open. Enable “Preserve log”.

- [ ] **Step 2: Verify the four required viewport widths**

Run the complete route matrix at:

| Profile | Width |
|---|---:|
| Desktop | 1440px |
| Laptop | 1280px |
| Tablet | 768px |
| Mobile | 390px |

For every viewport, open:

```text
/ban-tin
/ban-tin?page=2
/ban-tin/chuyen-muc/phap-ly-du-an
/ban-tin/chuyen-muc/phap-ly-du-an?page=2
/ban-tin/tim-kiem?q=hung%20yen
/ban-tin/hung-yen-truc-bac-nam-89km-thanh-pho-truc-thuoc-trung-uong
```

Expected:

- No horizontal scrollbar.
- No clipped or overlapping Vietnamese text.
- Images retain their aspect ratio.
- Desktop sidebar does not cover article content.
- Tablet/mobile side content moves below the main article or collapses cleanly.
- Header, category navigation, breadcrumbs, pagination, and footer remain usable.

- [ ] **Step 3: Measure overflow instead of relying only on screenshots**

Run in the browser console on every route and viewport:

```js
({
  viewport: document.documentElement.clientWidth,
  documentWidth: document.documentElement.scrollWidth,
  hasHorizontalOverflow:
    document.documentElement.scrollWidth >
    document.documentElement.clientWidth,
});
```

Expected:

```json
{
  "hasHorizontalOverflow": false
}
```

- [ ] **Step 4: Verify keyboard and focus behavior**

Without using the mouse:

1. Tab through the header, search launcher, category tabs, article cards, pagination, and footer links.
2. Open search with its visible launcher and documented shortcut, if the shortcut is displayed.
3. Submit `hung yen`.
4. Open one result.
5. Navigate back and move to page 2.

Expected:

- Every interactive element receives a visible focus indicator.
- Focus order follows visual order.
- No keyboard trap occurs.
- Icon-only controls have accessible labels.
- Enter and Space trigger controls according to their semantic role.

- [ ] **Step 5: Verify console and network cleanliness**

Expected:

- No React hydration error.
- No uncaught exception.
- No failed API request for the primary flow.
- No CORS rejection.
- No request to `localhost`.
- Image optimizer requests return HTTP 200.
- Missing article shows intentional 404 content without a stack trace or database detail.

- [ ] **Step 6: Verify three different article pages**

Open these examples:

```text
/ban-tin/hung-yen-truc-bac-nam-89km-thanh-pho-truc-thuoc-trung-uong
/ban-tin/luat-phat-trien-do-thi-khu-kinh-te-dac-biet-2026
/ban-tin/hai-luat-nha-o-kinh-doanh-bat-dong-san-sua-doi-cap-bach-2026
```

Expected for each:

- The route starts at the top of the article.
- Title, excerpt, cover image, date, author, source, and category are visible.
- Image alternative text exists in the DOM.
- “Đề xuất” and “Khám phá” content is usable and does not obscure the article.
- Related, previous, next, breadcrumb, and back links navigate to valid routes.

- [ ] **Step 7: Capture evidence**

Save screenshots outside tracked source directories, or attach them to the submission notes without committing them. Capture:

- Overview at 1440px.
- Category page 2 at 1280px.
- Search results at 768px.
- Article detail at 390px.
- DevTools Console with zero severe errors.
- Network request showing BFF search HTTP 200 JSON.

- [ ] **Step 8: Fix only reproduced defects**

For every visual defect:

1. Record route, viewport, exact reproduction steps, screenshot, and console output.
2. Add a focused test that fails against the current source or behavior.
3. Change the smallest component/CSS module responsible.
4. Re-run the focused test, `npm run test:web`, `npm run lint`, and `npm run build:web`.
5. Repeat the route at all four viewport widths to rule out regressions.

---

### Task 5: Verify GitHub and Vercel Deployment Identity

**Files:**

- No source file should change.
- Record non-secret evidence in `scripts/release-checklist.md`.

**Interfaces:**

- Consumes: GitHub branch SHA, Vercel web deployment SHA, Vercel API deployment SHA
- Produces: an explicit explanation when web and API intentionally use different commits

- [ ] **Step 1: Record the final GitHub main SHA**

Run after all approved remediation commits are merged:

```powershell
git fetch origin
git rev-parse origin/main
git ls-remote origin refs/heads/main
```

Expected: all SHA values are identical.

- [ ] **Step 2: Verify the Web deployment**

In the Vercel project for `myfuture-news-web`, record:

- Production deployment status: `Ready`
- Git branch
- Git commit SHA
- Deployment timestamp
- Production alias: `myfuture-news-web.vercel.app`

Expected: branch and SHA match the intended frontend release commit.

- [ ] **Step 3: Verify the API deployment**

In the Vercel project for `myfuture-news-api`, record:

- Production deployment status: `Ready`
- Git branch
- Git commit SHA
- Deployment timestamp
- Production alias: `myfuture-news-api.vercel.app`

Expected: branch and SHA match the intended backend release commit.

- [ ] **Step 4: Verify environment-variable presence without exposing values**

For the API project, confirm these names exist in Production:

```text
DATABASE_URL
DIRECT_URL
REDIS_URL
WEB_ORIGIN
NODE_ENV
```

For the web project, confirm:

```text
API_BASE_URL
NODE_ENV
```

Expected:

- `API_BASE_URL` targets `https://myfuture-news-api.vercel.app/api`.
- `WEB_ORIGIN` targets `https://myfuture-news-web.vercel.app`.
- Neither value targets localhost.
- No value is copied into the repository or evidence document.

- [ ] **Step 5: Explain split deployment SHAs if necessary**

Web and API SHAs may differ only when the final changes affect one project exclusively. Record:

- Both full SHAs.
- The files changed between them.
- Why the unchanged project did not require redeployment.
- A successful compatibility smoke test across those two deployments.

If that explanation cannot be made, redeploy both projects from the same final SHA.

---

### Task 6: Resolve the Web 404 Status Decision

**Files:**

- Prefer documentation only: `scripts/release-checklist.md`
- Modify runtime route files only if the recruiter explicitly requires HTTP 404 for streamed web pages:
  - `apps/frontend/app/ban-tin/[articleSlug]/page.tsx`
  - `apps/frontend/app/ban-tin/[articleSlug]/not-found.tsx`

**Interfaces:**

- Preserves: professional not-found UI and `noindex`
- Decision: accept documented streamed HTTP 200 behavior, or prove a framework-supported HTTP 404 path without degrading UX

- [ ] **Step 1: Verify current behavior**

Run:

```powershell
curl.exe -sS -D - -o NUL --max-time 20 https://myfuture-news-web.vercel.app/ban-tin/khong-ton-tai
curl.exe -sS -D - --max-time 20 https://myfuture-news-api.vercel.app/api/articles/missing-article
```

Expected baseline:

- Web: streamed response HTTP 200, visible not-found UI, `noindex`.
- API: HTTP 404 with `ARTICLE_NOT_FOUND`.

- [ ] **Step 2: Apply the requirement decision**

For the stated recruiter requirement, the professional browser 404 UI and API 404 satisfy the functional requirement. Accept the web HTTP 200 only when all conditions below are true:

- Not-found content is visible and professional.
- `meta name="robots"` includes `noindex`.
- No stack trace, database error, or secret is exposed.
- Search and valid article routes never display not-found content.
- The release notes document that Next.js streaming can send HTTP 200 after headers are committed.

- [ ] **Step 3: Avoid unsafe status-code workarounds**

Do not:

- Replace the App Router not-found flow with a client-only redirect.
- Return a fake article shell with HTTP 404.
- Disable streaming globally.
- Add middleware that guesses article existence.
- Duplicate the API article lookup solely to set a status header.

If a strict web HTTP 404 becomes mandatory, first build a focused reproduction using the current Next.js version and choose a documented framework-supported solution. Re-run metadata, loading, direct navigation, and performance checks before accepting it.

---

### Task 7: Finalize the Release Checklist

**Files:**

- Modify: `scripts/release-checklist.md`
- Modify: `README.md` only if public commands or URLs changed

**Interfaces:**

- Produces: one reproducible Go/No-Go checklist
- Consumes: results from Tasks 1–6

- [ ] **Step 1: Add the final local gate**

The checklist must require:

```powershell
git status --short
git diff --check
npm.cmd ci
npm.cmd test
npm.cmd run check
```

Expected:

- Working tree state is understood and contains only reviewed changes.
- Dependency installation is reproducible.
- Both test suites pass through the root command.
- Full lint, Prisma validation, typecheck, tests, and builds pass.

- [ ] **Step 2: Add the final production gate**

The checklist must require:

```powershell
$env:WEB_BASE_URL="https://myfuture-news-web.vercel.app"
$env:API_BASE_URL="https://myfuture-news-api.vercel.app/api"
npm.cmd run smoke:production
```

Expected: exit code `0` and `"status":"ok"`.

- [ ] **Step 3: Add the manual evidence table**

Use this table in `scripts/release-checklist.md`:

```markdown
| Evidence | Expected | Result |
|---|---|---|
| GitHub main SHA | Full 40-character SHA | Recorded |
| Vercel Web SHA/status | Intended SHA, Ready | Recorded |
| Vercel API SHA/status | Intended SHA, Ready | Recorded |
| API health | api/postgres/redis up | PASS |
| Production smoke | Exit 0, status ok | PASS |
| Responsive 1440/1280/768/390 | No overflow or overlap | PASS |
| Keyboard/focus | Main flow usable | PASS |
| Browser console | No severe errors/hydration errors | PASS |
| UTF-8 | No visible mojibake | PASS |
| Secret scan | No tracked credentials | PASS |
```

- [ ] **Step 4: Add the secret and debug scan**

Run:

```powershell
git ls-files .env .env.example
git grep -n -I -E "(DATABASE_URL|REDIS_URL|API_KEY|SECRET|TOKEN|PASSWORD)=" -- ":!package-lock.json"
git grep -n -I -E "console\\.log|debugger|Lorem ipsum|TODO|FIXME" -- apps scripts
```

Expected:

- Only `.env.example` is tracked among environment files.
- Credential matches are placeholders or documentation examples, never live secrets.
- No accidental debugger or recruiter-visible placeholder remains.
- Intentional CLI output is reviewed rather than removed blindly.

- [ ] **Step 5: Commit documentation after review**

Suggested commit:

```text
docs: finalize recruiter release checklist
```

---

### Task 8: Run the Final Go/No-Go Verification

**Files:**

- No source changes are allowed during this task.
- If any command fails, return to the task that owns the failure.

**Interfaces:**

- Consumes: final reviewed commit and deployed production URLs
- Produces: submission decision and evidence package

- [ ] **Step 1: Verify repository state**

Run:

```powershell
git status --short --branch
git log -1 --oneline --decorate
git rev-parse HEAD
git rev-parse origin/main
git diff --check
```

Expected:

- No unexplained local changes.
- Intended final commit is known.
- `HEAD` and `origin/main` match after the approved merge.
- No whitespace errors.

- [ ] **Step 2: Run all local quality gates**

Run:

```powershell
npm.cmd test
npm.cmd run check
```

Expected:

- All frontend tests pass.
- All backend tests pass.
- Prisma validation passes.
- Typecheck passes for both applications.
- Both production builds pass.
- No Next.js ESLint-plugin warning remains.

- [ ] **Step 3: Run production smoke**

Run:

```powershell
$env:WEB_BASE_URL="https://myfuture-news-web.vercel.app"
$env:API_BASE_URL="https://myfuture-news-api.vercel.app/api"
npm.cmd run smoke:production
```

Expected: exit code `0`.

- [ ] **Step 4: Recheck critical endpoints**

Verify:

```text
GET /api/health                                      -> 200
GET /api/categories                                  -> 200, six categories
GET /api/articles?page=1&limit=4                     -> 200, four items
GET /api/articles?page=2&limit=4                     -> 200, four items
GET /api/articles?category=phap-ly-du-an&page=2&limit=4
                                                      -> 200, three items
GET /api/articles?q=bat%20dong%20san&page=1&limit=5  -> 200
GET /api/articles?q=bất%20động%20sản&page=1&limit=5  -> 200
GET /api/articles?q=a                                -> 400
GET /api/articles/missing-article                    -> 404
GET /api/news-search?q=hung%20yen&limit=5            -> 200 JSON
GET /ban-tin                                         -> 200 HTML
GET /ban-tin?page=2                                  -> 200 HTML
GET /ban-tin/chuyen-muc/phap-ly-du-an?page=2         -> 200 HTML
GET /ban-tin/tim-kiem?q=hung%20yen                   -> 200 HTML, visible results
GET /ban-tin.html                                    -> 308 to /ban-tin
```

- [ ] **Step 5: Apply the final decision**

Mark **GO — CÓ THỂ NỘP NGAY** only when:

- Production smoke exits `0`.
- Root `npm test` exits `0`.
- `npm run check` exits `0`.
- API, PostgreSQL, and Redis health are `up`.
- Seven tabs, detail, search, and real pagination pass.
- Responsive/browser verification passes at all four required widths.
- No severe console or hydration error exists.
- No user-visible UTF-8 corruption exists.
- GitHub and Vercel deployment identities are recorded and explained.
- No P0 or P1 remains.

Otherwise mark **NO-GO**, record the failed gate, and return to the owning task instead of deploying another unreviewed change.

---

## 4. Recommended Execution Order

Execute in this order:

1. Task 1 — production smoke regression.
2. Task 2 — root test command.
3. Task 3 — Next.js lint rules.
4. Run local `npm test` and `npm run check`.
5. Review and merge the remediation branch.
6. Deploy the intended commits.
7. Task 5 — record deployment identity and environment mapping.
8. Task 4 — browser/responsive verification against the deployed build.
9. Task 6 — document the streamed 404 decision.
10. Task 7 — finalize release evidence.
11. Task 8 — final Go/No-Go run.

This order prevents manual screenshots and deployment evidence from becoming stale after later code changes.

## 5. Expected Final Recruiter Narrative

After all gates pass, the project can be described accurately as:

> MyFuture News is an npm-workspaces monorepo using Next.js/React for the web application and NestJS/Fastify for the API. PostgreSQL/Prisma is the source of truth, while Redis provides cache-aside reads with explicit TTLs and seed invalidation. The public experience contains one overview plus six database-backed categories, real pagination, article details with provenance, Vietnamese-aware search, responsive layouts, and production health/smoke verification.

Do not claim Redis queue support. The correct statement is that Redis is used for cache-aside only and the queue was intentionally outside the take-home scope.
