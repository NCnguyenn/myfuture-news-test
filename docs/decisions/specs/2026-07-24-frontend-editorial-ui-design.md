# Frontend Editorial UI/UX Design

**Date:** 2026-07-24

**Status:** Approved for implementation planning

**Reference:** `mockups/` from the current MyFuture website

## 1. Objective

Redesign the MyFuture News frontend as a responsive editorial experience for the assignment scope:

- One aggregate `Toàn cảnh` tab.
- Six persisted news categories.
- Category listing pages.
- Article detail pages.

The design may reuse MyFuture's brand cues and content hierarchy, but it must not reproduce the existing website pixel-for-pixel. It must prioritize readability, real article imagery, clear information hierarchy, and easy operation on laptops and phones.

## 2. Approved Direction

The selected direction is **Editorial phân cấp**:

- MyFuture red remains the primary brand color.
- Neutral backgrounds and restrained borders create a modern editorial feel.
- One lead story establishes hierarchy.
- Four secondary featured stories support the lead.
- Latest and popular content remain easy to scan.
- All UI uses real API data; no fake articles or engagement counts are introduced.

## 3. Scope

### Included

- `/ban-tin`
- `/ban-tin/chuyen-muc/[slug]`
- `/ban-tin/[articleSlug]`
- Shared header and footer
- Seven-tab category navigation
- Loading, empty, error, and 404 states
- Responsive layouts for laptop, tablet, and phone
- Keyboard and touch accessibility

### Excluded

- Redis job queue
- Authentication or MyFuture Pro
- Search
- Advertising
- Project listings or property cards
- Pricing tables
- CMS or admin UI
- PostgreSQL schema or data changes
- Backend API contract changes
- Carousels and interaction-heavy widgets

## 4. Information Architecture

### News overview

```text
Site header
Category navigation: Toàn cảnh + six categories
Page introduction
Lead story + four secondary featured stories
Latest story feed + popular/sidebar column
Pagination
Site footer
```

### Category page

```text
Site header
Category navigation with active category
Breadcrumb
Category name and description
Category lead story
Remaining category story feed
Pagination
Site footer
```

### Article detail

```text
Site header
Category navigation
Breadcrumb
Category, headline, excerpt, author, date, reading time
Cover image and image provenance
Article body
Evidence and source references
Related stories
Previous/next article navigation
Site footer
```

## 5. Component Architecture

### Layout components

#### `SiteHeader`

- Displays the MyFuture wordmark treatment and `Bản tin` label.
- Links the brand to `/ban-tin`.
- Remains compact and does not include unsupported account or search controls.
- Uses a white surface, subtle border, and restrained sticky behavior.

#### `CategoryNav`

- Renders `Toàn cảnh` followed by the six API categories.
- Uses semantic links, not JavaScript-only tab state.
- Marks the current route with an active red treatment and `aria-current`.
- Scrolls horizontally on small screens without wrapping into multiple rows.
- Provides at least a 44px touch target.

#### `SiteFooter`

- Contains a compact MyFuture identity, the six category links, and a short source/copyright note.
- Avoids unrelated marketing sections.

### News components

#### `LeadStory`

- Large image, category label, headline, excerpt, author, and publication time.
- Uses the strongest typography and largest image on the page.
- Supports one consistent responsive transformation from two-column to stacked.

#### `StoryCard`

A single component supports explicit presentation variants:

- `featured`: image-forward secondary feature.
- `compact`: short sidebar or popular-story row.
- `list`: feed item with image and excerpt.
- `related`: compact article-detail recommendation.

The variants share link behavior, category metadata, image fallback, title handling, and accessible labeling.

#### `LatestFeed`

- Owns section heading and a vertical list of `StoryCard` items using the `list` variant.
- Does not duplicate article formatting logic.

#### `PopularStories`

- Uses the API `sort=popular` result.
- Displays real view counts only when present and meaningful.
- If popular data cannot be represented honestly, the module becomes `Tin nổi bật` and uses featured API data.

#### `CategoryDirectory`

- Lists the six persisted categories and article counts returned by the API.
- Provides quick navigation without duplicating the main category bar visually.

#### `Pagination`

- Uses real links and preserves the `?page=` URL.
- Renders previous, next, and a compact page range.
- Announces the current page with `aria-current`.
- Keeps every control at least 44px high on touch devices.

### Article components

#### `ArticleHeader`

- Contains breadcrumb, category, headline, excerpt, author, publication date, and reading time.
- Uses a readable maximum width while allowing the headline to remain visually prominent.

#### `ArticleBody`

- Keeps body content between approximately 720px and 780px.
- Defines consistent styles for paragraphs, headings, lists, links, and blockquotes.
- Handles long links and Vietnamese text without horizontal overflow.

#### `SourceEvidence`

- Presents evidence claims, source links, image credit, and verification notes as a distinct supporting section.
- Remains visually secondary to the article body.

#### `RelatedStories`

- Renders real related articles returned by the detail API.
- Uses the `related` StoryCard variant.

## 6. Visual System

### Color

The implementation replaces the current teal identity with a restrained MyFuture red system:

- Primary brand: MyFuture red.
- Brand hover/active: darker red.
- Main text: near-black neutral.
- Secondary text: medium gray.
- Page background: very light warm/neutral gray.
- Surfaces: white.
- Borders: light neutral gray.
- Optional accent: muted gold used sparingly.

