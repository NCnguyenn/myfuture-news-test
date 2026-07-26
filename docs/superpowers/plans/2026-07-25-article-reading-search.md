# Article Reading and Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vietnamese-aware article search, a polished visual search overlay, a sticky discovery sidebar on article details, reliable scroll-to-top navigation, and professional Vietnamese text wrapping.

**Architecture:** Extend the existing `GET /api/articles` flow with application-level Vietnamese normalization and relevance ranking, then expose it to the browser through a same-origin Next.js Route Handler. Keep search interaction in focused client components, reuse existing news presentation components, and keep article data loading server-rendered.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.7, NestJS 11, Prisma 6, PostgreSQL, Redis, Node test runner, CSS Modules.

## Global Constraints

- Extend the existing article API; do not add an external or standalone search service.
- Search title, excerpt, category, and body with Vietnamese queries both with and without diacritics.
- Keep `API_BASE_URL` server-only.
- Show no more than 6 quick results in the overlay.
- Limit search queries to 100 characters and do not request results below 2 trimmed characters.
- Keep mobile discovery panels in normal document flow; never make the mobile sidebar sticky.
- Preserve article facts, names, figures, dates, and editorial meaning.
- Keep all source files UTF-8 and do not mass-re-encode already correct text.
- Respect `prefers-reduced-motion`.
- Use TDD: observe each focused test fail before implementing the corresponding behavior.

---

## File Structure

### Backend

- Create `apps/backend/src/articles/article-search.ts`: pure Vietnamese normalization, matching, scoring, and snippet generation.
- Modify `apps/backend/src/articles/articles-query.dto.ts`: validate and normalize the optional `q` parameter.
- Modify `apps/backend/src/articles/articles.service.ts`: branch list queries into ordinary and relevance-ranked search paths.
- Modify `apps/backend/src/cache/cache.keys.ts`: isolate cached search lists by normalized query.
- Create `apps/backend/test/article-search.spec.ts`: pure search-engine regression tests.
- Modify `apps/backend/test/articles.service.spec.ts`: service-level search and pagination tests.
- Modify `apps/backend/test/cache/cache.keys.spec.ts`: search cache-key tests.

### Frontend search transport and pages

- Modify `apps/frontend/types/news.ts`: expose `q`, `searchSnippet`, and `matchedFields`.
- Modify `apps/frontend/lib/api-client.ts`: serialize `q`.
- Create `apps/frontend/app/api/news-search/route.ts`: same-origin quick-search proxy.
- Create `apps/frontend/test/api-client.spec.ts`: query serialization test.
- Create `apps/frontend/test/news-search-route-source.spec.ts`: Route Handler contract test.
- Create `apps/frontend/lib/search-highlight.ts`: accent-insensitive safe text segmentation for `<mark>`.
- Create `apps/frontend/test/search-highlight.spec.ts`: highlighting tests.
- Create `apps/frontend/components/search/SearchLauncher.tsx`: owns dialog open/close state.
- Create `apps/frontend/components/search/SearchOverlay.tsx`: debounced fetch, result state, keyboard navigation, and focus handling.
- Create `apps/frontend/components/search/SearchOverlay.module.css`: overlay and result presentation.
- Modify `apps/frontend/components/layout/Header.tsx`: render the launcher.
- Modify `apps/frontend/components/layout/Header.module.css`: accommodate the prominent control responsively.
- Create `apps/frontend/app/ban-tin/tim-kiem/page.tsx`: server-rendered full results.
- Create `apps/frontend/app/ban-tin/tim-kiem/page.module.css`: search-results layout.
- Modify `apps/frontend/components/news/Pagination.tsx`: preserve arbitrary query parameters.
- Modify `apps/frontend/test/editorial-ui-source.spec.ts`: assert the newly approved search control.
- Create `apps/frontend/test/search-page-source.spec.ts`: full-result page and query-preserving pagination tests.

### Article reading and typography

- Create `apps/frontend/components/news/ScrollToTopOnArticleChange.tsx`: immediate scroll reset keyed by article slug.
- Modify `apps/frontend/app/ban-tin/[articleSlug]/page.tsx`: load and render sticky discovery content.
- Modify `apps/frontend/app/ban-tin/[articleSlug]/page.module.css`: desktop grid, sticky bounds, and mobile flow.
- Modify `apps/frontend/app/globals.css`: remove global smooth scrolling and unsafe heading wrapping.
- Modify `apps/frontend/components/news/ArticleHeader.module.css`: natural Vietnamese title wrapping.
- Modify `apps/frontend/components/news/ArticleContent.module.css`: natural body/heading wrapping.
- Modify `apps/frontend/components/news/NewsCard.module.css`: natural card-title wrapping.
- Modify `apps/frontend/test/news-presentation-source.spec.ts`: assert sticky discovery and scroll reset.
- Create `apps/frontend/test/vietnamese-typography-source.spec.ts`: prevent the specific character-splitting regression.
- Modify `README.md`: document search API and UI routes.

---

### Task 1: Vietnamese Search Engine, DTO, and Cache Contract

**Files:**
- Create: `apps/backend/src/articles/article-search.ts`
- Modify: `apps/backend/src/articles/articles-query.dto.ts`
- Modify: `apps/backend/src/cache/cache.keys.ts`
- Create: `apps/backend/test/article-search.spec.ts`
- Modify: `apps/backend/test/cache/cache.keys.spec.ts`

