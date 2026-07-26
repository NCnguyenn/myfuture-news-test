# Article Reading, Sticky Discovery, and Search Design

## Status

Approved in conversation on 2026-07-25.

## Objective

Improve the MyFuture News reading experience so that:

- every article detail navigation starts at the top of the new article;
- the existing “Đề xuất” and “Khám phá” content remains available while a desktop reader scrolls;
- search is visually prominent, responsive, and useful with Vietnamese queries both with and without diacritics;
- Vietnamese text renders naturally and consistently throughout the News module.

The implementation extends the existing article API instead of introducing a separate search service.

## Current Context

The project uses Next.js App Router for the frontend and NestJS, Prisma, PostgreSQL, and Redis for the backend. Article lists are already exposed through `GET /api/articles`, and the frontend keeps `API_BASE_URL` server-only.

The article detail route currently renders the article as a centered reading column. The overview page already has reusable recommendation and category-directory components. The global typography uses Be Vietnam Pro, but some headings can still break inside Vietnamese words because of aggressive wrapping rules. All user-facing strings and seeded content need an encoding and consistency audit.

The pre-feature repository state is clean at commit `6914560`.

## Chosen Approach

Extend `GET /api/articles` with a validated `q` parameter. Search and relevance ranking remain in the existing article service and reuse its response and caching patterns.

This is preferred over:

- client-only search, which would require downloading too much content and would not scale cleanly; and
- a dedicated indexed search subsystem, which would add unnecessary schema and infrastructure complexity for the current data volume.

## Architecture and Components

### Backend search

`ArticlesQueryDto` gains an optional `q` value that is:

- trimmed;
- limited to 100 characters;
- treated as absent when empty;
- required to contain at least two meaningful characters when supplied by the search UI.

The article service normalizes both the query and searchable article text by:

1. converting to lowercase;
2. applying Unicode NFD normalization;
3. removing combining diacritic marks;
4. mapping `đ` to `d`;
5. replacing punctuation with spaces; and
6. collapsing repeated whitespace.

The searchable fields are title, excerpt, category name, and plain text derived from `contentHtml`. Stored HTML is never returned as a search snippet.

For the current small dataset, the service retrieves published candidate fields, calculates relevance in application code, filters non-matches, sorts by relevance and publication date, and then paginates. This keeps Vietnamese no-diacritic matching deterministic without adding a database extension. If the dataset grows materially, normalized indexed columns or PostgreSQL full-text search can replace the internal matching implementation without changing the API contract.

Relevance is deterministic and favors:

1. exact title phrase;
2. all query tokens in the title;
3. individual title-token matches;
4. excerpt matches;
5. category matches; and
6. body matches.

When `q` is present, relevance is the primary ordering and `publishedAt` is the tie-breaker. Existing non-search sorting behavior remains unchanged.

Search responses keep the existing `ArticleListResponse` structure. Search items may additionally include:

- `searchSnippet`: a short, plain-text excerpt around the best match;
- `matchedFields`: the fields responsible for the match.

These fields are optional so existing article-list consumers remain compatible.

The normalized query is included in the Redis list cache key. Search caching must never collide with ordinary lists or a different search term.

### Next.js search bridge

Because `API_BASE_URL` remains server-only, a same-origin Next.js Route Handler proxies quick-search requests from the browser to the existing backend client:

`GET /api/news-search?q=<term>&page=1&limit=6`

The handler validates the public parameters, calls the shared server API client, and returns only the fields required by the search overlay. It does not expose backend configuration to the browser.

The full results page at `/ban-tin/tim-kiem?q=<term>&page=<n>` is server-rendered through the existing API client and supports pagination and shareable URLs.

### Header search

The header retains its server-rendered structure and includes a focused client component for search interaction.

The search experience contains:

- a prominent “Tìm kiếm” launcher with a magnifying-glass icon;
- a large overlay with a blurred backdrop and a short entrance transition;
- automatic focus in the input;
- a 250–300 ms debounce;
- request cancellation when the query changes;
- up to six quick-result cards;
- image, category, title, relevant snippet, and highlighted query terms;
- a “Xem tất cả kết quả” action;
- keyboard navigation with Up, Down, Enter, and Escape;
- focus restoration to the launcher after closing.

Clicking outside the panel or pressing Escape closes the overlay. Selecting a result closes it and navigates to the article.

The UI includes distinct Vietnamese states for:

- initial guidance;
- query shorter than two characters;
- loading;
- results;
- no results; and
- recoverable API failure.

Animations use opacity and transform only, and are disabled or reduced under `prefers-reduced-motion`.

## Article Detail Layout

Desktop article detail becomes a two-column grid:

- the main column contains the article header, cover image, body, and source evidence;
- the right column contains the existing recommendation and category-directory panels.

