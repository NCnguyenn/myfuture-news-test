# MyFuture News Editorial Refresh and Content Expansion Design

**Date:** 2026-07-25
**Branch:** `codex/editorial-refresh-content`
**Base:** `origin/main` at `c62803e32a68614a616a58cdae7099ec7e88ee09`
**Status:** Approved visual direction; written specification awaiting user review

## Goal

Improve the recruiter-facing MyFuture News demo without destabilizing the
production version already available on `main`.

The refresh will:

- make the overview, category, article, and mobile experiences feel like one
  polished editorial product;
- retain the recognizable myFUTURE burgundy brand character without copying the
  employer portal pixel for pixel;
- add 12 newly researched Vietnamese real-estate news articles with an
  intentionally uneven category distribution;
- preserve the existing public API, PostgreSQL, Redis cache, pagination, and
  production deployment contracts;
- remain fully usable without login, setup, or non-functional controls.

The work will be developed and reviewed on
`codex/editorial-refresh-content`. It will not reach `main` or production until
the complete quality gates, preview smoke tests, visual review, and user
approval pass.

## Approved Visual Direction

The approved design is a focused public news product rather than a copy of the
full myFUTURE property portal.

### Brand and visual system

- Primary burgundy: `#9F1D2D`
- Editorial red: `#C62832`
- Ink navy: `#172033`
- Warm page background: `#F7F6F3`
- White surface: `#FFFFFF`
- Muted slate: `#667085`
- Pale rose accent: `#FBEAEC`
- Restrained gold accent: `#B88A44`
- Borders: cool neutral gray with minimal, soft shadow only when hierarchy
  requires it
- Editorial headline stack: Georgia/Cambria-style system serif
- Interface and body stack: Segoe UI/Helvetica/Arial-style system sans serif

System font stacks avoid a runtime font dependency and avoid CI or deployment
failures caused by downloading remote fonts.

### Design principles

1. Strong editorial hierarchy: one clear lead story, supporting stories, then
   the chronological feed.
2. Generous whitespace and consistent alignment instead of dense dashboard
   widgets.
3. Images carry meaning and use stable aspect ratios to avoid layout shift.
4. Burgundy is used for active states and emphasis, not as a large background
   treatment.
5. Every visible control must work. The implementation will not include fake
   search, login, newsletter submission, or Pro-lock controls.
6. Desktop and mobile use the same design language but have deliberately
   different composition.

The locally generated mockups approved in the design conversation cover:

- desktop news overview;
- mobile news overview;
- desktop category page;
- desktop article detail.

They are visual references, not pixel-perfect implementation contracts. In
particular, unsupported controls shown for composition will be omitted or
replaced with working internal navigation.

## Page Design

### Shared header and navigation

The header remains focused on the news demo:

- myFUTURE wordmark and `Bản tin` channel label;
- a compact brand statement;
- the seven working navigation entries: one `Toàn cảnh` overview plus the six
  API-backed categories;
- a clear active state using burgundy text and an underline;
- horizontally scrollable category navigation on narrow screens.

No authentication, global portal sidebar, or non-functional search field will
be introduced.

### Overview page

The overview uses four editorial layers:

1. A compact masthead with `Bản tin thị trường` and a short positioning
   statement.
2. A hero grid containing one large lead article and two supporting featured
   articles.
3. A two-column content area with `Tin mới nhất` on the left and a compact
   numbered `Đọc nhiều` list on the right.
4. A working internal callout leading to the category directory, followed by
   the existing professional footer.

The feed preserves pagination and API-driven content. Article cards expose only
real metadata already supported by the API, such as publication date, reading
time, author, and view count when available.

### Category page

Each category page contains:

- breadcrumb and active category navigation;
- a category masthead with its real API description and article count;
- a first-page lead article;
- a varied horizontal article feed rather than a numbered data table;
- compact `Đọc nhiều` and `Chuyên mục` side panels on desktop;
- existing semantic pagination;
- a single-column flow on mobile.

Page 2 and later do not repeat the hero treatment, ensuring the pagination flow
remains clear.

### Article detail page

The article detail prioritizes reading:

- breadcrumb, category label, serif headline, excerpt, author, date, views, and
  reading time;
- wide cover image with accessible alt text and provenance caption;
- a 720–780px reading column with comfortable line height;
- clear section headings, lists, and quotations produced from sanitized HTML;
- a distinct `Nguồn tham khảo` panel rendering existing verification evidence;
- restrained `Đọc nhiều` and `Chuyên mục` sidebar on wide screens;
- working previous/next and related-story navigation;
- stacked, single-column reading layout on mobile.

The design retains the current content sanitizer and never renders untrusted raw
HTML.

## Component Boundaries

Existing components will be refined rather than replaced with one monolithic
page:

- `Header` and `Footer`: shared brand frame and navigation.
- `NewsTabs`: seven-entry working category navigation.
- `FeaturedNews`: overview hero composition.
- `NewsCard`: explicit lead, supporting, feed, and compact variants.
- `NewsList`: semantic feed composition.
- `PopularStories`: numbered popular list.
- `CategoryDirectory`: working links and article counts.
- `Pagination`: accessible navigation with current-page semantics.
- `ArticleHeader`, `ArticleContent`, `SourceEvidence`, and `RelatedNews`: reading
  experience and article navigation.
- `NewsImage`: the single Next Image boundary for responsive sizes, alt text,
  and optimization behavior.

CSS Modules remain colocated with the components. Global CSS contains only
tokens, reset rules, shared page primitives, and cross-page typography.

## New Content

### Distribution

The 12 new articles will be distributed as follows:

| Category | Existing | New | Final |
| --- | ---: | ---: | ---: |
| Thị trường giá cả | 5 | 3 | 8 |
| Quy hoạch hạ tầng | 5 | 3 | 8 |
| Pháp lý dự án | 5 | 2 | 7 |
| Lãi suất tài chính | 5 | 2 | 7 |
| Đầu tư dòng tiền | 5 | 1 | 6 |
| Cho thuê | 5 | 1 | 6 |
| **Total** | **30** | **12** | **42** |

The uneven distribution is intentional and makes the publication feel more
like a real news product.

### Editorial and provenance requirements

Each new article must:

- cover a current, relevant Vietnamese real-estate topic;
- have a unique slug and unique canonical source URL;
- use a source that can be opened and verified during implementation;
- clearly separate verified source claims from editorial summary;
- contain a complete excerpt, sanitized body, author metadata, tags, publication
  date, reading time, evidence entries, and image provenance;
- use a locally stored optimized image with accurate alt text and source credit;
- avoid invented quotes, statistics, dates, people, or project facts;
- avoid reusing source URLs from the existing 30-article dataset.

Research will prefer primary government, regulator, bank, infrastructure
operator, and official corporate sources where they directly support a claim.
Reputable Vietnamese news sources may be used for reported context. Source
licensing and image provenance must remain visible in the canonical dataset.

### Featured content

The dataset continues to expose exactly five featured articles. Newer articles
may replace older items in the featured set, but the invariant remains five so
the hero API request and fallback behavior remain deterministic.

## Data and Backend Flow

No database migration or public API shape change is required.

The canonical content flow remains:

1. Researched content is recorded under `data/news`.
2. The seed loader converts Markdown to sanitized HTML and maps image
   provenance.
3. Prisma upserts categories and articles by stable slug.
4. Production migration and deterministic seed run against PostgreSQL.
5. API list and detail endpoints read published data through Prisma.
6. Redis caches category, list, detail, and related-article reads using the
   existing normalized keys and fail-soft behavior.
7. Next.js server components fetch the public API using the current timeout and
   revalidation policy.

Seed verification will change from the old uniform `5 per category / 30 total`
rule to an explicit expected count map and `42 total`. This preserves strict
verification without incorrectly requiring equal category sizes.

The seed remains idempotent: running it repeatedly must yield the same six
categories, 42 published articles, five featured articles, and no duplicate
source URLs or slugs.

## Responsive and Accessibility Requirements

- No horizontal overflow at 320px, 375px, 390px, 768px, 1024px, and 1440px.
- Interactive targets are at least 44px high where practical on touch layouts.
- Keyboard focus remains visible and uses the brand color.
- Navigation, headings, lists, breadcrumbs, articles, and asides retain semantic
  markup.
- Images have meaningful alt text, stable dimensions, and responsive `sizes`.
- Color contrast meets WCAG AA for body copy and controls.
- Reduced-motion behavior remains supported.
- The article page remains readable with CSS disabled or images unavailable.

## Error and Empty States

The current production-safe behavior remains:

- API requests time out after eight seconds.
- Failed requests are not cached as successful responses.
- Category and article 404 responses render intentional not-found states.
- Unexpected errors render the retry state and remain observable.
- Empty lists use a useful category-aware message and overview link.
- Redis failure degrades cache performance but does not make PostgreSQL-backed
  content unavailable.
- Broken or missing article images use the existing safe presentation boundary
  without hiding the headline.

The redesign must apply the same visual system to loading, empty, error, and
not-found states.

## Verification Strategy

Implementation follows test-driven development. Source-level tests will be
updated or added before changing the corresponding implementation.

Required local Node 22 gates:

- `npm ci`
- Prisma generate and validate
- lint
- frontend tests
- backend tests
- frontend and backend typecheck
- frontend and backend production builds
- production dependency audit
- `git diff --check`

Content verification must prove:

- exactly six stored categories and seven UI navigation entries;
- exactly 42 published articles;
- final counts of `8, 8, 7, 7, 6, 6` for the approved category mapping;
- exactly five featured articles;
- unique slugs and unique non-empty source URLs;
- complete source, author, evidence, and image-provenance metadata;
- deterministic seed verification passes twice.

Preview verification must cover:

- overview, every category, page 2 pagination, and multiple article details;
- 320/375/390 mobile, tablet, and 1440 desktop layouts;
- Next Image optimization and static assets;
- keyboard navigation, focus visibility, and no horizontal overflow;
- no unexpected browser console errors or 404/500 responses;
- backend health with PostgreSQL up and Redis up;
- three consecutive smoke-test passes.

An independent implementer/reviewer sequence will be used for each bounded task.
A final fresh reviewer will inspect the full branch diff before merge.

## Deployment and Merge Safety

1. Push only `codex/editorial-refresh-content` during implementation.
2. Use Vercel preview deployments for UI and content validation.
3. Do not point the stable production alias at the feature branch.
4. Do not seed production with the 42-article dataset until the branch, preview,
   and verification results are approved.
5. Before merge, confirm the seed rollback path is the previous `main` dataset
   and retain the prior production deployment.
6. Merge to `main` only after CI, code review, user visual approval, preview
   smoke tests, and production-seed readiness all pass.
7. After merge, deploy the latest `main`, seed and verify production twice, then
   run the full smoke test three times.

## Non-Goals

- Rebuilding the full myFUTURE property portal.
- Adding authentication, account management, paid Pro features, project sales,
  appointment booking, or CRM tools.
- Adding a fake search box or newsletter submission.
- Changing the NestJS API contract, Prisma schema, hosting providers, or cache
  architecture without a separately approved need.
- Copying employer screenshots or proprietary portal layouts pixel for pixel.
- Performing a major dependency upgrade as part of the visual refresh.
