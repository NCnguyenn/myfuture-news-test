# New Articles Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the MyFuture News frontend display only the 30 complete Codex-researched articles, with locally cached cover images from their original source pages, while leaving the database, seed, and API untouched.

**Architecture:** Add a server-side preview repository that reads the approved Codex manifest, validates the completeness gate, converts Markdown to safe HTML, and exposes the same list/detail shapes consumed by the existing news components. The three news routes switch from the API client to this repository. A separate sync command downloads each source page’s `og:image` into the web public folder and records provenance; old database articles remain recoverable but are unreachable from the preview routes.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.7, Node test runner through `tsx --test`, Node `fetch`, filesystem APIs, existing CSS Modules.

## Global Constraints

- Display exactly 6 approved categories and 30 researched articles, 5 per category.
- Do not delete or modify the existing database, Prisma schema, migrations, seed, API, or API client.
- Do not fall back to the API from preview news routes.
- Use cover images from the original article pages for this internal demo and retain source provenance.
- Use the existing placeholder only when a source page has no downloadable image.
- Do not generate AI images.
- Do not add a test framework or runtime dependency.
- Escape raw HTML from researched Markdown and allow only `http`/`https` links.
- Do not stage or commit unless the user separately requests it.

---

## File Structure

### New files

- `apps/web/lib/markdown-to-html.ts`: trusted, narrowly scoped Markdown conversion with HTML escaping and safe links.
- `apps/web/lib/researched-news.ts`: manifest discovery, validation, querying, pagination, and mapping to frontend types.
- `apps/web/lib/source-image.ts`: pure HTML metadata extraction and content-type helpers for the image sync command.
- `apps/web/data/researched-images.ts`: typed access to the generated image provenance manifest.
- `apps/web/test/markdown-to-html.spec.ts`: security and rendering tests.
- `apps/web/test/researched-news.spec.ts`: article/category/completeness/blacklist/query tests.
- `apps/web/test/source-image.spec.ts`: source image metadata parsing tests.
- `apps/web/test/news-route-source.spec.ts`: regression check that news routes do not import the API client.
- `scripts/sync-researched-news-images.ts`: source-page image downloader and provenance writer.
- `apps/web/public/images/news/researched/manifest.json`: generated image mapping.
- `apps/web/public/images/news/researched/<article-slug>.<ext>`: downloaded source images.

### Modified files

- `package.json`: add `test:web` and `sync:news-images`.
- `apps/web/package.json`: add a `test` script.
- `apps/web/types/news.ts`: add author/evidence/image provenance fields and make view count optional.
- `apps/web/app/ban-tin/page.tsx`: use researched repository.
- `apps/web/app/ban-tin/chuyen-muc/[slug]/page.tsx`: use researched repository.
- `apps/web/app/ban-tin/[articleSlug]/page.tsx`: use researched repository and render author/evidence.
- `apps/web/components/news/NewsCard.tsx`: show author and suppress absent view counts.
- `apps/web/components/news/FeaturedNews.tsx`: show source-derived cover data without behavior changes.
- `apps/web/components/news/ArticleContent.tsx`: keep the safe generated HTML boundary explicit.
- `apps/web/components/news/ArticleContent.module.css`: style verification sources.
- `apps/web/app/globals.css`: style byline and evidence block.

---

### Task 1: Add a safe Markdown conversion boundary

**Files:**

- Create: `apps/web/test/markdown-to-html.spec.ts`
- Create: `apps/web/lib/markdown-to-html.ts`
- Modify: `apps/web/package.json`
- Modify: `package.json`

**Interfaces:**

- Consumes: a UTF-8 Markdown string from `bodyMarkdown`.
- Produces: `markdownToSafeHtml(markdown: string): string`.

- [ ] **Step 1: Add the web test commands**

Add these scripts without changing existing scripts:

```json
// apps/web/package.json
"test": "tsx --test test/**/*.spec.ts"
```

```json
// package.json
"test:web": "tsx --test apps/web/test/**/*.spec.ts",
"sync:news-images": "tsx scripts/sync-researched-news-images.ts"
```

- [ ] **Step 2: Write the failing Markdown tests**

Create `apps/web/test/markdown-to-html.spec.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { markdownToSafeHtml } from '../lib/markdown-to-html';

test('renders headings and paragraphs used by researched articles', () => {
  assert.equal(
    markdownToSafeHtml('## Tiêu đề\n\nĐoạn thứ nhất.\n\n### Chi tiết'),
    '<h2>Tiêu đề</h2>\n<p>Đoạn thứ nhất.</p>\n<h3>Chi tiết</h3>',
  );
});

test('escapes raw HTML before rendering', () => {
  const html = markdownToSafeHtml('<script>alert(1)</script>');
  assert.equal(html, '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
  assert.doesNotMatch(html, /<script>/);
});

test('allows http links and neutralizes dangerous protocols', () => {
  assert.equal(
    markdownToSafeHtml('[Nguồn](https://example.com)'),
    '<p><a href="https://example.com" target="_blank" rel="noreferrer">Nguồn</a></p>',
  );
  assert.equal(
    markdownToSafeHtml('[Không an toàn](javascript:alert(1))'),
    '<p>Không an toàn</p>',
  );
});
```

