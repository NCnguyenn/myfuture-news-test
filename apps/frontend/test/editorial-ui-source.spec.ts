import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

test('editorial UI: uses the complete approved token and font system', () => {
  const css = read('apps/frontend/app/globals.css');
  const tokens = {
    '--color-brand': '#9f1d2d',
    '--color-red': '#c62832',
    '--color-ink': '#172033',
    '--color-page': '#f7f6f3',
    '--color-surface': '#ffffff',
    '--color-muted': '#667085',
    '--color-rose': '#fbeaec',
    '--color-gold': '#b88a44',
  };

  for (const [name, value] of Object.entries(tokens)) {
    assert.match(css, new RegExp(`${name}:\\s*${value}`, 'i'));
  }

  assert.match(
    css,
    /--font-editorial:.*var\(--font-vietnamese\).*Be Vietnam Pro.*sans-serif/i,
  );
  assert.match(
    css,
    /--font-interface:.*var\(--font-vietnamese\).*Be Vietnam Pro.*sans-serif/i,
  );
  assert.match(css, /--content-width:\s*1200px/);
  assert.match(css, /--reading-width:\s*760px/);
  assert.doesNotMatch(css, /@import|fonts\.googleapis/i);
});

test('editorial UI: renders exactly one overview plus six API category tabs', () => {
  const source = read('apps/frontend/components/news/NewsTabs.tsx');
  assert.equal((source.match(/href="\/ban-tin"/g) ?? []).length, 1);
  assert.match(source, />\s*Toàn cảnh\s*</);
  assert.match(source, /categories\.slice\(0,\s*6\)\.map/);
  assert.match(source, /aria-current/);
});

test('editorial UI: shared frame stays semantic and contains no fake controls', () => {
  const header = read('apps/frontend/components/layout/Header.tsx');
  const footer = read('apps/frontend/components/layout/Footer.tsx');
  const tabs = read('apps/frontend/components/news/NewsTabs.tsx');
  const sharedSource = `${header}\n${footer}\n${tabs}`;

  assert.match(header, /<header\b/);
  assert.match(header, /<nav\b/);
  assert.match(header, /Bản tin/);
  assert.match(header, /href="\/ban-tin"/);
  assert.match(footer, /<footer\b/);
  assert.match(footer, /categories\.slice\(0,\s*6\)/);
  assert.doesNotMatch(
    sharedSource,
    /Đăng nhập|newsletter|nhận bản tin|MyFuture Pro/i,
  );
});

test('editorial UI: renders the approved prominent search launcher', () => {
  const launcher = read(
    'apps/frontend/components/search/SearchLauncher.tsx',
  );
  const overlay = read(
    'apps/frontend/components/search/SearchOverlay.tsx',
  );
  const overlayStyles = read(
    'apps/frontend/components/search/SearchOverlay.module.css',
  );

  assert.match(launcher, /Tìm kiếm/);
  assert.match(launcher, /event\.metaKey \|\| event\.ctrlKey/);
  assert.match(launcher, /event\.key\.toLowerCase\(\) === 'k'/);
  assert.match(launcher, /createPortal/);
  assert.match(launcher, /document\.body/);
  assert.match(overlay, /requestIdRef/);
  assert.match(overlay, /handleQueryChange/);
  assert.match(overlay, /aria-label="Từ khóa tìm kiếm"/);
  assert.match(overlayStyles, /\.searchForm:focus-within/);
});

test('editorial UI: exposes exactly the five approved story-card variants', () => {
  const source = read('apps/frontend/components/news/NewsCard.tsx');
  const publicVariant = source.match(
    /export type NewsCardVariant\s*=\s*([\s\S]*?);/,
  );
  assert.ok(publicVariant);
  assert.deepEqual(
    Array.from(publicVariant[1].matchAll(/'([^']+)'/g), (match) => match[1]),
    ['lead', 'supporting', 'feed', 'compact', 'related'],
  );
  assert.doesNotMatch(publicVariant[1], /'featured'|'list'/);
  assert.match(source, /variant\s*=\s*'feed'/);
  assert.match(source, /IMAGE_SIZES/);
  assert.match(source, /href=\{`\/ban-tin\/\$\{article\.slug\}`\}/);
  assert.match(
    source,
    /href=\{`\/ban-tin\/chuyen-muc\/\$\{article\.category\.slug\}`\}/,
  );
  assert.doesNotMatch(
    source,
    /href=\{`\/ban-tin\/\$\{article\.category\.slug\}`\}/,
  );
  assert.doesNotMatch(
    source,
    /href=\{`\/ban-tin\/chuyen-muc\/\$\{article\.slug\}`\}/,
  );
});

test('editorial UI: exposes focus and reduced-motion accessibility primitives', () => {
  const css = read('apps/frontend/app/globals.css');

  assert.match(
    css,
    /:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--color-brand\);[^}]*outline-offset:\s*3px;/,
  );
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /transition-duration:\s*0\.01ms\s*!important/);
  assert.match(css, /animation-duration:\s*0\.01ms\s*!important/);
});

