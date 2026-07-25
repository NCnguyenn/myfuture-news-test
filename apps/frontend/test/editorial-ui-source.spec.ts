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

  assert.match(css, /--font-editorial:.*Georgia.*Cambria.*Times New Roman.*serif/i);
  assert.match(css, /--font-interface:.*Segoe UI.*Helvetica.*Arial.*sans-serif/i);
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
    /Đăng nhập|Tìm kiếm|newsletter|nhận bản tin|MyFuture Pro|type="search"/i,
  );
});

test('editorial UI: provides all five approved story-card variants', () => {
  const source = read('apps/frontend/components/news/NewsCard.tsx');
  assert.match(
    source,
    /'lead'[\s\S]*'supporting'[\s\S]*'feed'[\s\S]*'compact'[\s\S]*'related'/,
  );
  assert.match(source, /variant\s*=\s*'feed'/);
  assert.match(source, /IMAGE_SIZES/);
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

test('editorial UI: category page separates the first-page lead from the feed', () => {
  const source = read(
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx',
  );
  assert.match(source, /page === 1/);
  assert.match(source, /categoryLead/);
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

test('editorial UI: news states retain retry, overview, and reduced-motion support', () => {
  const error = read('apps/frontend/app/ban-tin/error.tsx');
  const states = read('apps/frontend/components/news/NewsStates.module.css');
  const notFound = read('apps/frontend/app/not-found.tsx');
  assert.match(error, /reset\(\)/);
  assert.match(states, /prefers-reduced-motion/);
  assert.match(notFound, /ban-tin/);
});