**Interfaces:**
- Produces: `normalizeVietnameseSearch(value: string): string`
- Produces: `rankArticleSearch(article: SearchableArticle, query: string): ArticleSearchMatch | null`
- Produces: `ArticleSearchMatch = { score: number; searchSnippet: string; matchedFields: SearchMatchedField[] }`
- Extends: `ArticlesQueryDto.q?: string`
- Extends: `ArticleListCacheKeyInput.q?: string`

- [ ] **Step 1: Write failing normalization and ranking tests**

Create `apps/backend/test/article-search.spec.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeVietnameseSearch,
  rankArticleSearch,
} from '../src/articles/article-search';

const article = {
  title: 'Hà Nội phát triển nhà ở cho thuê dài hạn',
  excerpt: 'Giá thuê và vận hành là hai điểm cốt lõi.',
  contentHtml: '<h2>Từ chủ trương đến sản phẩm ở được</h2><p>Nguồn cung ổn định.</p>',
  category: { name: 'Cho thuê' },
};

test('normalizes Vietnamese diacritics and đ deterministically', () => {
  assert.equal(
    normalizeVietnameseSearch('  Bất động sản — Đà Nẵng  '),
    'bat dong san da nang',
  );
});

test('matches unaccented queries and ranks title above body', () => {
  const titleMatch = rankArticleSearch(article, 'ha noi');
  const bodyMatch = rankArticleSearch(article, 'san pham o duoc');
  assert.ok(titleMatch);
  assert.ok(bodyMatch);
  assert.ok(titleMatch.score > bodyMatch.score);
  assert.deepEqual(titleMatch.matchedFields, ['title']);
});

test('returns a plain-text snippet and no match for unrelated terms', () => {
  const match = rankArticleSearch(article, 'cot loi');
  assert.ok(match);
  assert.equal(match.searchSnippet.includes('<'), false);
  assert.match(match.searchSnippet, /cốt lõi/i);
  assert.equal(rankArticleSearch(article, 'chứng khoán'), null);
});
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```powershell
npx.cmd tsx --test apps/backend/test/article-search.spec.ts
```

Expected: FAIL because `article-search.ts` does not exist.

- [ ] **Step 3: Implement the pure search helper**

Create `apps/backend/src/articles/article-search.ts` with these exported types and rules:

```ts
import sanitizeHtml from 'sanitize-html';

export type SearchMatchedField = 'title' | 'excerpt' | 'category' | 'body';

export type SearchableArticle = {
  title: string;
  excerpt: string;
  contentHtml: string;
  category: { name: string };
};

export type ArticleSearchMatch = {
  score: number;
  searchSnippet: string;
  matchedFields: SearchMatchedField[];
};

export function normalizeVietnameseSearch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('vi-VN')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function plainText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
}

function containsAllTokens(value: string, tokens: string[]): boolean {
  return tokens.every((token) => value.includes(token));
}

function makeSnippet(text: string, tokens: string[]): string {
  const normalizedWords = text.split(/\s+/);
  const index = normalizedWords.findIndex((word) => {
    const normalized = normalizeVietnameseSearch(word);
    return tokens.some((token) => normalized.includes(token));
  });
  const start = Math.max(0, index < 0 ? 0 : index - 8);
  const snippet = normalizedWords.slice(start, start + 24).join(' ');
  return `${start > 0 ? '…' : ''}${snippet}${start + 24 < normalizedWords.length ? '…' : ''}`;
}