- [ ] **Step 3: Run RED**

Run:

```powershell
npm run test:web -- --test-name-pattern "renders headings|escapes raw|allows http"
```

Expected: FAIL because `apps/web/lib/markdown-to-html.ts` does not exist.

- [ ] **Step 4: Implement the minimal safe renderer**

Create `apps/web/lib/markdown-to-html.ts`:

```ts
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderInline(value: string): string {
  const escaped = escapeHtml(value);
  return escaped.replace(
    /\[([^\]]+)]\(([^)]+)\)/g,
    (_match, label: string, href: string) => {
      if (!/^https?:\/\//i.test(href)) return label;
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${label}</a>`;
    },
  );
}

export function markdownToSafeHtml(markdown: string): string {
  const blocks = markdown.replace(/\r\n/g, '\n').trim().split(/\n{2,}/);
  return blocks
    .map((block) => {
      const value = block.trim();
      if (value.startsWith('### ')) return `<h3>${renderInline(value.slice(4))}</h3>`;
      if (value.startsWith('## ')) return `<h2>${renderInline(value.slice(3))}</h2>`;
      return `<p>${value.split('\n').map(renderInline).join('<br />')}</p>`;
    })
    .join('\n');
}
```

- [ ] **Step 5: Run GREEN**

Run:

```powershell
npm run test:web -- --test-name-pattern "renders headings|escapes raw|allows http"
```

Expected: 3 tests pass, 0 fail.

- [ ] **Step 6: Inspect the checkpoint without staging**

Run:

```powershell
git diff -- package.json apps/web/package.json apps/web/lib/markdown-to-html.ts apps/web/test/markdown-to-html.spec.ts
```

Expected: only Task 1 files are shown. Do not stage or commit.

---

### Task 2: Build the researched content repository

**Files:**

- Create: `apps/web/test/researched-news.spec.ts`
- Create: `apps/web/lib/researched-news.ts`
- Create: `apps/web/data/researched-images.ts`
- Modify: `apps/web/types/news.ts`

**Interfaces:**

- Consumes: `md/content-research/manifest-codex-2026-07-23.json`,
  `md/content-research/manifest-2026-07-23.json`, and the generated image
  provenance manifest.
- Produces:
  - `getResearchedCategories(): { data: NewsCategory[] }`
  - `getResearchedArticles(query?: ArticleQuery): ArticleListResponse`
  - `getResearchedArticleBySlug(slug: string): ArticleDetailResponse | undefined`
  - `getResearchedImage(slug: string, sourcePageUrl: string): ImageProvenance`

- [ ] **Step 1: Write failing repository tests**

Create `apps/web/test/researched-news.spec.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getResearchedArticleBySlug,
  getResearchedArticles,
  getResearchedCategories,
} from '../lib/researched-news';

test('loads exactly six categories and thirty complete new articles', () => {
  const categories = getResearchedCategories().data;
  const articles = getResearchedArticles({ limit: 100 }).data;
  assert.equal(categories.length, 6);
  assert.equal(articles.length, 30);
  assert.deepEqual(categories.map((item) => item.articleCount), [5, 5, 5, 5, 5, 5]);
});

test('returns only articles from the requested category', () => {
  const response = getResearchedArticles({
    category: 'phap-ly-du-an',
    limit: 100,
  });
  assert.equal(response.data.length, 5);
  assert.ok(response.data.every((item) => item.category.slug === 'phap-ly-du-an'));
});

test('does not expose a known old demo slug', () => {
  assert.equal(getResearchedArticleBySlug('thi-truong-bat-dong-san-2025'), undefined);
});

