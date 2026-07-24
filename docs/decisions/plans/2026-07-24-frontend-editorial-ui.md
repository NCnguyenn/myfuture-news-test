# Frontend Editorial UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a responsive, MyFuture-branded editorial frontend for the News overview, seven navigation items, category listings, and article detail pages.

**Architecture:** Keep Next.js Server Components and the existing API client as the data boundary. Refactor the current news components into explicit editorial variants, add small focused sidebar/article components, and use route-level CSS modules plus shared design tokens for responsive behavior. No backend, database, Redis, URL, or API-contract change is allowed.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.7, CSS Modules, Node test runner, NestJS API as an unchanged external data source.

## Global Constraints

- Use `mockups/` only as visual reference; do not reproduce the existing MyFuture website pixel-for-pixel.
- Keep exactly seven navigation items: `Toàn cảnh` plus six API categories.
- Keep MyFuture red as the primary brand color and remove teal as the primary identity.
- Use only real API articles, categories, view counts, source data, and images.
- Preserve all current frontend URLs and API contracts.
- Preserve all 18 existing frontend tests.
- Do not modify PostgreSQL, Prisma schema, backend behavior, or Redis.
- Do not implement search, authentication, MyFuture Pro, advertisements, property projects, CMS, or a carousel.
- Keep touch targets at least 44px and support keyboard navigation.
- Verify 1440px, 1024px, 768px, and 390px layouts.

---

## File Structure

### Shared layout

- Modify `apps/frontend/app/globals.css`: brand tokens, global typography, container, headings, breadcrumbs.
- Modify `apps/frontend/components/layout/Header.tsx`
- Modify `apps/frontend/components/layout/Header.module.css`
- Modify `apps/frontend/components/layout/Footer.tsx`
- Modify `apps/frontend/components/layout/Footer.module.css`
- Modify `apps/frontend/components/news/NewsTabs.tsx`
- Modify `apps/frontend/components/news/NewsTabs.module.css`

### Editorial story system

- Modify `apps/frontend/components/news/NewsCard.tsx`
- Modify `apps/frontend/components/news/NewsCard.module.css`
- Modify `apps/frontend/components/news/FeaturedNews.tsx`
- Modify `apps/frontend/components/news/FeaturedNews.module.css`
- Modify `apps/frontend/components/news/NewsList.tsx`
- Modify `apps/frontend/components/news/NewsList.module.css`
- Modify `apps/frontend/components/news/NewsImage.tsx`
- Modify `apps/frontend/components/news/NewsImage.module.css`

### Overview and category

- Create `apps/frontend/components/news/PopularStories.tsx`
- Create `apps/frontend/components/news/PopularStories.module.css`
- Create `apps/frontend/components/news/CategoryDirectory.tsx`
- Create `apps/frontend/components/news/CategoryDirectory.module.css`
- Modify `apps/frontend/app/ban-tin/page.tsx`
- Create `apps/frontend/app/ban-tin/page.module.css`
- Modify `apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx`
- Create `apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.module.css`

### Article detail

- Create `apps/frontend/components/news/ArticleHeader.tsx`
- Create `apps/frontend/components/news/ArticleHeader.module.css`
- Create `apps/frontend/components/news/SourceEvidence.tsx`
- Create `apps/frontend/components/news/SourceEvidence.module.css`
- Modify `apps/frontend/components/news/ArticleContent.module.css`
- Modify `apps/frontend/components/news/RelatedNews.tsx`
- Modify `apps/frontend/components/news/RelatedNews.module.css`
- Modify `apps/frontend/app/ban-tin/[articleSlug]/page.tsx`
- Create `apps/frontend/app/ban-tin/[articleSlug]/page.module.css`

### States and verification

- Modify `apps/frontend/components/news/Pagination.tsx`
- Modify `apps/frontend/components/news/Pagination.module.css`
- Modify `apps/frontend/components/news/NewsStates.tsx`
- Modify `apps/frontend/components/news/NewsStates.module.css`
- Modify `apps/frontend/app/ban-tin/loading.tsx` only if the component contract changes.
- Modify `apps/frontend/app/ban-tin/error.tsx` only if the component contract changes.
- Modify `apps/frontend/app/not-found.tsx`
- Modify `apps/frontend/app/not-found.module.css`
- Create `apps/frontend/test/editorial-ui-source.spec.ts`