export function rankArticleSearch(
  article: SearchableArticle,
  query: string,
): ArticleSearchMatch | null {
  const normalizedQuery = normalizeVietnameseSearch(query);
  if (!normalizedQuery) return null;

  const tokens = normalizedQuery.split(' ');
  const bodyText = plainText(article.contentHtml);
  const fields = {
    title: normalizeVietnameseSearch(article.title),
    excerpt: normalizeVietnameseSearch(article.excerpt),
    category: normalizeVietnameseSearch(article.category.name),
    body: normalizeVietnameseSearch(bodyText),
  };
  const matchedFields = (Object.entries(fields) as Array<
    [SearchMatchedField, string]
  >)
    .filter(([, value]) => containsAllTokens(value, tokens))
    .map(([field]) => field);
  if (matchedFields.length === 0) return null;

  let score = 0;
  if (fields.title.includes(normalizedQuery)) score += 120;
  if (containsAllTokens(fields.title, tokens)) score += 60;
  score += tokens.filter((token) => fields.title.includes(token)).length * 20;
  if (containsAllTokens(fields.excerpt, tokens)) score += 35;
  if (containsAllTokens(fields.category, tokens)) score += 25;
  if (containsAllTokens(fields.body, tokens)) score += 10;

  const snippetSource = matchedFields.includes('excerpt')
    ? article.excerpt
    : matchedFields.includes('body')
      ? bodyText
      : article.excerpt;
  return {
    score,
    searchSnippet: makeSnippet(snippetSource, tokens),
    matchedFields,
  };
}
```

- [ ] **Step 4: Add DTO and cache-key regression tests**

Extend `apps/backend/test/cache/cache.keys.spec.ts`:

```ts
assert.equal(
  articleListCacheKey({
    category: undefined,
    page: 1,
    limit: 6,
    featured: undefined,
    sort: 'newest',
    q: 'bat dong san',
  }),
  'news:articles:all:1:6:any:newest:q:bat%20dong%20san',
);
```

In `articles-query.dto.ts`, import `MaxLength` and `MinLength`, trim `q`, and define:

```ts
@Transform(({ value }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
})
@IsOptional()
@IsString()
@MinLength(2)
@MaxLength(100)
q?: string;
```

Extend `ArticleListCacheKeyInput` with `q?: string` and append this only when present:

```ts
const search = input.q ? `:q:${encodeURIComponent(input.q)}` : '';
return `news:articles:${category}:${input.page}:${input.limit}:${featured}:${input.sort}${search}`;
```

- [ ] **Step 5: Run focused tests**

Run:

```powershell
npx.cmd tsx --test apps/backend/test/article-search.spec.ts apps/backend/test/cache/cache.keys.spec.ts
```

Expected: all tests PASS.

- [ ] **Step 6: Commit Task 1**

```powershell
git add apps/backend/src/articles/article-search.ts apps/backend/src/articles/articles-query.dto.ts apps/backend/src/cache/cache.keys.ts apps/backend/test/article-search.spec.ts apps/backend/test/cache/cache.keys.spec.ts
git commit -m "feat(api): add Vietnamese article search primitives"
```

---

### Task 2: Integrate Relevance Search into the Existing Article List API

**Files:**
- Modify: `apps/backend/src/articles/articles.service.ts`
- Modify: `apps/backend/test/articles.service.spec.ts`

**Interfaces:**
- Consumes: `rankArticleSearch()` and `normalizeVietnameseSearch()` from Task 1.
- Produces: existing `GET /api/articles?q=...` response with optional `searchSnippet` and `matchedFields`.
- Preserves: ordinary category, featured, sort, pagination, detail, and cache behavior.

- [ ] **Step 1: Write failing service tests**

Add two tests to `apps/backend/test/articles.service.spec.ts`. The first mock returns at least three published rows containing `contentHtml`; call:

```ts
const result = await service.list({
  q: 'bat dong san',
  page: 1,
  limit: 2,
});

assert.equal(result.meta.totalItems, 2);
assert.equal(result.data[0].title, 'Bất động sản dẫn đầu');
assert.match(result.data[0].searchSnippet ?? '', /bất động sản/i);
assert.deepEqual(result.data[0].matchedFields, ['title', 'excerpt']);
assert.equal('contentHtml' in result.data[0], false);
```

The second test requests `page: 2, limit: 1` and asserts:

```ts
assert.deepEqual(result.meta, {
  page: 2,
  limit: 1,
  totalItems: 2,
  totalPages: 2,
  hasNextPage: false,
  hasPreviousPage: true,
});
assert.equal(result.data.length, 1);
```

Capture `findMany` arguments and assert search candidates are still constrained by:

```ts
assert.deepEqual(findManyArgs.where, { isPublished: true });
```

- [ ] **Step 2: Run the service tests and verify the search assertions fail**

Run:

```powershell
npx.cmd tsx --test apps/backend/test/articles.service.spec.ts
```

Expected: FAIL because `list()` does not use `q` or return search metadata.

- [ ] **Step 3: Add the search candidate shape and response fields**

In `articles.service.ts`:

```ts
import {
  normalizeVietnameseSearch,
  rankArticleSearch,
  type SearchMatchedField,
} from './article-search';
```

Extend `ArticleListQuery` and `ArticleListItem`:

```ts
type ArticleListQuery = Partial<ArticlesQueryDto> & {
  q?: string;
};

type ArticleListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl: string;
  imageAlt: string;
  publishedAt: Date | string;
  viewCount: number;
  category: { name: string; slug: string };
  author: {
    name: string;
    slug: string;
    authorType: string;
  };
  searchSnippet?: string;
  matchedFields?: SearchMatchedField[];
};
```

Add a search-only select that keeps body HTML inside the service:

```ts
const searchSelect = {
  ...listSelect,
  contentHtml: true,
} satisfies Prisma.ArticleSelect;
```

- [ ] **Step 4: Implement the search branch before the ordinary count/findMany path**

After category filtering, calculate:

```ts
const normalizedQuery = query.q
  ? normalizeVietnameseSearch(query.q)
  : undefined;
```

Pass `q: normalizedQuery` into `articleListCacheKey`. On a cache miss with `normalizedQuery`, load all published candidates matching the existing category/featured `where`, rank them, sort by descending score then descending `publishedAt`, slice by page, and map each item:

```ts
const ranked = candidates
  .map((candidate) => ({
    candidate,
    match: rankArticleSearch(candidate, normalizedQuery),
  }))
  .filter(
    (
      item,
    ): item is {
      candidate: (typeof candidates)[number];
      match: NonNullable<ReturnType<typeof rankArticleSearch>>;
    } => item.match !== null,
  )
  .sort(
    (left, right) =>
      right.match.score - left.match.score ||
      right.candidate.publishedAt.getTime() -
        left.candidate.publishedAt.getTime(),
  );