Red is reserved for branding, active navigation, links, and meaningful emphasis. Large red background areas are avoided.

### Typography

- Use a modern sans-serif stack with strong Vietnamese rendering.
- Prefer a locally available or framework-supported font to avoid runtime layout instability.
- Headline sizes use `clamp()` and scale smoothly.
- Body copy uses approximately 16–18px with generous line height.
- Metadata remains readable and never drops below a practical mobile size.
- Uppercase is restricted to short category or eyebrow labels.

### Spacing and surfaces

- Use a consistent 4px/8px spacing scale.
- Main content width is approximately 1200px.
- Image corners use a restrained 10–14px radius.
- Cards rely primarily on whitespace and borders.
- Heavy shadows and excessive floating panels are not used.

### Images

- Existing researched source images remain the preferred assets.
- All images provide meaningful `alt` text.
- Cards use stable aspect ratios and `object-fit: cover`.
- The four existing fallback SVGs remain available.
- Image failures switch to the fallback system without breaking layout.

## 7. Responsive Behavior

### Large laptop and desktop: 1200px and above

- Use a 12-column layout inside a maximum-width container.
- Lead story occupies the dominant portion of the hero.
- Four secondary stories form a balanced supporting grid.
- Latest feed and sidebar use an approximately 8/4 column split.

### Small laptop and tablet: 768px–1199px

- Preserve a two-column hero where images and headlines remain readable.
- Move the sidebar below the latest feed when its width becomes cramped.
- Reduce spacing without reducing touch targets.

### Phone: below 768px

- Use a single content column.
- Category navigation scrolls horizontally.
- Lead and featured cards stack.
- Horizontal list cards become vertical when the image would otherwise be too narrow.
- Images fill the content width without causing horizontal scroll.
- Pagination uses a compact range and large previous/next targets.

### Small phone: below 480px

- Reduce decorative spacing and headline size while preserving hierarchy.
- Keep body type and controls readable.
- Avoid placing multiple small actions on one row.

No essential content or control depends on hover. Motion respects `prefers-reduced-motion`.

## 8. Data Flow

### Overview page

Fetch in parallel:

- Categories from `/categories`.
- Featured articles with `featured=true`.
- Latest articles with `sort=newest`.
- Popular articles with `sort=popular`.

The frontend prepends the aggregate `Toàn cảnh` navigation item to the six persisted categories.

### Category page

Fetch:

- Categories for navigation.
- Articles using `category`, `page`, and `sort`.

The first available category article may receive lead-story presentation; the remaining items use the feed presentation.

### Article detail

Fetch the article by slug. Use the API response for:

- Article body.
- Image provenance.
- Evidence.
- Related stories.
- Previous and next articles.

Server Components remain the default. Client Components are introduced only where browser interaction is required.

## 9. States and Error Handling

### Loading

- Skeletons mirror the final card geometry.
- Stable image boxes prevent cumulative layout shift.
- Animation is subtle and disabled for reduced-motion users.

### Empty

- Explain that the category currently has no published stories.
- Provide a link back to `Toàn cảnh`.
- Do not render an empty sidebar or broken pagination.

### API error

- Use a consistent MyFuture-branded error panel.
- Provide a clear retry control.
- Do not expose internal server or stack-trace details.

### Not found

- Retain custom 404 presentation.
- Offer direct navigation to the News overview and categories.
- Preserve `noindex` behavior already implemented for missing dynamic content.

### Image failure

- Swap to the existing fallback image.
- Preserve the original card dimensions.

## 10. Accessibility

- Semantic landmark structure: header, nav, main, sections, article, aside, footer.
- One clear page-level `h1`.
- Logical heading order within sections.
- Visible keyboard focus.
- `aria-current` for active tabs and pagination.
- Touch targets at least 44px.
- Sufficient contrast for red, text, borders, and focus states.
- No icon-only action without an accessible label.
- No hover-only information.
- Long titles and URLs wrap safely.

## 11. Verification Strategy

### Automated

- Preserve all current 18 frontend tests.
- Add coverage for:
  - Seven navigation items: one aggregate plus six categories.
  - StoryCard variants and required metadata.
  - Popular API query usage.
  - No runtime import of preview-only researched data in production routes.
- Run frontend TypeScript checks.
- Run the Next.js production build.

### Responsive visual review

Review the following viewport widths:

- 1440px
- 1024px
- 768px
- 390px

Capture:

- News overview.
- One category page.
- One article detail page.

### Interaction review

- Keyboard navigation through header, tabs, cards, pagination, and footer.
- Horizontal tab scrolling on phone.
- Previous/next pagination.
- Long Vietnamese titles.
- Fallback image.
- Empty, API error, loading, and 404 states.

## 12. Acceptance Criteria

The frontend is ready for user review when:

1. The overview presents one lead story, four supporting stories, latest stories, and real popular/featured data.
2. Navigation contains exactly seven items: `Toàn cảnh` plus six API categories.
3. Category and article routes retain their existing URLs and API data.
4. Laptop and phone layouts remain readable and operable.
5. No unsupported MyFuture Pro, search, advertising, project, or CMS UI appears.
6. MyFuture red replaces teal as the primary identity.
7. All current and new frontend tests pass.
8. Frontend typecheck and production build pass.
9. Screenshots at the approved viewports are available for review.
10. Redis queue, backend contracts, and database content remain unchanged.