test('editorial UI: overview requests featured, newest, and popular article groups', () => {
  const source = read('apps/frontend/app/ban-tin/page.tsx');
  assert.match(source, /featured:\s*true/);
  assert.match(source, /sort:\s*'newest'/);
  assert.match(source, /sort:\s*'popular'/);
  assert.match(source, /Promise\.all/);
  assert.doesNotMatch(source, /<main\b/);
});

test('editorial UI: overview composes a one plus two hero and ranked sidebar', () => {
  const pageSource = read('apps/frontend/app/ban-tin/page.tsx');
  const featuredSource = read(
    'apps/frontend/components/news/FeaturedNews.tsx',
  );
  const popularSource = read(
    'apps/frontend/components/news/PopularStories.tsx',
  );

  assert.match(pageSource, /searchParams/);
  assert.match(pageSource, /Pagination/);
  assert.match(pageSource, /<aside\b/);
  assert.match(pageSource, /Tin mới nhất/);
  assert.doesNotMatch(pageSource, /<main\b/);
  assert.match(featuredSource, /articles\.slice\(1,\s*3\)/);
  assert.match(featuredSource, /variant="lead"/);
  assert.match(featuredSource, /variant="supporting"/);
  assert.match(popularSource, /<ol\b/);
  assert.match(popularSource, /index \+ 1/);
  assert.match(popularSource, /Đọc nhiều/);
});

test('editorial UI: overview callout targets the working category directory', () => {
  const pageSource = read('apps/frontend/app/ban-tin/page.tsx');
  const directorySource = read(
    'apps/frontend/components/news/CategoryDirectory.tsx',
  );

  assert.match(pageSource, /href="#category-directory"/);
  assert.match(
    pageSource,
    /categoriesResponse\.data\.length\s*>\s*0[\s\S]*href="#category-directory"/,
  );
  assert.match(directorySource, /id="category-directory"/);
  assert.match(directorySource, /category\.articleCount/);
  assert.match(
    directorySource,
    /href=\{`\/ban-tin\/chuyen-muc\/\$\{category\.slug\}`\}/,
  );
});

test('editorial UI: popular panel renders the honest selected title', () => {
  const source = read(
    'apps/frontend/components/news/PopularStories.tsx',
  );

  assert.match(source, /title:\s*'Đọc nhiều'\s*\|\s*'Đáng chú ý'/);
  assert.match(source, /<h2[^>]*>\{title\}<\/h2>/);
});

test('editorial UI: category page separates the first-page lead from the feed', () => {
  const source = read(
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx',
  );
  assert.match(source, /page === 1/);
  assert.match(source, /categoryLead/);
});

test('editorial UI: category page composes real metadata and filtered side panels', () => {
  const source = read(
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx',
  );

  assert.match(source, /category\.description/);
  assert.match(source, /articlesResponse\.meta\.totalItems/);
  assert.match(
    source,
    /getArticles\(\{[\s\S]*category:\s*category\.slug[\s\S]*sort:\s*'popular'/,
  );
  assert.match(source, /<aside\b/);
  assert.match(source, /<PopularStories/);
  assert.match(source, /<CategoryDirectory/);
  assert.match(
    source,
    /const emptyTitle\s*=\s*categoryLead\s*\?\s*`Chưa có thêm bài viết[^`]*\$\{category\.name\}/,
  );
  assert.match(source, /:\s*`Chưa có bài viết[^`]*\$\{category\.name\}/);
  assert.match(source, /emptyTitle=\{emptyTitle\}/);
  assert.match(source, /emptyDescription=/);
  assert.doesNotMatch(source, /<main\b/);
});