test('maps full detail with author, source, evidence, and safe HTML', () => {
  const first = getResearchedArticles({ limit: 1 }).data[0];
  const response = getResearchedArticleBySlug(first.slug);
  assert.ok(response);
  assert.ok(response.data.author.name.length > 0);
  assert.match(response.data.sourceUrl ?? '', /^https:\/\//);
  assert.ok(response.data.evidence.length > 0);
  assert.match(response.data.contentHtml, /<h2>/);
});

test('uses unique new slugs and source URLs only', () => {
  const articles = getResearchedArticles({ limit: 100 }).data;
  assert.equal(new Set(articles.map((item) => item.slug)).size, 30);
  const sourceUrls = articles.map((item) => {
    const detail = getResearchedArticleBySlug(item.slug);
    assert.ok(detail);
    return detail.data.sourceUrl;
  });
  assert.equal(new Set(sourceUrls).size, 30);
});
```

- [ ] **Step 2: Run RED**

Run:

```powershell
npm run test:web -- --test-name-pattern "six categories|requested category|old demo|full detail|unique new"
```

Expected: FAIL because `apps/web/lib/researched-news.ts` does not exist.

- [ ] **Step 3: Extend the frontend types**

Update `apps/web/types/news.ts` with these exact public shapes:

```ts
export type ArticleAuthor = {
  name: string;
  slug: string;
  authorType: 'person' | 'organization';
  verificationNote: string;
};

export type ArticleEvidence = {
  claim: string;
  sourceUrl: string;
  evidenceNote: string;
};

export type ImageProvenance = {
  localPath: string;
  originalImageUrl: string | null;
  sourcePageUrl: string;
  credit: string | null;
  isPlaceholder: boolean;
};
```

Make `ArticleListItem.viewCount` optional and add `author`:

```ts
viewCount?: number;
author: Pick<ArticleAuthor, 'name' | 'slug' | 'authorType'>;
```

Add these fields to `ArticleDetail`:

```ts
author: ArticleAuthor;
evidence: ArticleEvidence[];
imageProvenance: ImageProvenance;
```

- [ ] **Step 4: Add typed image-manifest access**

Create `apps/web/data/researched-images.ts`:

```ts
import type { ImageProvenance } from '../types/news';

const FALLBACK = '/images/news/placeholder-default.svg';

type ImageRecord = Omit<ImageProvenance, 'localPath'> & { localPath: string };

let records: Record<string, ImageRecord> = {};

try {
  records = require('../public/images/news/researched/manifest.json') as Record<
    string,
    ImageRecord
  >;
} catch {
  records = {};
}

export function getResearchedImage(
  slug: string,
  sourcePageUrl: string,
): ImageProvenance {
  return (
    records[slug] ?? {
      localPath: FALLBACK,
      originalImageUrl: null,
      sourcePageUrl,
      credit: null,
      isPlaceholder: true,
    }
  );
}
```

- [ ] **Step 5: Implement the repository**

Create `apps/web/lib/researched-news.ts` with:

```ts
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { getResearchedImage } from '../data/researched-images';
import type {
  ArticleDetail,
  ArticleDetailResponse,
  ArticleListItem,
  ArticleListResponse,
  ArticleQuery,
  NewsCategory,
} from '../types/news';
import { markdownToSafeHtml } from './markdown-to-html';

type RawArticle = {
  title: string;
  slug: string;
  excerpt: string;
  bodyMarkdown: string;
  categorySlug: string;
  datePublished: string;
  author: {
    name: string;
    slug: string;
    authorType: 'person' | 'organization';
    verified: boolean;
    verificationNote: string;
  };
  sources: Array<{
    sourceName: string;
    canonicalUrl: string;
    verified: boolean;
  }>;
  evidence: Array<{
    claim: string;
    sourceUrl: string;
    evidenceNote: string;
  }>;
  imagePlan: { cover: { alt: string } };
};

type RawManifest = {
  categories: Array<{
    name: string;
    slug: string;
    articles: RawArticle[];
  }>;
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'phap-ly-du-an': 'Cập nhật pháp lý dự án và chính sách bất động sản.',
  'quy-hoach-ha-tang': 'Quy hoạch, giao thông và hạ tầng liên vùng.',
  'lai-suat-tai-chinh': 'Lãi suất, tín dụng và chính sách tài chính.',
  'thi-truong-gia-ca': 'Diễn biến thị trường, giá cả và nguồn cung.',
  'dau-tu-dong-tien': 'Đầu tư, FDI và dịch chuyển dòng vốn.',
  'cho-thue': 'Nhà ở, văn phòng và thị trường cho thuê.',
};

function findWorkspaceFile(relativePath: string): string {
  const candidates = [
    path.resolve(process.cwd(), relativePath),
    path.resolve(process.cwd(), '..', '..', relativePath),
  ];
  const match = candidates.find(existsSync);
  if (!match) throw new Error(`Required researched-news file not found: ${relativePath}`);
  return match;
}

function readManifest(): RawManifest {
  return JSON.parse(
    readFileSync(
      findWorkspaceFile('md/content-research/manifest-codex-2026-07-23.json'),
      'utf8',
    ),
  ) as RawManifest;
}

function isComplete(article: RawArticle): boolean {
  return Boolean(
    article.title &&
      article.slug &&
      article.excerpt &&
      article.bodyMarkdown &&
      article.categorySlug &&
      article.datePublished &&
      article.author?.verified &&
      article.author.verificationNote &&
      article.sources?.[0]?.verified &&
      article.sources[0].canonicalUrl &&
      article.evidence?.length,
  );
}

const rawManifest = readManifest();
const rawArticles = rawManifest.categories
  .flatMap((category) => category.articles)
  .filter(isComplete)
  .sort(
    (left, right) =>
      Date.parse(right.datePublished) - Date.parse(left.datePublished),
  );

if (rawManifest.categories.length !== 6 || rawArticles.length !== 30) {
  throw new Error(
    `Researched-news completeness gate failed: ${rawManifest.categories.length} categories, ${rawArticles.length} articles`,
  );
}

const categories: NewsCategory[] = rawManifest.categories.map((category) => ({
  id: category.slug,
  name: category.name,
  slug: category.slug,
  description: CATEGORY_DESCRIPTIONS[category.slug] ?? null,
  articleCount: category.articles.filter(isComplete).length,
}));

function toListItem(article: RawArticle): ArticleListItem {
  const category = categories.find((item) => item.slug === article.categorySlug);
  if (!category) throw new Error(`Unknown category: ${article.categorySlug}`);
  const source = article.sources[0];
  const image = getResearchedImage(article.slug, source.canonicalUrl);
  return {
    id: article.slug,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    thumbnailUrl: image.localPath,
    publishedAt: article.datePublished,
    category: { name: category.name, slug: category.slug },
    author: {
      name: article.author.name,
      slug: article.author.slug,
      authorType: article.author.authorType,
    },
  };
}

export function getResearchedCategories(): { data: NewsCategory[] } {
  return { data: categories };
}

export function getResearchedArticles(
  query: ArticleQuery = {},
): ArticleListResponse {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  let selected = query.category
    ? rawArticles.filter((item) => item.categorySlug === query.category)
    : rawArticles;
  if (query.sort === 'oldest') selected = [...selected].reverse();
  const totalItems = selected.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const start = (page - 1) * limit;
  return {
    data: selected.slice(start, start + limit).map(toListItem),
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export function getResearchedArticleBySlug(
  slug: string,
): ArticleDetailResponse | undefined {
  const index = rawArticles.findIndex((item) => item.slug === slug);
  if (index < 0) return undefined;
  const article = rawArticles[index];
  const source = article.sources[0];
  const image = getResearchedImage(article.slug, source.canonicalUrl);
  const detail: ArticleDetail = {
    ...toListItem(article),
    contentHtml: markdownToSafeHtml(article.bodyMarkdown),
    coverImageUrl: image.localPath,
    readingTime: Math.max(1, Math.ceil(article.bodyMarkdown.split(/\s+/).length / 220)),
    sourceName: source.sourceName,
    sourceUrl: source.canonicalUrl,
    isFeatured: index < 5,
    author: {
      name: article.author.name,
      slug: article.author.slug,
      authorType: article.author.authorType,
      verificationNote: article.author.verificationNote,
    },
    evidence: article.evidence,
    imageProvenance: image,
    relatedArticles: rawArticles
      .filter(
        (item) =>
          item.categorySlug === article.categorySlug && item.slug !== article.slug,
      )
      .slice(0, 3)
      .map(toListItem),
    previousArticle: rawArticles[index + 1]
      ? toListItem(rawArticles[index + 1])
      : null,
    nextArticle: rawArticles[index - 1]
      ? toListItem(rawArticles[index - 1])
      : null,
  };
  return { data: detail };
}
```

- [ ] **Step 6: Run GREEN**

Run:

```powershell
npm run test:web -- --test-name-pattern "six categories|requested category|old demo|full detail|unique new"
```

Expected: 5 repository tests pass, 0 fail.

- [ ] **Step 7: Add the Antigravity blacklist assertion**

Add these imports to `researched-news.spec.ts`:

```ts
import { readFileSync } from 'node:fs';
import path from 'node:path';

const workspaceRoot = path.resolve(import.meta.dirname, '..', '..', '..');
```

Add this test:

```ts
test('does not reuse any source URL from the Antigravity manifest', () => {
  type OldArticle = {
    source?: { canonicalUrl?: string; url?: string };
    sources?: Array<{ canonicalUrl?: string; sourceUrl?: string }>;
    canonicalUrl?: string;
  };
  type OldManifest = {
    categories: Array<{ articles: OldArticle[] }>;
  };
  const oldManifest = JSON.parse(
    readFileSync(
      path.join(
        workspaceRoot,
        'md',
        'content-research',
        'manifest-2026-07-23.json',
      ),
      'utf8',
    ),
  ) as OldManifest;
  const oldUrls = new Set(
    oldManifest.categories
      .flatMap((category) => category.articles)
      .map(
        (article) =>
          article.sources?.[0]?.canonicalUrl ??
          article.sources?.[0]?.sourceUrl ??
          article.source?.canonicalUrl ??
          article.source?.url ??
          article.canonicalUrl,
      )
      .filter((value): value is string => Boolean(value)),
  );
  const articles = getResearchedArticles({ limit: 100 }).data;
  for (const article of articles) {
    const detail = getResearchedArticleBySlug(article.slug);
    assert.ok(detail);
    assert.equal(oldUrls.has(detail.data.sourceUrl ?? ''), false);
  }
});
```

- [ ] **Step 8: Run the complete repository test file**

Run:

```powershell
npx tsx --test apps/web/test/researched-news.spec.ts
```

Expected: all repository tests pass and report 30 accepted preview articles.

- [ ] **Step 9: Inspect the checkpoint without staging**

Run:

```powershell
git diff -- apps/web/types/news.ts apps/web/lib/researched-news.ts apps/web/data/researched-images.ts apps/web/test/researched-news.spec.ts
```

Expected: only repository/type/test changes. Do not stage or commit.

---

### Task 3: Download and record original source-page cover images

**Files:**

- Create: `apps/web/test/source-image.spec.ts`
- Create: `apps/web/lib/source-image.ts`
- Create: `scripts/sync-researched-news-images.ts`
- Generate: `apps/web/public/images/news/researched/manifest.json`
- Generate: `apps/web/public/images/news/researched/<article-slug>.<ext>`

**Interfaces:**

- Consumes: source article HTML and image response content type.
- Produces:
  - `extractOgImage(html: string, pageUrl: string): string | null`
  - `extensionForContentType(contentType: string): 'jpg' | 'png' | 'webp' | null`
  - a 30-record image provenance manifest.

- [ ] **Step 1: Write failing image metadata tests**

Create `apps/web/test/source-image.spec.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extensionForContentType,
  extractOgImage,
} from '../lib/source-image';

test('extracts an absolute og:image URL', () => {
  const html = '<meta property="og:image" content="https://cdn.example.com/a.jpg">';
  assert.equal(
    extractOgImage(html, 'https://example.com/article'),
    'https://cdn.example.com/a.jpg',
  );
});

test('resolves a relative og:image URL against the source page', () => {
  const html = '<meta content="/images/a.webp" property="og:image">';
  assert.equal(
    extractOgImage(html, 'https://example.com/news/article'),
    'https://example.com/images/a.webp',
  );
});

test('rejects non-http image URLs and unsupported response types', () => {
  assert.equal(
    extractOgImage(
      '<meta property="og:image" content="data:image/png;base64,abc">',
      'https://example.com/article',
    ),
    null,
  );
  assert.equal(extensionForContentType('image/jpeg; charset=binary'), 'jpg');
  assert.equal(extensionForContentType('text/html'), null);
});
```

- [ ] **Step 2: Run RED**

Run:

```powershell
npx tsx --test apps/web/test/source-image.spec.ts
```

Expected: FAIL because `apps/web/lib/source-image.ts` does not exist.

- [ ] **Step 3: Implement source metadata parsing**

Create `apps/web/lib/source-image.ts`:

```ts
function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/gs)) {
    result[match[1].toLowerCase()] = match[3];
  }
  return result;
}