const totalItems = ranked.length;
const totalPages = Math.ceil(totalItems / limit);
const pageItems = ranked.slice((page - 1) * limit, page * limit);
const response = {
  data: pageItems.map(({ candidate, match }) => ({
    ...mapListItem(candidate),
    searchSnippet: match.searchSnippet,
    matchedFields: match.matchedFields,
  })),
  meta: {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  },
};
```

Cache and return the response using the existing list TTL. Do not expose `contentHtml`.

- [ ] **Step 5: Run API tests and typecheck**

Run:

```powershell
npx.cmd tsx --test apps/backend/test/articles.service.spec.ts apps/backend/test/article-search.spec.ts apps/backend/test/cache/cache.keys.spec.ts
npm.cmd run typecheck:api
```

Expected: all tests PASS and TypeScript exits 0.

- [ ] **Step 6: Commit Task 2**

```powershell
git add apps/backend/src/articles/articles.service.ts apps/backend/test/articles.service.spec.ts
git commit -m "feat(api): search published articles by relevance"
```

---

### Task 3: Frontend Search Types, API Client, and Same-Origin Route

**Files:**
- Modify: `apps/frontend/types/news.ts`
- Modify: `apps/frontend/lib/api-client.ts`
- Create: `apps/frontend/app/api/news-search/route.ts`
- Create: `apps/frontend/test/api-client.spec.ts`
- Create: `apps/frontend/test/news-search-route-source.spec.ts`

**Interfaces:**
- Produces: `ArticleQuery.q?: string`
- Produces: optional `ArticleListItem.searchSnippet` and `matchedFields`
- Produces: `GET /api/news-search?q=<term>&page=<n>&limit=<n>`

- [ ] **Step 1: Write failing API-client serialization test**

Create `apps/frontend/test/api-client.spec.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { getArticles } from '../lib/api-client';