test('editorial UI: category layout collapses to one column below desktop', () => {
  const css = read(
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.module.css',
  );

  assert.match(css, /grid-template-columns:\s*minmax\(0,\s*2fr\)\s+minmax\(/);
  assert.match(
    css,
    /@media\s*\(max-width:\s*1023px\)[\s\S]*grid-template-columns:\s*1fr/,
  );
});

test('editorial UI: category description styling does not override the eyebrow', () => {
  const source = read(
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx',
  );
  const css = read(
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.module.css',
  );

  assert.match(source, /<p className=\{styles\.description\}>/);
  assert.match(css, /\.description\s*\{/);
  assert.doesNotMatch(css, /\.intro\s*>\s*p:not\(\.articleCount\)/);
});

test('editorial UI: news list forwards category-aware empty copy', () => {
  const source = read('apps/frontend/components/news/NewsList.tsx');
  const stateSource = read('apps/frontend/components/news/NewsStates.tsx');

  assert.match(source, /emptyTitle\?:\s*string/);
  assert.match(source, /emptyDescription\?:\s*string/);
  assert.match(
    source,
    /<EmptyState\s+title=\{emptyTitle\}\s+description=\{emptyDescription\}\s*\/>/,
  );
  assert.match(stateSource, /href="\/ban-tin"/);
});

test('editorial UI: pagination exposes current page semantics', () => {
  const source = read('apps/frontend/components/news/Pagination.tsx');
  assert.match(source, /aria-current/);
});

test('editorial UI: article page delegates header and evidence presentation', () => {
  const source = read(
    'apps/frontend/app/ban-tin/[articleSlug]/page.tsx',
  );
  assert.match(source, /<ArticleHeader/);
  assert.match(source, /<SourceEvidence/);
  assert.match(source, /<NewsTabs/);
});

test('editorial UI: article page composes focused reading and honest discovery panels', () => {
  const source = read(
    'apps/frontend/app/ban-tin/[articleSlug]/page.tsx',
  );
  const css = read(
    'apps/frontend/app/ban-tin/[articleSlug]/page.module.css',
  );
  const directorySource = read(
    'apps/frontend/components/news/CategoryDirectory.tsx',
  );

  assert.match(source, /<aside\b/);
  assert.match(source, /<PopularStories/);
  assert.match(source, /<CategoryDirectory\s+compact/);
  assert.match(source, /<RelatedNews/);
  assert.match(source, /sizes="\(max-width:\s*1199px\)\s*100vw,\s*820px"/);
  assert.match(source, /<nav[\s\S]*aria-label="Đường dẫn"/);
  assert.match(source, /aria-current="page"/);
  assert.match(
    source,
    /selectPopularStories\(\s*popularResponse\.data,\s*article\.relatedArticles,\s*\[article\],?\s*\)/,
  );
  assert.match(
    css,
    /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(/,
  );
  assert.match(css, /width:\s*min\(100%,\s*var\(--reading-width\)\)/);
  assert.match(
    css,
    /@media\s*\(max-width:\s*1199px\)[\s\S]*grid-template-columns:\s*1fr/,
  );
  assert.match(css, /position:\s*sticky/);
  assert.doesNotMatch(source, /<main\b/);
  assert.match(directorySource, /compact\?:\s*boolean/);
  assert.match(directorySource, /compact\s*\?\s*'Chuyên mục'/);
});

test('editorial UI: article header exposes real metadata and provenance caption', () => {
  const pageSource = read(
    'apps/frontend/app/ban-tin/[articleSlug]/page.tsx',
  );
  const headerSource = read(
    'apps/frontend/components/news/ArticleHeader.tsx',
  );

  assert.match(headerSource, /<h1[^>]*>\{article\.title\}<\/h1>/);
  assert.match(headerSource, /\{article\.excerpt\}/);
  assert.match(headerSource, /\{article\.author\.name\}/);
  assert.match(headerSource, /<time[^>]*dateTime=/);
  assert.match(headerSource, /article\.readingTime\s*&&\s*article\.readingTime\s*>\s*0/);
  assert.match(headerSource, /article\.viewCount\s*!==\s*undefined\s*&&\s*article\.viewCount\s*>\s*0/);
  assert.match(pageSource, /alt=\{article\.imageAlt\}/);
  assert.match(pageSource, /<figcaption/);
  assert.match(pageSource, /Nguồn ảnh:/);
  assert.match(pageSource, /article\.imageProvenance\.sourcePageUrl/);
});

test('editorial UI: article evidence and navigation stay explicit and canonical', () => {
  const pageSource = read(
    'apps/frontend/app/ban-tin/[articleSlug]/page.tsx',
  );
  const evidenceSource = read(
    'apps/frontend/components/news/SourceEvidence.tsx',
  );
  const contentSource = read(
    'apps/frontend/components/news/ArticleContent.tsx',
  );

  assert.match(evidenceSource, />Nguồn tham khảo<\/h2>/);
  assert.match(evidenceSource, /href=\{item\.sourceUrl\}/);
  assert.match(evidenceSource, /noopener noreferrer/);
  assert.match(pageSource, /article\.previousArticle/);
  assert.match(pageSource, /article\.nextArticle/);
  assert.match(pageSource, /<RelatedNews/);
  assert.doesNotMatch(pageSource, /dangerouslySetInnerHTML/);
  assert.equal(
    (contentSource.match(/dangerouslySetInnerHTML/g) ?? []).length,
    1,
  );
});

test('editorial UI: news states retain retry, overview, and reduced-motion support', () => {
  const error = read('apps/frontend/app/ban-tin/error.tsx');
  const states = read('apps/frontend/components/news/NewsStates.module.css');
  const notFound = read('apps/frontend/app/not-found.tsx');
  assert.match(error, /reset\(\)/);
  assert.match(states, /prefers-reduced-motion/);
  assert.match(notFound, /ban-tin/);
});