export function extractOgImage(html: string, pageUrl: string): string | null {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const values = attributes(tag);
    if ((values.property ?? values.name)?.toLowerCase() !== 'og:image') continue;
    if (!values.content) continue;
    try {
      const url = new URL(values.content, pageUrl);
      return /^https?:$/.test(url.protocol) ? url.toString() : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function extensionForContentType(
  contentType: string,
): 'jpg' | 'png' | 'webp' | null {
  const normalized = contentType.split(';', 1)[0].trim().toLowerCase();
  if (normalized === 'image/jpeg') return 'jpg';
  if (normalized === 'image/png') return 'png';
  if (normalized === 'image/webp') return 'webp';
  return null;
}
```

- [ ] **Step 4: Run GREEN**

Run:

```powershell
npx tsx --test apps/web/test/source-image.spec.ts
```

Expected: 3 tests pass, 0 fail.

- [ ] **Step 5: Implement the image sync command**

Create `scripts/sync-researched-news-images.ts`:

```ts
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import {
  extensionForContentType,
  extractOgImage,
} from '../apps/web/lib/source-image';

type RawArticle = {
  slug: string;
  sources: Array<{
    sourceName: string;
    canonicalUrl: string;
  }>;
};

type RawManifest = {
  categories: Array<{ articles: RawArticle[] }>;
};

type OutputRecord = {
  localPath: string;
  originalImageUrl: string | null;
  sourcePageUrl: string;
  credit: string | null;
  isPlaceholder: boolean;
};

const workspaceRoot = path.resolve(import.meta.dirname, '..');
const sourceManifestPath = path.join(
  workspaceRoot,
  'md',
  'content-research',
  'manifest-codex-2026-07-23.json',
);
const outputDirectory = path.join(
  workspaceRoot,
  'apps',
  'web',
  'public',
  'images',
  'news',
  'researched',
);
const outputManifestPath = path.join(outputDirectory, 'manifest.json');
const requestHeaders = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,image/avif,image/webp,image/*,*/*',
};

function fallback(
  sourcePageUrl: string,
  sourceName: string,
): OutputRecord {
  return {
    localPath: '/images/news/placeholder-default.svg',
    originalImageUrl: null,
    sourcePageUrl,
    credit: sourceName,
    isPlaceholder: true,
  };
}

async function syncArticle(
  article: RawArticle,
): Promise<[string, OutputRecord]> {
  const source = article.sources[0];
  const sourcePageUrl = source.canonicalUrl;
  try {
    const pageResponse = await fetch(sourcePageUrl, {
      headers: requestHeaders,
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
    });
    if (!pageResponse.ok) {
      throw new Error(`source page HTTP ${pageResponse.status}`);
    }
    const html = await pageResponse.text();
    const originalImageUrl = extractOgImage(html, pageResponse.url);
    if (!originalImageUrl) throw new Error('og:image not found');

    const imageResponse = await fetch(originalImageUrl, {
      headers: requestHeaders,
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
    });
    if (!imageResponse.ok) {
      throw new Error(`image HTTP ${imageResponse.status}`);
    }
    const extension = extensionForContentType(
      imageResponse.headers.get('content-type') ?? '',
    );
    if (!extension) throw new Error('unsupported image content type');

    const filename = `${article.slug}.${extension}`;
    const bytes = Buffer.from(await imageResponse.arrayBuffer());
    if (bytes.length === 0) throw new Error('empty image response');
    writeFileSync(path.join(outputDirectory, filename), bytes);

    const record: OutputRecord = {
      localPath: `/images/news/researched/${filename}`,
      originalImageUrl,
      sourcePageUrl,
      credit: source.sourceName,
      isPlaceholder: false,
    };
    process.stdout.write(`downloaded ${article.slug}\n`);
    return [article.slug, record];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stdout.write(`placeholder ${article.slug}: ${message}\n`);
    return [article.slug, fallback(sourcePageUrl, source.sourceName)];
  }
}

async function main(): Promise<void> {
  const manifest = JSON.parse(
    readFileSync(sourceManifestPath, 'utf8'),
  ) as RawManifest;
  const articles = manifest.categories.flatMap(
    (category) => category.articles,
  );
  if (articles.length !== 30) {
    throw new Error(`Expected 30 articles, received ${articles.length}`);
  }

  mkdirSync(outputDirectory, { recursive: true });
  const results = new Array<[string, OutputRecord]>(articles.length);
  let nextIndex = 0;
  async function worker(): Promise<void> {
    while (nextIndex < articles.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await syncArticle(articles[currentIndex]);
    }
  }
  await Promise.all(Array.from({ length: 4 }, () => worker()));

  const records = Object.fromEntries(results);
  writeFileSync(
    outputManifestPath,
    `${JSON.stringify(records, null, 2)}\n`,
    'utf8',
  );
  const downloaded = Object.values(records).filter(
    (record) => !record.isPlaceholder,
  ).length;
  process.stdout.write(
    `image sync complete: ${downloaded} downloaded, ${articles.length - downloaded} placeholders\n`,
  );
}

await main();
```

This command writes only inside
`apps/web/public/images/news/researched/` and does not delete existing files.

- [ ] **Step 6: Run the sync command**

Run:

```powershell
npm run sync:news-images
```

Expected: 30 provenance records. If sandboxed network access fails, rerun the
same scoped command with approval for network access. Individual unavailable
sources become explicit placeholders rather than aborting the other downloads.

- [ ] **Step 7: Add and run the image coverage assertion**

Add this test to `researched-news.spec.ts`:

```ts
test('records image provenance for all thirty researched articles', () => {
  const articles = getResearchedArticles({ limit: 100 }).data;
  for (const article of articles) {
    const detail = getResearchedArticleBySlug(article.slug);
    assert.ok(detail);
    assert.equal(detail.data.imageProvenance.sourcePageUrl, detail.data.sourceUrl);
    assert.ok(detail.data.imageProvenance.localPath.startsWith('/images/news/'));
  }
});
```

Run:

```powershell
npx tsx --test apps/web/test/researched-news.spec.ts
```

Expected: all tests pass for 30 image records.

- [ ] **Step 8: Inspect image output without staging**

Run:

```powershell
Get-ChildItem 'apps\web\public\images\news\researched' -File |
  Select-Object Name, Length
```

Expected: `manifest.json` plus downloaded images; any fallback is documented
inside `manifest.json`. Do not stage or commit.

---

### Task 4: Switch news routes to preview data and hide all old articles

**Files:**

- Create: `apps/web/test/news-route-source.spec.ts`
- Modify: `apps/web/app/ban-tin/page.tsx`
- Modify: `apps/web/app/ban-tin/chuyen-muc/[slug]/page.tsx`
- Modify: `apps/web/app/ban-tin/[articleSlug]/page.tsx`

**Interfaces:**

- Consumes: the three repository functions from Task 2.
- Produces: all `/ban-tin` routes without `/api/articles` or `/api/categories`
  access.

- [ ] **Step 1: Write the failing route-source regression test**

Create `apps/web/test/news-route-source.spec.ts`:

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const routeFiles = [
  'apps/web/app/ban-tin/page.tsx',
  'apps/web/app/ban-tin/chuyen-muc/[slug]/page.tsx',
  'apps/web/app/ban-tin/[articleSlug]/page.tsx',
];
const workspaceRoot = path.resolve(import.meta.dirname, '..', '..', '..');

test('news routes use researched preview data and never import the API client', () => {
  for (const relativePath of routeFiles) {
    const source = readFileSync(
      path.join(workspaceRoot, relativePath),
      'utf8',
    );
    assert.doesNotMatch(source, /api-client/);
    assert.match(source, /researched-news/);
  }
});
```

- [ ] **Step 2: Run RED**

Run:

```powershell
npx tsx --test apps/web/test/news-route-source.spec.ts
```

Expected: FAIL because all three pages still import `api-client`.

- [ ] **Step 3: Switch the overview page**

Replace API imports with:

```ts
import {
  getResearchedArticles,
  getResearchedCategories,
} from '../../lib/researched-news';
```

Use:

```ts
const categoriesResponse = getResearchedCategories();
const featuredResponse = getResearchedArticles({ page: 1, limit: 5 });
const latestResponse = getResearchedArticles({ page: 1, limit: 10 });
```

Keep the existing visible layout and update the intro copy to state that the
articles are researched and source-verified.

- [ ] **Step 4: Switch the category page**

Import only `getResearchedArticles` and `getResearchedCategories`. Remove
`isNotFoundError` and API try/catch behavior. `findCategory` becomes synchronous,
and an unknown category still calls `notFound()`.

- [ ] **Step 5: Switch the article detail page**

Import `getResearchedArticleBySlug`. Implement:

```ts
function loadArticle(slug: string) {
  const response = getResearchedArticleBySlug(slug);
  if (!response) notFound();
  return response.data;
}
```

Keep metadata generation and navigation. Render the new author and evidence
fields in Task 5.

- [ ] **Step 6: Run GREEN**

Run:

```powershell
npx tsx --test apps/web/test/news-route-source.spec.ts
```

Expected: 1 test passes, 0 fail.

- [ ] **Step 7: Prove the old API route cannot leak into preview pages**

Run:

```powershell
Select-String -LiteralPath `
  'apps\web\app\ban-tin\page.tsx',`
  'apps\web\app\ban-tin\chuyen-muc\[slug]\page.tsx',`
  'apps\web\app\ban-tin\[articleSlug]\page.tsx' `
  -Pattern 'api-client|getArticles|getCategories|getArticleBySlug'
```

Expected: no matches for API-client function names; researched repository names
may match only their distinct `getResearched...` forms.

- [ ] **Step 8: Inspect the checkpoint without staging**

Run:

```powershell
git diff -- apps/web/app/ban-tin
```

Expected: only the three route files are changed. Do not stage or commit.

---

### Task 5: Present author, source, and verification details

**Files:**

- Modify: `apps/web/components/news/NewsCard.tsx`
- Modify: `apps/web/components/news/FeaturedNews.tsx`
- Modify: `apps/web/app/ban-tin/[articleSlug]/page.tsx`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/components/news/ArticleContent.module.css`

**Interfaces:**

- Consumes: optional `viewCount`, `author`, `evidence`, and `imageProvenance`.
- Produces: cards and article detail pages without fabricated metrics and with
  visible verification context.

- [ ] **Step 1: Update card metadata**

Replace the unconditional view count with:

```tsx
<div className={styles.meta}>
  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
  <span>{article.author.name}</span>
  {article.viewCount !== undefined && (
    <span>{article.viewCount.toLocaleString('vi-VN')} lượt xem</span>
  )}
</div>
```

- [ ] **Step 2: Add author to featured content**

Below the primary excerpt, show:

```tsx
<span className={styles.readMore}>
  {primary.author.name} · Đọc bài viết →
</span>
```

Do not introduce a view count.

- [ ] **Step 3: Add byline and image provenance to article detail**

In the article metadata render:

```tsx
<span>Tác giả: {article.author.name}</span>
```

Below the cover render a caption only when an original image exists:

```tsx
{!article.imageProvenance.isPlaceholder && (
  <p className="article-image-credit">
    Ảnh từ nguồn bài viết: {article.imageProvenance.credit ?? article.sourceName}
  </p>
)}
```

- [ ] **Step 4: Add the evidence block**

After `ArticleContent`, render:

```tsx
<aside className="article-evidence" aria-labelledby="evidence-heading">
  <p className="eyebrow">MINH BẠCH NGUỒN</p>
  <h2 id="evidence-heading">Nguồn kiểm chứng</h2>
  <ul>
    {article.evidence.map((item) => (
      <li key={`${item.sourceUrl}-${item.claim}`}>
        <strong>{item.claim}</strong>
        <p>{item.evidenceNote}</p>
        <a href={item.sourceUrl} target="_blank" rel="noreferrer">
          Mở nguồn gốc
        </a>
      </li>
    ))}
  </ul>
</aside>
```

- [ ] **Step 5: Add focused styles**

Add to `apps/web/app/globals.css`:

```css
.article-image-credit {
  max-width: 980px;
  margin: -30px 0 42px;
  color: var(--muted);
  font-size: 0.78rem;
  line-height: 1.5;
}
.article-evidence {
  max-width: 780px;
  margin-top: 42px;
  padding: 26px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
}
.article-evidence h2 {
  margin: 8px 0 18px;
  font-size: 1.35rem;
}
.article-evidence ul {
  display: grid;
  gap: 18px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.article-evidence li {
  padding-top: 18px;
  border-top: 1px solid var(--line);
}
.article-evidence li:first-child {
  padding-top: 0;
  border-top: 0;
}
.article-evidence strong {
  display: block;
  line-height: 1.5;
}
.article-evidence p {
  margin: 7px 0;
  color: var(--muted);
  line-height: 1.65;
}
.article-evidence a {
  color: var(--brand-dark);
  font-size: 0.84rem;
  font-weight: 800;
}
@media (max-width: 700px) {
  .article-evidence {
    padding: 20px;
  }
}
```

Do not change header/footer styles.

- [ ] **Step 6: Run typecheck**

Run:

```powershell
npm run typecheck:web
```

Expected: exit 0 with no TypeScript errors.

- [ ] **Step 7: Run all web tests**

Run:

```powershell
npm run test:web
```

Expected: all Markdown, repository, source-image, and route-source tests pass.

- [ ] **Step 8: Inspect the checkpoint without staging**

Run:

```powershell
git diff -- apps/web/components/news apps/web/app/ban-tin apps/web/app/globals.css
```

Expected: only scoped presentation changes. Do not stage or commit.

---

### Task 6: Production build and visual QA

**Files:**

- Verify: all Task 1–5 files
- Do not create database migrations, seed changes, or API changes

**Interfaces:**

- Consumes: completed preview frontend.
- Produces: evidence that only the new researched content is visible and the
  application builds.

- [ ] **Step 1: Run the complete automated verification**

Run separately and read every exit code:

```powershell
npm run test:web
```

```powershell
npm run typecheck:web
```

```powershell
npm run build:web
```

Expected: all commands exit 0.

- [ ] **Step 2: Start the local web server**

Run:

```powershell
npm run dev:web
```

Expected: Next.js reports a local URL and remains running for QA.

- [ ] **Step 3: Perform route QA**

Open and inspect:

- `/ban-tin`
- all six `/ban-tin/chuyen-muc/<slug>` pages
- one article detail page from each category
- one known old/demo slug

Expected:

- overview shows researched articles only;
- each category shows exactly five matching articles;
- each checked detail has full body, author, source, cover, and evidence;
- old/demo slug returns 404;
- no news page requests `/api/articles` or `/api/categories`;
- layout remains usable at desktop and mobile widths.

- [ ] **Step 4: Run a final data integrity check**

Run:

```powershell
node C:\tmp\verify-myfuture-artifacts.js
```

Expected: no failures, 6 categories, 30 articles, 30 unique slugs, 30 unique
source URLs.

- [ ] **Step 5: Confirm database and API boundaries**

Run:

```powershell
git diff --name-only
```

Expected: no files under `prisma/` or `apps/api/`.

Run:

```powershell
git diff --cached --name-only
```

Expected: empty output.

- [ ] **Step 6: Report the exact result**

Report:

- number of downloaded source images and placeholders;
- web test count and failures;
- typecheck/build exit status;
- routes visually inspected;
- confirmation that old database records remain untouched but hidden;
- all changed/untracked files;
- no stage/commit.