test('serializes a Vietnamese article search query', async () => {
  let requestedUrl = '';
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request) => {
    requestedUrl = String(input);
    return new Response(
      JSON.stringify({
        data: [],
        meta: {
          page: 1,
          limit: 6,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  }) as typeof fetch;
  try {
    await getArticles({ q: 'bất động sản', page: 1, limit: 6 });
    assert.match(requestedUrl, /q=b%E1%BA%A5t\+%C4%91%E1%BB%99ng\+s%E1%BA%A3n/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/api-client.spec.ts
```

Expected: FAIL because `ArticleQuery` has no `q` field and the client does not serialize it.

- [ ] **Step 3: Extend frontend types and the server API client**

In `types/news.ts` add:

```ts
export type SearchMatchedField = 'title' | 'excerpt' | 'category' | 'body';

export type ArticleListItem = {
  // keep existing fields
  searchSnippet?: string;
  matchedFields?: SearchMatchedField[];
};

export type ArticleQuery = {
  // keep existing fields
  q?: string;
};
```

In `getArticles()` add before building the query string:

```ts
if (query.q) search.set('q', query.q);
```

- [ ] **Step 4: Write the failing Route Handler source contract**

Create `apps/frontend/test/news-search-route-source.spec.ts`:

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('quick-search route validates, bounds, and proxies through api-client', () => {
  const source = readFileSync(
    'apps/frontend/app/api/news-search/route.ts',
    'utf8',
  );
  assert.match(source, /getArticles/);
  assert.match(source, /query\.length < 2/);
  assert.match(source, /query\.length > 100/);
  assert.match(source, /Math\.min\(6/);
  assert.doesNotMatch(source, /API_BASE_URL/);
});
```

- [ ] **Step 5: Implement the same-origin Route Handler**

Create `apps/frontend/app/api/news-search/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { ApiClientError, getArticles } from '../../../lib/api-client';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get('q') ?? '').trim();
  const requestedLimit = Number(url.searchParams.get('limit') ?? '6');
  const limit = Math.max(1, Math.min(6, Number.isFinite(requestedLimit) ? requestedLimit : 6));

  if (query.length < 2 || query.length > 100) {
    return NextResponse.json(
      {
        message: 'Từ khóa tìm kiếm phải có từ 2 đến 100 ký tự.',
        code: 'INVALID_SEARCH_QUERY',
      },
      { status: 400 },
    );
  }

  try {
    const response = await getArticles({ q: query, page: 1, limit });
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ApiClientError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status },
      );
    }
    return NextResponse.json(
      {
        message: 'Tìm kiếm đang tạm thời gián đoạn. Vui lòng thử lại.',
        code: 'SEARCH_UNAVAILABLE',
      },
      { status: 503 },
    );
  }
}
```

- [ ] **Step 6: Run focused frontend tests and typecheck**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/api-client.spec.ts apps/frontend/test/news-search-route-source.spec.ts
npm.cmd run typecheck:web
```

Expected: all tests PASS and TypeScript exits 0.

- [ ] **Step 7: Commit Task 3**

```powershell
git add apps/frontend/types/news.ts apps/frontend/lib/api-client.ts apps/frontend/app/api/news-search/route.ts apps/frontend/test/api-client.spec.ts apps/frontend/test/news-search-route-source.spec.ts
git commit -m "feat(web): add same-origin article search transport"
```

---

### Task 4: Safe Highlighting and the Visual Search Overlay

**Files:**
- Create: `apps/frontend/lib/search-highlight.ts`
- Create: `apps/frontend/test/search-highlight.spec.ts`
- Create: `apps/frontend/components/search/SearchLauncher.tsx`
- Create: `apps/frontend/components/search/SearchOverlay.tsx`
- Create: `apps/frontend/components/search/SearchOverlay.module.css`
- Modify: `apps/frontend/components/layout/Header.tsx`
- Modify: `apps/frontend/components/layout/Header.module.css`
- Modify: `apps/frontend/test/editorial-ui-source.spec.ts`

**Interfaces:**
- Produces: `splitSearchHighlight(text: string, query: string): HighlightSegment[]`
- Produces: `<SearchLauncher />`
- Consumes: `GET /api/news-search` and `ArticleListResponse`

- [ ] **Step 1: Write failing highlight tests**

Create `apps/frontend/test/search-highlight.spec.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { splitSearchHighlight } from '../lib/search-highlight';

test('highlights accented Vietnamese words for an unaccented query', () => {
  assert.deepEqual(
    splitSearchHighlight('Thị trường bất động sản Hà Nội', 'bat dong san'),
    [
      { text: 'Thị trường ', highlighted: false },
      { text: 'bất động sản', highlighted: true },
      { text: ' Hà Nội', highlighted: false },
    ],
  );
});

test('returns one safe plain-text segment when there is no match', () => {
  assert.deepEqual(splitSearchHighlight('<script>alert(1)</script>', 'nhà ở'), [
    { text: '<script>alert(1)</script>', highlighted: false },
  ]);
});
```

- [ ] **Step 2: Run the highlight test and verify it fails**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/search-highlight.spec.ts
```

Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Implement accent-insensitive segmentation**

Create `search-highlight.ts` with:

```ts
export type HighlightSegment = { text: string; highlighted: boolean };

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('vi-VN')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitSearchHighlight(
  text: string,
  query: string,
): HighlightSegment[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [{ text, highlighted: false }];
  const tokens = normalizedQuery.split(' ');
  const parts = text.split(/(\s+)/);
  const selected = parts.map((part) =>
    tokens.some((token) => normalize(part).includes(token)),
  );
  const first = selected.findIndex(Boolean);
  const last = selected.findLastIndex(Boolean);
  if (first < 0) return [{ text, highlighted: false }];
  return [
    ...(first > 0
      ? [{ text: parts.slice(0, first).join(''), highlighted: false }]
      : []),
    { text: parts.slice(first, last + 1).join(''), highlighted: true },
    ...(last + 1 < parts.length
      ? [{ text: parts.slice(last + 1).join(''), highlighted: false }]
      : []),
  ];
}
```

- [ ] **Step 4: Update the header source test before UI implementation**

Replace the obsolete “does not add unsupported header controls” assertion in `editorial-ui-source.spec.ts` with:

```ts
test('renders the approved prominent search launcher', () => {
  const source = read('apps/frontend/components/layout/Header.tsx');
  assert.match(source, /SearchLauncher/);
  const launcher = read(
    'apps/frontend/components/search/SearchLauncher.tsx',
  );
  assert.match(launcher, /Tìm kiếm/);
  assert.match(launcher, /SearchOverlay/);
});
```

Run `npx.cmd tsx --test apps/frontend/test/editorial-ui-source.spec.ts` and expect FAIL because the components do not exist.

- [ ] **Step 5: Build the launcher and overlay**

`SearchLauncher.tsx` must be a client component that:

- renders a button with visible “Tìm kiếm” text and inline SVG magnifier;
- stores `open` state;
- stores the launcher ref;
- renders `SearchOverlay` while open;
- restores focus in `onClose`.

`SearchOverlay.tsx` must:

- use `role="dialog"`, `aria-modal="true"`, and an accessible heading;
- autofocus the search input;
- lock body scroll while open and restore it on cleanup;
- debounce 275 ms;
- abort the previous request with `AbortController`;
- never fetch under 2 trimmed characters;
- fetch `/api/news-search?q=${encodeURIComponent(query)}&limit=6`;
- render initial, loading, error, empty, and result states;
- track `activeIndex`;
- handle ArrowDown, ArrowUp, Enter, Escape, and Tab focus trapping;
- use `router.push('/ban-tin/<slug>')` when a result is chosen;
- render `splitSearchHighlight()` segments as text and `<mark>` nodes only;
- render “Xem tất cả kết quả” linking to `/ban-tin/tim-kiem?q=<query>`.

Use this state shape:

```ts
type SearchState =
  | { status: 'idle'; results: [] }
  | { status: 'loading'; results: ArticleListItem[] }
  | { status: 'success'; results: ArticleListItem[] }
  | { status: 'error'; results: []; message: string };
```

Use this exact user-facing copy:

```ts
const copy = {
  guidance: 'Nhập ít nhất 2 ký tự để tìm trong toàn bộ Bản tin.',
  loading: 'Đang tìm những bài viết phù hợp…',
  empty: 'Chưa tìm thấy bài viết phù hợp với từ khóa này.',
  error: 'Tìm kiếm đang tạm thời gián đoạn. Vui lòng thử lại.',
};
```

- [ ] **Step 6: Style the visual search interaction**

In `SearchOverlay.module.css`, implement:

```css
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  padding: clamp(16px, 5vw, 56px);
  background: rgba(16, 20, 28, 0.58);
  backdrop-filter: blur(10px);
  animation: fadeIn 180ms ease-out;
}

.dialog {
  width: min(920px, 100%);
  max-height: calc(100vh - 2 * clamp(16px, 5vw, 56px));
  margin: 0 auto;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 24px;
  background: var(--surface);
  box-shadow: 0 30px 90px rgba(12, 18, 28, 0.34);
  animation: slideIn 220ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .backdrop,
  .dialog {
    animation: none;
  }
}
```

Add complete responsive rules for the input row, close button, two-column desktop result cards, single-column mobile cards, selected card, `<mark>`, status area, and “Xem tất cả” action. Avoid layout animation and preserve visible focus.

Update `Header.tsx` so the right side is an actions container containing the existing nav and `<SearchLauncher />`. Update `Header.module.css` so mobile hides only the muted navigation, not search.

- [ ] **Step 7: Run focused tests and typecheck**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/search-highlight.spec.ts apps/frontend/test/editorial-ui-source.spec.ts
npm.cmd run typecheck:web
```

Expected: all tests PASS and TypeScript exits 0.

- [ ] **Step 8: Commit Task 4**

```powershell
git add apps/frontend/lib/search-highlight.ts apps/frontend/test/search-highlight.spec.ts apps/frontend/components/search/SearchLauncher.tsx apps/frontend/components/search/SearchOverlay.tsx apps/frontend/components/search/SearchOverlay.module.css apps/frontend/components/layout/Header.tsx apps/frontend/components/layout/Header.module.css apps/frontend/test/editorial-ui-source.spec.ts
git commit -m "feat(web): add immersive article search overlay"
```

---

### Task 5: Full Search Results and Query-Preserving Pagination

**Files:**
- Create: `apps/frontend/app/ban-tin/tim-kiem/page.tsx`
- Create: `apps/frontend/app/ban-tin/tim-kiem/page.module.css`
- Modify: `apps/frontend/components/news/Pagination.tsx`
- Create: `apps/frontend/test/search-page-source.spec.ts`

**Interfaces:**
- Produces: `/ban-tin/tim-kiem?q=<term>&page=<n>`
- Extends: `PaginationProps.query?: Record<string, string>`

- [ ] **Step 1: Write failing source tests**

Create `apps/frontend/test/search-page-source.spec.ts`:

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('search page server-renders API results and preserves the query', () => {
  const page = readFileSync(
    'apps/frontend/app/ban-tin/tim-kiem/page.tsx',
    'utf8',
  );
  assert.match(page, /getArticles\(\{\s*q:/s);
  assert.match(page, /Kết quả tìm kiếm/);
  assert.match(page, /query=\{\{\s*q:\s*query\s*\}\}/);
});

test('pagination merges query parameters instead of concatenating question marks', () => {
  const pagination = readFileSync(
    'apps/frontend/components/news/Pagination.tsx',
    'utf8',
  );
  assert.match(pagination, /URLSearchParams/);
  assert.match(pagination, /query\?/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/search-page-source.spec.ts
```

Expected: FAIL because the search page and query-aware pagination are absent.

- [ ] **Step 3: Extend pagination without breaking existing callers**

Change the interface and URL builder:

```ts
type PaginationProps = {
  meta: PaginationMeta;
  basePath: string;
  query?: Record<string, string>;
};

function pageHref(
  basePath: string,
  page: number,
  query: Record<string, string> = {},
) {
  const search = new URLSearchParams(query);
  if (page === 1) search.delete('page');
  else search.set('page', String(page));
  const queryString = search.toString();
  return `${basePath}${queryString ? `?${queryString}` : ''}`;
}
```

Pass `query` into every `pageHref()` call. Existing category pages continue to omit `query`.

- [ ] **Step 4: Build the server-rendered results page**

Create `page.tsx` with:

```ts
import type { Metadata } from 'next';
import Link from 'next/link';
import { NewsList } from '../../../components/news/NewsList';
import { Pagination } from '../../../components/news/Pagination';
import { getArticles } from '../../../lib/api-client';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Tìm kiếm | MyFuture News',
  description: 'Tìm kiếm bài viết trong Bản tin MyFuture News.',
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = (params.q ?? '').trim().slice(0, 100);
  const parsedPage = Number(params.page ?? '1');
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const response =
    query.length >= 2
      ? await getArticles({ q: query, page, limit: 10 })
      : null;

  return (
    <div className="page-shell">
      <div className={styles.breadcrumb}>
        <Link href="/ban-tin">Bản tin</Link>
        <span>/</span>
        <span>Tìm kiếm</span>
      </div>
      <header className={styles.header}>
        <p className="eyebrow">KHÁM PHÁ NỘI DUNG</p>
        <h1>Kết quả tìm kiếm</h1>
        <p>
          {query.length >= 2
            ? `Tìm thấy ${response?.meta.totalItems ?? 0} bài viết cho “${query}”.`
            : 'Nhập ít nhất 2 ký tự từ nút Tìm kiếm trên đầu trang.'}
        </p>
      </header>
      {response ? (
        <>
          <NewsList articles={response.data} title={`Kết quả cho “${query}”`} />
          <Pagination
            meta={response.meta}
            basePath="/ban-tin/tim-kiem"
            query={{ q: query }}
          />
        </>
      ) : null}
    </div>
  );
}
```

Style a restrained results header, breadcrumb, and mobile layout in `page.module.css`.

- [ ] **Step 5: Run tests, typecheck, and build the frontend**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/search-page-source.spec.ts
npm.cmd run typecheck:web
npm.cmd run build:web
```

Expected: test PASS, typecheck exits 0, and Next.js build succeeds with the search page and Route Handler listed.

- [ ] **Step 6: Commit Task 5**

```powershell
git add apps/frontend/app/ban-tin/tim-kiem/page.tsx apps/frontend/app/ban-tin/tim-kiem/page.module.css apps/frontend/components/news/Pagination.tsx apps/frontend/test/search-page-source.spec.ts
git commit -m "feat(web): add full article search results"
```

---

### Task 6: Sticky Article Discovery and Immediate Scroll Reset

**Files:**
- Create: `apps/frontend/components/news/ScrollToTopOnArticleChange.tsx`
- Modify: `apps/frontend/app/ban-tin/[articleSlug]/page.tsx`
- Modify: `apps/frontend/app/ban-tin/[articleSlug]/page.module.css`
- Modify: `apps/frontend/test/news-presentation-source.spec.ts`

**Interfaces:**
- Produces: `<ScrollToTopOnArticleChange articleSlug: string />`
- Reuses: `<PopularStories />` and `<CategoryDirectory />`
- Consumes: `getArticles({ sort: 'popular' })` and featured fallback data.

- [ ] **Step 1: Write failing source assertions**

Extend the article-detail test in `news-presentation-source.spec.ts`:

```ts
const detailStyles = read(
  'apps/frontend/app/ban-tin/[articleSlug]/page.module.css',
);
const scrollReset = read(
  'apps/frontend/components/news/ScrollToTopOnArticleChange.tsx',
);

assert.match(page, /<PopularStories/);
assert.match(page, /<CategoryDirectory/);
assert.match(page, /<ScrollToTopOnArticleChange/);
assert.match(page, /sort:\s*'popular'/);
assert.match(detailStyles, /position:\s*sticky/);
assert.match(detailStyles, /max-height:\s*calc\(100vh/);
assert.match(detailStyles, /@media\s*\(max-width:\s*980px\)/);
assert.match(scrollReset, /window\.scrollTo/);
assert.match(scrollReset, /articleSlug/);
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/news-presentation-source.spec.ts
```

Expected: FAIL because the detail route has no discovery sidebar or scroll-reset component.

- [ ] **Step 3: Implement scroll reset keyed by slug**

Create:

```tsx
'use client';

import { useEffect } from 'react';

type ScrollToTopOnArticleChangeProps = { articleSlug: string };

export function ScrollToTopOnArticleChange({
  articleSlug,
}: ScrollToTopOnArticleChangeProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [articleSlug]);
  return null;
}
```

- [ ] **Step 4: Load and render the reusable discovery panels**

In the detail page, import `CategoryDirectory`, `PopularStories`, `ScrollToTopOnArticleChange`, and `getArticles`.

Extend the existing `Promise.all`:

```ts
const [
  article,
  categoriesResponse,
  popularResponse,
  featuredResponse,
] = await Promise.all([
  loadArticle(articleSlug),
  getCategories(),
  getArticles({ page: 1, limit: 5, sort: 'popular' }),
  getArticles({ page: 1, limit: 5, featured: true, sort: 'newest' }),
]);
```

Render the scroll reset immediately inside `.page-shell`. Wrap the article and sidebar in:

```tsx
<div className={styles.articleGrid}>
  <article className={styles.article}>
    {/* existing ArticleHeader, cover, readingColumn */}
  </article>
  <aside className={styles.sidebar} aria-label="Nội dung gợi ý">
    <PopularStories
      popularArticles={popularResponse.data}
      featuredFallback={featuredResponse.data}
    />
    <CategoryDirectory categories={categoriesResponse.data} />
  </aside>
</div>
```

Keep related stories and previous/next navigation after `articleGrid`, so sticky content stops before them.

- [ ] **Step 5: Implement desktop sticky bounds and mobile normal flow**

Add:

```css
.articleGrid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 48px;
  align-items: start;
}

.article {
  min-width: 0;
}

.sidebar {
  position: sticky;
  top: 24px;
  display: grid;
  gap: 24px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

@media (max-width: 980px) {
  .articleGrid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-height: none;
    overflow: visible;
  }
}

@media (max-width: 640px) {
  .sidebar {
    grid-template-columns: 1fr;
  }
}
```

Adjust cover and reading-column widths only as necessary to remain within the main grid column.

- [ ] **Step 6: Run focused tests, typecheck, and build**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/news-presentation-source.spec.ts apps/frontend/test/editorial-ui-source.spec.ts
npm.cmd run typecheck:web
npm.cmd run build:web
```

Expected: tests PASS, typecheck exits 0, and build succeeds.

- [ ] **Step 7: Commit Task 6**

```powershell
git add apps/frontend/components/news/ScrollToTopOnArticleChange.tsx apps/frontend/app/ban-tin/[articleSlug]/page.tsx apps/frontend/app/ban-tin/[articleSlug]/page.module.css apps/frontend/test/news-presentation-source.spec.ts
git commit -m "feat(web): keep article discovery visible while reading"
```

---

### Task 7: Vietnamese Typography and Copy Regression Guard

**Files:**
- Modify: `apps/frontend/app/globals.css`
- Modify: `apps/frontend/components/news/ArticleHeader.module.css`
- Modify: `apps/frontend/components/news/ArticleContent.module.css`
- Modify: `apps/frontend/components/news/NewsCard.module.css`
- Create: `apps/frontend/test/vietnamese-typography-source.spec.ts`

**Interfaces:**
- Preserves: Be Vietnam Pro with Vietnamese subset.
- Produces: natural word wrapping without character-level breaks.
- Ensures: immediate article scroll is not overridden by global smooth scrolling.

- [ ] **Step 1: Write the failing typography regression test**

Create:

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const paths = [
  'apps/frontend/app/globals.css',
  'apps/frontend/components/news/ArticleHeader.module.css',
  'apps/frontend/components/news/ArticleContent.module.css',
  'apps/frontend/components/news/NewsCard.module.css',
];

test('Vietnamese prose and headings never use character-level wrapping', () => {
  for (const path of paths) {
    const css = readFileSync(path, 'utf8');
    assert.doesNotMatch(css, /overflow-wrap:\s*anywhere/);
  }
});

test('article navigation uses immediate scrolling and natural word breaks', () => {
  const globals = readFileSync('apps/frontend/app/globals.css', 'utf8');
  const header = readFileSync(
    'apps/frontend/components/news/ArticleHeader.module.css',
    'utf8',
  );
  assert.match(globals, /html\s*\{\s*scroll-behavior:\s*auto/);
  assert.match(header, /word-break:\s*normal/);
  assert.match(header, /hyphens:\s*none/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/vietnamese-typography-source.spec.ts
```

Expected: FAIL on the existing `overflow-wrap: anywhere` and global smooth-scroll rules.

- [ ] **Step 3: Replace unsafe wrapping rules**

Apply these exact principles in all four CSS files:

```css
html {
  scroll-behavior: auto;
}

.title,
.content,
.content h2,
.content h3,
.body h3,
.page-intro h1,
.article-header h1 {
  overflow-wrap: break-word;
  word-break: normal;
  hyphens: none;
}
```

Use `overflow-wrap: break-word` for long breadcrumb or link text. Remove every `overflow-wrap: anywhere` from the four regression-scanned files. Keep `text-wrap: balance` on major titles.

Do not change source facts or article wording: the UTF-8 manifest strings for “Giá thuê và vận hành là hai điểm cốt lõi”, “Từ chủ trương đến sản phẩm ở được”, and “Bắc - Nam” are already correct.

- [ ] **Step 4: Run the typography and existing presentation tests**

Run:

```powershell
npx.cmd tsx --test apps/frontend/test/vietnamese-typography-source.spec.ts apps/frontend/test/editorial-ui-source.spec.ts apps/frontend/test/news-presentation-source.spec.ts
npm.cmd run typecheck:web
```

Expected: all tests PASS and TypeScript exits 0.

- [ ] **Step 5: Commit Task 7**

```powershell
git add apps/frontend/app/globals.css apps/frontend/components/news/ArticleHeader.module.css apps/frontend/components/news/ArticleContent.module.css apps/frontend/components/news/NewsCard.module.css apps/frontend/test/vietnamese-typography-source.spec.ts
git commit -m "fix(web): preserve natural Vietnamese word wrapping"
```

---

### Task 8: Documentation and Full Verification

**Files:**
- Modify: `README.md`

**Interfaces:**
- Documents: `GET /api/articles?q=...`
- Documents: `/ban-tin/tim-kiem?q=...`

- [ ] **Step 1: Update the README**

Add these examples:

```markdown
- `http://localhost:3000/ban-tin/tim-kiem?q=bat%20dong%20san` — Vietnamese-aware article search results.

```bash
curl "http://localhost:4000/api/articles?q=bat%20dong%20san&page=1&limit=6"
```

Search covers article titles, excerpts, categories, and body content. Queries can be entered with or without Vietnamese diacritics.
```

- [ ] **Step 2: Run all automated verification gates**

Run:

```powershell
npm.cmd run test:api
npm.cmd run test:web
npm.cmd run typecheck
npm.cmd run build:web
npm.cmd run build:api
git diff --check
```

Expected:

- all API and frontend tests PASS;
- both TypeScript workspaces exit 0;
- both production builds succeed;
- `git diff --check` prints no errors.

- [ ] **Step 3: Verify the live API behavior**

With PostgreSQL, Redis, and the API running, run:

```powershell
curl.exe "http://localhost:4000/api/articles?q=bat%20dong%20san&page=1&limit=6"
curl.exe "http://localhost:4000/api/articles?q=b%E1%BA%A5t%20%C4%91%E1%BB%99ng%20s%E1%BA%A3n&page=1&limit=6"
```

Expected: both responses are HTTP 200, return the same leading relevant articles, include pagination metadata and search snippets, and never include `contentHtml`.

- [ ] **Step 4: Perform the manual UI acceptance walkthrough**

At desktop, tablet, and mobile widths verify:

1. Search opens from the header with focus in the field.
2. `bat dong san` and `bất động sản` return visual cards.
3. Arrow keys move the active result; Enter opens it; Escape closes the dialog.
4. Loading, empty, and recoverable error copy is legible.
5. “Xem tất cả kết quả” preserves the query through pagination.
6. Opening a result, related article, or next/previous article starts at the top.
7. The desktop discovery sidebar remains visible and stops before related content.
8. The sidebar returns to normal flow below the article on tablet/mobile.
9. The screenshot phrases no longer split inside “cốt”, “đến”, or “Bắc”.
10. Reduced-motion mode removes overlay entrance animation.

- [ ] **Step 5: Commit documentation**

```powershell
git add README.md
git commit -m "docs: document article search workflow"
```

- [ ] **Step 6: Record final repository state**

Run:

```powershell
git status --short
git log --oneline -10
```

Expected: `git status --short` is empty and the task commits are visible in order.