---

### Task 1: Establish the MyFuture Visual Foundation

**Files:**

- Modify: `apps/frontend/app/globals.css`
- Modify: `apps/frontend/components/layout/Header.tsx`
- Modify: `apps/frontend/components/layout/Header.module.css`
- Modify: `apps/frontend/components/layout/Footer.tsx`
- Modify: `apps/frontend/components/layout/Footer.module.css`
- Modify: `apps/frontend/components/news/NewsTabs.tsx`
- Modify: `apps/frontend/components/news/NewsTabs.module.css`
- Test: `apps/frontend/test/editorial-ui-source.spec.ts`

**Interfaces:**

- `Header(): JSX.Element`
- `Footer(): Promise<JSX.Element>` may fail softly when categories are unavailable.
- `NewsTabs({ categories, activeSlug }): JSX.Element`

- [ ] **Step 1: Write failing source-contract tests**

Create `apps/frontend/test/editorial-ui-source.spec.ts`:

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

test('uses the approved MyFuture red visual system', () => {
  const css = read('apps/frontend/app/globals.css');
  assert.match(css, /--brand:\s*#[0-9a-f]{6}/i);
  assert.doesNotMatch(css, /--brand:\s*#087f82/i);
  assert.match(css, /--content-max:\s*1200px/);
});

test('renders exactly one overview link plus API category links', () => {
  const source = read('apps/frontend/components/news/NewsTabs.tsx');
  assert.match(source, />Toàn cảnh</);
  assert.match(source, /categories\.map/);
  assert.match(source, /aria-current/);
});

test('does not add unsupported header controls', () => {
  const source = read('apps/frontend/components/layout/Header.tsx');
  assert.doesNotMatch(source, /Đăng nhập|Tìm kiếm|MyFuture Pro/);
});
```

- [ ] **Step 2: Run the new test and verify red**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/editorial-ui-source.spec.ts
```

Expected: FAIL because the global brand is still teal and `--content-max` does not exist.

- [ ] **Step 3: Implement global design tokens**

Replace the root token block in `globals.css` with a red editorial system:

```css
:root {
  color-scheme: light;
  --brand: #d71920;
  --brand-dark: #a80f16;
  --brand-soft: #fff1f1;
  --ink: #17191d;
  --muted: #66707c;
  --soft: #f6f7f8;
  --surface: #ffffff;
  --line: #e6e8eb;
  --accent: #b88936;
  --content-max: 1200px;
  --reading-max: 760px;
  --radius-sm: 10px;
  --radius-md: 14px;
  --shadow-soft: 0 12px 32px rgba(24, 27, 32, 0.08);
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
}
```

Keep global focus styles, but change the focus ring to use `--brand-dark`. Update `.page-shell` to use `var(--content-max)` and responsive 20px/14px gutters.

- [ ] **Step 4: Redesign header and footer**

Header requirements:

```tsx
<Link href="/ban-tin" className={styles.brand} aria-label="MyFuture - Bản tin">
  <span className={styles.wordmark}><span>my</span>FUTURE</span>
  <span className={styles.divider} aria-hidden="true" />
  <span className={styles.channel}>Bản tin</span>
</Link>
```

Footer requirements:

```tsx
const categories = await getCategories()
  .then((response) => response.data)
  .catch(() => []);
```

Render the brand, a concise description, and category links only when available. Do not make a footer failure fail the route.

- [ ] **Step 5: Make category navigation laptop- and phone-friendly**

Use:

```tsx
<nav className={styles.tabs} aria-label="Danh mục bản tin">
  <div className={styles.track}>
    <Link ...>Toàn cảnh</Link>
    {categories.map(...)}
  </div>
</nav>
```

CSS requirements:

```css
.tabs { overflow-x: auto; scrollbar-width: none; }
.track { display: flex; min-width: max-content; }
.tab { min-height: 44px; display: inline-flex; align-items: center; }
.active { color: var(--brand-dark); box-shadow: inset 0 -3px var(--brand); }
```

- [ ] **Step 6: Run focused and existing tests**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/editorial-ui-source.spec.ts
npm.cmd run test:web
npm.cmd run typecheck:web
```

Expected: the new tests pass, all existing frontend tests pass, and typecheck exits 0.

- [ ] **Step 7: Commit the visual foundation**

```powershell
git add apps/frontend/app/globals.css apps/frontend/components/layout apps/frontend/components/news/NewsTabs.tsx apps/frontend/components/news/NewsTabs.module.css apps/frontend/test/editorial-ui-source.spec.ts
git commit -m "feat: establish MyFuture editorial design system"
```

---

### Task 2: Build the Reusable Editorial Story Components

**Files:**

- Modify: `apps/frontend/components/news/NewsCard.tsx`
- Modify: `apps/frontend/components/news/NewsCard.module.css`
- Modify: `apps/frontend/components/news/FeaturedNews.tsx`
- Modify: `apps/frontend/components/news/FeaturedNews.module.css`
- Modify: `apps/frontend/components/news/NewsList.tsx`
- Modify: `apps/frontend/components/news/NewsList.module.css`
- Modify: `apps/frontend/components/news/NewsImage.tsx`
- Modify: `apps/frontend/components/news/NewsImage.module.css`
- Test: `apps/frontend/test/editorial-ui-source.spec.ts`

**Interfaces:**

```ts
export type StoryCardVariant = 'featured' | 'compact' | 'list' | 'related';

type NewsCardProps = {
  article: ArticleListItem;
  variant?: StoryCardVariant;
  showExcerpt?: boolean;
};
```

- [ ] **Step 1: Add a failing StoryCard variant test**

Append:

```ts
test('provides the four approved story-card variants', () => {
  const source = read('apps/frontend/components/news/NewsCard.tsx');
  for (const variant of ['featured', 'compact', 'list', 'related']) {
    assert.match(source, new RegExp(`'${variant}'`));
  }
  assert.match(source, /variant\s*=\s*'list'/);
});
```

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/editorial-ui-source.spec.ts
```

Expected: FAIL because NewsCard still uses a `compact` boolean.

- [ ] **Step 2: Replace the boolean card contract**

Implement:

```ts
export type StoryCardVariant = 'featured' | 'compact' | 'list' | 'related';

type NewsCardProps = {
  article: ArticleListItem;
  variant?: StoryCardVariant;
  showExcerpt?: boolean;
};

export function NewsCard({
  article,
  variant = 'list',
  showExcerpt = variant === 'list',
}: NewsCardProps) {
  // One semantic article, shared metadata, and variant CSS class.
}
```

Only render view counts when `article.viewCount !== undefined && article.viewCount > 0`.

- [ ] **Step 3: Refactor FeaturedNews around shared card behavior**

Keep one explicit lead card and four secondary cards. The lead includes excerpt and author/date metadata; secondary cards use stable image ratios and two- or three-line headlines.

The CSS grid must use:

```css
.featured {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.85fr);
}
@media (max-width: 900px) {
  .featured { grid-template-columns: 1fr; }
  .secondary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .secondary { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Update NewsList and image behavior**

`NewsList` continues to own section headings and empty state, but renders:

```tsx
<NewsCard article={article} variant="list" key={article.id} />
```

Keep NewsImage fallback behavior and add a reduced-motion-safe image zoom:

```css
@media (prefers-reduced-motion: reduce) {
  .image { transition: none; }
}
```

- [ ] **Step 5: Verify story components**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/editorial-ui-source.spec.ts
npm.cmd run test:web
npm.cmd run typecheck:web
```

Expected: all frontend tests and typecheck pass.

- [ ] **Step 6: Commit reusable stories**

```powershell
git add apps/frontend/components/news apps/frontend/test/editorial-ui-source.spec.ts
git commit -m "feat: add reusable editorial story variants"
```

---

### Task 3: Redesign the News Overview with Real Popular Data

**Files:**

- Create: `apps/frontend/components/news/PopularStories.tsx`
- Create: `apps/frontend/components/news/PopularStories.module.css`
- Create: `apps/frontend/components/news/CategoryDirectory.tsx`
- Create: `apps/frontend/components/news/CategoryDirectory.module.css`
- Modify: `apps/frontend/app/ban-tin/page.tsx`
- Create: `apps/frontend/app/ban-tin/page.module.css`
- Test: `apps/frontend/test/editorial-ui-source.spec.ts`

**Interfaces:**

```ts
type PopularStoriesProps = {
  popularArticles: ArticleListItem[];
  featuredFallback: ArticleListItem[];
};

type CategoryDirectoryProps = {
  categories: NewsCategory[];
};
```

- [ ] **Step 1: Add failing overview data-flow tests**

Append:

```ts
test('overview requests featured, newest, and popular article groups', () => {
  const source = read('apps/frontend/app/ban-tin/page.tsx');
  assert.match(source, /featured:\s*true/);
  assert.match(source, /sort:\s*'newest'/);
  assert.match(source, /sort:\s*'popular'/);
  assert.match(source, /Promise\.all/);
});
```

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/editorial-ui-source.spec.ts
```

Expected: FAIL because the overview does not request `sort: 'popular'`.

- [ ] **Step 2: Fetch the four overview datasets in parallel**

Use:

```ts
const [
  categoriesResponse,
  featuredResponse,
  latestResponse,
  popularResponse,
] = await Promise.all([
  getCategories(),
  getArticles({ page: 1, limit: 5, featured: true, sort: 'newest' }),
  getArticles({ page: 1, limit: 10, sort: 'newest' }),
  getArticles({ page: 1, limit: 5, sort: 'popular' }),
]);
```

- [ ] **Step 3: Implement honest popular fallback**

`PopularStories` chooses its title and items:

```ts
const hasMeaningfulViews = popularArticles.some(
  (article) => (article.viewCount ?? 0) > 0,
);
const title = hasMeaningfulViews ? 'Đọc nhiều' : 'Tin nổi bật';
const articles = hasMeaningfulViews
  ? popularArticles
  : featuredFallback;
```

Render compact StoryCards and do not fabricate view counts.

- [ ] **Step 4: Implement category directory**

Render all six categories with name and real `articleCount`. Each item links to `/ban-tin/chuyen-muc/[slug]`.

- [ ] **Step 5: Compose the overview route**

Use route CSS:

```css
.contentGrid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 56px;
  align-items: start;
}
.sidebar { position: sticky; top: 104px; }
@media (max-width: 980px) {
  .contentGrid { grid-template-columns: 1fr; }
  .sidebar { position: static; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .sidebar { grid-template-columns: 1fr; }
}
```

- [ ] **Step 6: Verify and commit overview**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/editorial-ui-source.spec.ts
npm.cmd run test:web
npm.cmd run typecheck:web
```

Then:

```powershell
git add apps/frontend/app/ban-tin/page.tsx apps/frontend/app/ban-tin/page.module.css apps/frontend/components/news/PopularStories* apps/frontend/components/news/CategoryDirectory* apps/frontend/test/editorial-ui-source.spec.ts
git commit -m "feat: redesign editorial news overview"
```

---

### Task 4: Redesign Category Listings and Pagination

**Files:**

- Modify: `apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx`
- Create: `apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.module.css`
- Modify: `apps/frontend/components/news/Pagination.tsx`
- Modify: `apps/frontend/components/news/Pagination.module.css`
- Test: `apps/frontend/test/editorial-ui-source.spec.ts`

**Interfaces:**

- Page 1 may promote the first returned article to lead presentation.
- Page 2+ renders all returned articles as feed items.
- Pagination continues to consume the existing `PaginationMeta`.

- [ ] **Step 1: Add failing category presentation tests**

Append:

```ts
test('category page separates the first-page lead from the feed', () => {
  const source = read(
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx',
  );
  assert.match(source, /page === 1/);
  assert.match(source, /categoryLead/);
});

test('pagination exposes current page semantics', () => {
  const source = read('apps/frontend/components/news/Pagination.tsx');
  assert.match(source, /aria-current/);
});
```

- [ ] **Step 2: Implement first-page hierarchy**

Use:

```ts
const [categoryLead, ...remainingArticles] =
  page === 1 ? articlesResponse.data : [undefined, ...articlesResponse.data];
const feedArticles =
  page === 1 ? remainingArticles : articlesResponse.data;
```

Render `categoryLead` with the `featured` NewsCard variant. Do not remove an item on page 2+.

- [ ] **Step 3: Implement compact numbered pagination**

Create a deterministic page window around the current page:

```ts
const start = Math.max(1, Math.min(meta.page - 1, meta.totalPages - 2));
const pages = Array.from(
  { length: Math.min(3, meta.totalPages) },
  (_, index) => start + index,
);
```

Render previous, page numbers with `aria-current="page"`, and next. Disabled controls use semantic spans and retain 44px layout dimensions.

- [ ] **Step 4: Verify and commit category pages**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/editorial-ui-source.spec.ts
npm.cmd run test:web
npm.cmd run typecheck:web
```

Then:

```powershell
git add apps/frontend/app/ban-tin/chuyen-muc apps/frontend/components/news/Pagination* apps/frontend/test/editorial-ui-source.spec.ts
git commit -m "feat: improve category hierarchy and pagination"
```

---

### Task 5: Componentize and Redesign Article Detail

**Files:**

- Create: `apps/frontend/components/news/ArticleHeader.tsx`
- Create: `apps/frontend/components/news/ArticleHeader.module.css`
- Create: `apps/frontend/components/news/SourceEvidence.tsx`
- Create: `apps/frontend/components/news/SourceEvidence.module.css`
- Modify: `apps/frontend/components/news/ArticleContent.module.css`
- Modify: `apps/frontend/components/news/RelatedNews.tsx`
- Modify: `apps/frontend/components/news/RelatedNews.module.css`
- Modify: `apps/frontend/app/ban-tin/[articleSlug]/page.tsx`
- Create: `apps/frontend/app/ban-tin/[articleSlug]/page.module.css`
- Test: `apps/frontend/test/editorial-ui-source.spec.ts`

**Interfaces:**

```ts
type ArticleHeaderProps = {
  article: ArticleDetail;
};

type SourceEvidenceProps = {
  evidence: ArticleEvidence[];
};
```

- [ ] **Step 1: Add failing article boundary tests**

Append:

```ts
test('article page delegates header and evidence presentation', () => {
  const source = read(
    'apps/frontend/app/ban-tin/[articleSlug]/page.tsx',
  );
  assert.match(source, /<ArticleHeader/);
  assert.match(source, /<SourceEvidence/);
  assert.match(source, /<NewsTabs/);
});
```

- [ ] **Step 2: Add categories to article-page data flow**

Fetch article and categories in parallel inside the page:

```ts
const [article, categoriesResponse] = await Promise.all([
  loadArticle(articleSlug),
  getCategories(),
]);
```

Render `NewsTabs` with `activeSlug={article.category.slug}` before the breadcrumb.

- [ ] **Step 3: Extract ArticleHeader**

Move category, headline, excerpt, author, date, reading time, source, and real view count into ArticleHeader. Only display views when greater than zero.

Use a maximum headline width and:

```css
.title {
  font-size: clamp(2.25rem, 6vw, 4.75rem);
  line-height: 1.03;
  text-wrap: balance;
}
```

- [ ] **Step 4: Extract SourceEvidence and route layout**

SourceEvidence returns `null` for an empty evidence array. For populated data, retain verified source links and open external URLs safely.

Route CSS must keep:

- cover width up to the content container,
- reading column at `var(--reading-max)`,
- image credit aligned with the cover,
- related stories and previous/next navigation visually separated.

- [ ] **Step 5: Improve body and related-story readability**

Article body:

```css
.content {
  font-size: clamp(1.02rem, 1.5vw, 1.125rem);
  line-height: 1.82;
}
.content a {
  color: var(--brand-dark);
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  overflow-wrap: anywhere;
}
```

RelatedNews uses the `related` NewsCard variant and becomes one column on phone.

- [ ] **Step 6: Verify and commit article detail**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/editorial-ui-source.spec.ts
npm.cmd run test:web
npm.cmd run typecheck:web
```

Then:

```powershell
git add apps/frontend/app/ban-tin/[articleSlug] apps/frontend/components/news/ArticleHeader* apps/frontend/components/news/SourceEvidence* apps/frontend/components/news/ArticleContent.module.css apps/frontend/components/news/RelatedNews* apps/frontend/test/editorial-ui-source.spec.ts
git commit -m "feat: redesign editorial article detail"
```

---

### Task 6: Unify Loading, Empty, Error, and 404 States

**Files:**

- Modify: `apps/frontend/components/news/NewsStates.tsx`
- Modify: `apps/frontend/components/news/NewsStates.module.css`
- Modify: `apps/frontend/app/ban-tin/loading.tsx` if needed.
- Modify: `apps/frontend/app/ban-tin/error.tsx` if needed.
- Modify: `apps/frontend/app/not-found.tsx`
- Modify: `apps/frontend/app/not-found.module.css`
- Test: `apps/frontend/test/editorial-ui-source.spec.ts`

- [ ] **Step 1: Add failing state tests**

Append:

```ts
test('news states retain retry, overview, and reduced-motion support', () => {
  const error = read('apps/frontend/app/ban-tin/error.tsx');
  const states = read('apps/frontend/components/news/NewsStates.module.css');
  const notFound = read('apps/frontend/app/not-found.tsx');
  assert.match(error, /reset\(\)/);
  assert.match(states, /prefers-reduced-motion/);
  assert.match(notFound, /ban-tin/);
});
```

- [ ] **Step 2: Align state visuals**

Use the same red brand label, neutral surface, 44px actions, and page width as normal content. Skeleton geometry must reflect the new hero and feed layouts.

Add:

```css
@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
```

- [ ] **Step 3: Verify and commit states**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/editorial-ui-source.spec.ts
npm.cmd run test:web
npm.cmd run typecheck:web
```

Then:

```powershell
git add apps/frontend/components/news/NewsStates* apps/frontend/app/ban-tin/loading.tsx apps/frontend/app/ban-tin/error.tsx apps/frontend/app/not-found*
git commit -m "feat: unify responsive news states"
```

---

### Task 7: Run Production Verification and Capture Responsive Screenshots

**Files:**

- Modify only files required by failed verification.
- Create ignored screenshots outside the repository or under the Codex visualization directory.

- [ ] **Step 1: Run the complete frontend test suite**

```powershell
npm.cmd run test:web
```

Expected: all original 18 tests plus the new editorial tests pass with zero failures.

- [ ] **Step 2: Run typecheck and production build**

```powershell
npm.cmd run typecheck:web
npm.cmd run build:web
```

Expected: both commands exit 0 and Next.js reports successful compilation.

- [ ] **Step 3: Verify forbidden scope and required routes**

Run:

```powershell
$frontendFiles = Get-ChildItem 'apps/frontend' -Recurse -File |
  Where-Object { $_.FullName -notmatch '\\(\.next|node_modules)\\' }
$forbidden = $frontendFiles | Select-String -Pattern 'MyFuture Pro|Đăng nhập|Quảng cáo'
if ($forbidden) { throw 'Unsupported UI scope found' }
if (-not (Test-Path 'apps/frontend/app/ban-tin/page.tsx')) { throw 'Overview missing' }
if (-not (Test-Path -LiteralPath 'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx')) { throw 'Category route missing' }
if (-not (Test-Path -LiteralPath 'apps/frontend/app/ban-tin/[articleSlug]/page.tsx')) { throw 'Article route missing' }
```

- [ ] **Step 4: Start API and frontend in hidden windows**

Use exact processes and persist only their PIDs in a temporary task directory:

```powershell
$pidDirectory = Join-Path $env:TEMP 'myfuture-news-editorial-ui'
New-Item -ItemType Directory -Force $pidDirectory | Out-Null
$api = Start-Process npm.cmd -ArgumentList 'run','dev:api' -WorkingDirectory $PWD -PassThru -WindowStyle Hidden
$web = Start-Process npm.cmd -ArgumentList 'run','dev:web' -WorkingDirectory $PWD -PassThru -WindowStyle Hidden
[IO.File]::WriteAllText((Join-Path $pidDirectory 'api.pid'), [string]$api.Id)
[IO.File]::WriteAllText((Join-Path $pidDirectory 'web.pid'), [string]$web.Id)

$deadline = (Get-Date).AddSeconds(60)
$apiReady = $false
$webReady = $false
do {
  try {
    $apiReady = (Invoke-WebRequest 'http://localhost:4000/api/health' -UseBasicParsing).StatusCode -eq 200
  } catch {
    $apiReady = $false
  }
  try {
    $webReady = (Invoke-WebRequest 'http://localhost:3000/ban-tin' -UseBasicParsing).StatusCode -eq 200
  } catch {
    $webReady = $false
  }
  if (-not ($apiReady -and $webReady)) {
    Start-Sleep -Milliseconds 500
  }
} while (-not ($apiReady -and $webReady) -and (Get-Date) -lt $deadline)

if (-not $apiReady) { throw 'API did not become ready within 60 seconds' }
if (-not $webReady) { throw 'Frontend did not become ready within 60 seconds' }
```

- [ ] **Step 5: Capture approved viewport evidence**

Use installed Microsoft Edge:

```powershell
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$shotDirectory = 'C:\Users\CHI NGUYEN\.codex\visualizations\2026\07\23\019f8de0-5fe4-7ca2-8b6e-92223da0e4be\frontend-editorial'
New-Item -ItemType Directory -Force $shotDirectory | Out-Null

$captures = @(
  @{ Name = 'overview-1440'; Width = 1440; Height = 1100; Url = 'http://localhost:3000/ban-tin' },
  @{ Name = 'overview-1024'; Width = 1024; Height = 900; Url = 'http://localhost:3000/ban-tin' },
  @{ Name = 'overview-768'; Width = 768; Height = 1024; Url = 'http://localhost:3000/ban-tin' },
  @{ Name = 'overview-390'; Width = 390; Height = 844; Url = 'http://localhost:3000/ban-tin' },
  @{ Name = 'category-1440'; Width = 1440; Height = 1100; Url = 'http://localhost:3000/ban-tin/chuyen-muc/phap-ly-du-an' },
  @{ Name = 'category-390'; Width = 390; Height = 844; Url = 'http://localhost:3000/ban-tin/chuyen-muc/phap-ly-du-an' },
  @{ Name = 'article-1440'; Width = 1440; Height = 1100; Url = 'http://localhost:3000/ban-tin/nghi-dinh-147-2026-xu-ly-du-an-ton-dong-dat-dai' },
  @{ Name = 'article-390'; Width = 390; Height = 844; Url = 'http://localhost:3000/ban-tin/nghi-dinh-147-2026-xu-ly-du-an-ton-dong-dat-dai' }
)

foreach ($capture in $captures) {
  $output = Join-Path $shotDirectory "$($capture.Name).png"
  & $edge `
    --headless=new `
    --disable-gpu `
    --hide-scrollbars `
    "--window-size=$($capture.Width),$($capture.Height)" `
    "--screenshot=$output" `
    $capture.Url
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $output)) {
    throw "Screenshot failed: $($capture.Name)"
  }
}
```

- [ ] **Step 6: Inspect screenshots**

Use image inspection to verify:

- no horizontal overflow,
- category tabs are usable,
- lead hierarchy is visible,
- laptop text remains readable,
- mobile controls remain at least 44px,
- sidebar moves below content,
- article body width and image scaling are correct.

If a screenshot fails, make one focused CSS correction and repeat Steps 1, 2, and the affected screenshot.

- [ ] **Step 7: Stop only the started processes**

```powershell
$pidDirectory = Join-Path $env:TEMP 'myfuture-news-editorial-ui'
$apiPid = [int][IO.File]::ReadAllText((Join-Path $pidDirectory 'api.pid'))
$webPid = [int][IO.File]::ReadAllText((Join-Path $pidDirectory 'web.pid'))
Get-Process -Id $apiPid,$webPid -ErrorAction SilentlyContinue |
  Stop-Process -Force
```

Do not terminate unrelated Node processes.

- [ ] **Step 8: Verify clean repository and commit final fixes**

```powershell
git diff --check
git status --short
```

If verification required fixes:

```powershell
git add apps/frontend
git commit -m "fix: close responsive editorial UI gaps"
```

Do not create an empty commit.

---

## Completion Criteria

The frontend implementation is complete only when:

1. `Toàn cảnh` plus six API categories render as seven usable navigation items.
2. The overview has one lead story, four secondary features, newest feed, and honest popular/featured sidebar data.
3. Category page 1 has a lead story and feed; later pages do not drop an item.
4. Article detail uses dedicated header and evidence components and displays category navigation.
5. MyFuture red is the primary brand color and teal is no longer the primary token.
6. Laptop, tablet, and phone screenshots show no overflow or unusable controls.
7. Existing and new frontend tests pass.
8. Frontend typecheck and production build pass.
9. Backend, PostgreSQL, Prisma, Redis, and URLs remain unchanged.
10. The Git working tree is clean.