The sidebar:

- uses `position: sticky`;
- has a top offset that leaves comfortable viewport spacing;
- stops at the end of the article grid rather than overlapping related content;
- uses a viewport-relative maximum height;
- enables discreet internal scrolling only when its combined panels exceed the available viewport height.

The existing `PopularStories` and `CategoryDirectory` components are reused. The detail page loads the small additional article list needed by the recommendation panel alongside its existing article and category data.

At tablet and mobile breakpoints, the layout becomes one column. Sticky behavior is disabled, and the recommendation/category content appears after the article body and before subsequent related/navigation sections.

## Scroll-to-Top Behavior

A small client component receives the current article slug and runs whenever that slug changes. It immediately scrolls the document to `(0, 0)`.

The behavior applies to:

- opening a detail from a list or search result;
- following related articles; and
- using previous/next article navigation.

The global smooth-scroll rule must not delay this navigation. Smooth movement, when desired elsewhere, should be requested explicitly rather than applied to all programmatic scrolling.

## Vietnamese Text and Typography

The News module is audited for:

- malformed UTF-8 or mojibake in source strings and metadata;
- inconsistent labels, punctuation, capitalization, and fallback text;
- seeded article text that contains accidental character corruption;
- headings broken inside Vietnamese words;
- unsafe use of `overflow-wrap: anywhere`;
- font-weight or fallback combinations that produce missing glyphs.

Source files remain UTF-8. Existing correctly encoded text is not mass-re-encoded. Editorial meaning, names, figures, dates, and factual claims remain unchanged.

Typography changes favor:

- `overflow-wrap: break-word` only where needed;
- normal word breaking and disabled automatic hyphenation for Vietnamese;
- balanced wrapping for large headings when supported;
- responsive font sizes that prevent forced character-level breaks.

The goal is consistent professional presentation, not editorial rewriting.

## Error Handling and Safety

- Invalid or oversized search parameters return the existing structured HTTP 400 format.
- An unavailable backend produces a recoverable overlay message and retry action.
- Stale quick-search requests are aborted and cannot replace newer results.
- Search snippets are plain text; no stored HTML is inserted into the client result UI.
- Highlighting is implemented with React text nodes, not unsanitized HTML.
- Unknown articles continue to use the existing 404 behavior.
- Empty search results are successful responses with an empty data array and normal pagination metadata.

## Accessibility

- The launcher has a descriptive accessible name.
- The overlay uses dialog semantics and an accessible title.
- Focus is trapped within the open dialog and restored on close.
- Search results expose listbox/option or an equivalent accessible navigation pattern.
- Active keyboard selection is visually distinct.
- All controls retain visible focus styles.
- Images use the existing article alt text.
- Motion respects the operating-system preference.

## Testing and Verification

### Backend

- DTO trimming, empty handling, minimum meaningful input, and maximum length.
- Vietnamese normalization, including `đ` and queries without diacritics.
- Matches across title, excerpt, category, and body.
- Deterministic relevance ordering and publication-date tie-breaking.
- Search pagination metadata.
- Search cache-key isolation.
- Plain-text snippet generation.
- Existing non-search list and detail behavior remains unchanged.

### Frontend

- API client serializes `q`.
- Route Handler validates and proxies quick search.
- Search overlay covers initial, loading, result, empty, and error states.
- Debouncing and stale-request cancellation.
- Keyboard selection, Enter navigation, Escape closing, and focus restoration.
- Result highlighting does not use unsafe HTML.
- Detail layout includes the reusable sidebar components.
- Article slug changes trigger immediate scroll-to-top.
- Desktop sticky behavior and mobile static placement are represented in source/style tests.
- Vietnamese labels and known broken text regressions are covered.

### Completion gates

- focused backend and frontend tests;
- workspace typecheck;
- frontend production build;
- backend production build;
- visual inspection at desktop, tablet, and mobile widths;
- keyboard-only search walkthrough;
- manual checks using accented and unaccented Vietnamese queries.

## Non-Goals

- External hosted search services.
- Search history, saved searches, or personalization.
- Voice search.
- Typo-tolerant fuzzy matching beyond normalized Vietnamese text.
- Editing or changing the factual meaning of article content.
- Making the mobile sidebar sticky.

## Acceptance Criteria

The work is complete when:

1. opening any article detail starts at the top of the new article;
2. desktop readers retain access to both discovery panels while scrolling the article;
3. mobile readers see the same panels in normal document flow;
4. search produces relevant visual results for Vietnamese queries with or without diacritics;
5. all search states and keyboard interactions are usable and polished;
6. visible Vietnamese character corruption and inside-word heading breaks are removed across the News module; and
7. existing API behavior, article reading, pagination, responsive layouts, tests, typecheck, and builds remain healthy.
