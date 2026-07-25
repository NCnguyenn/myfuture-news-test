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

test('renders the approved prominent search launcher', () => {
  const source = read('apps/frontend/components/layout/Header.tsx');
  assert.match(source, /SearchLauncher/);
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
  assert.match(launcher, /SearchOverlay/);
  assert.match(launcher, /event\.metaKey \|\| event\.ctrlKey/);
  assert.match(launcher, /event\.key\.toLowerCase\(\) === 'k'/);
  assert.match(launcher, /createPortal/);
  assert.match(launcher, /document\.body/);
  assert.match(overlay, /requestIdRef/);
  assert.match(overlay, /handleQueryChange/);
  assert.match(overlay, /aria-label="Từ khóa tìm kiếm"/);
  assert.match(overlayStyles, /\.searchForm:focus-within/);
});

test('provides the four approved story-card variants', () => {
  const source = read('apps/frontend/components/news/NewsCard.tsx');
  for (const variant of ['featured', 'compact', 'list', 'related']) {
    assert.match(source, new RegExp(`'${variant}'`));
  }
  assert.match(source, /variant\s*=\s*'list'/);
});

test('overview requests featured, newest, and popular article groups', () => {
  const source = read('apps/frontend/app/ban-tin/page.tsx');
  assert.match(source, /featured:\s*true/);
  assert.match(source, /sort:\s*'newest'/);
  assert.match(source, /sort:\s*'popular'/);
  assert.match(source, /Promise\.all/);
});

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

test('article page delegates header and evidence presentation', () => {
  const source = read(
    'apps/frontend/app/ban-tin/[articleSlug]/page.tsx',
  );
  assert.match(source, /<ArticleHeader/);
  assert.match(source, /<SourceEvidence/);
  assert.match(source, /<NewsTabs/);
});

test('news states retain retry, overview, and reduced-motion support', () => {
  const error = read('apps/frontend/app/ban-tin/error.tsx');
  const states = read('apps/frontend/components/news/NewsStates.module.css');
  const notFound = read('apps/frontend/app/not-found.tsx');
  assert.match(error, /reset\(\)/);
  assert.match(states, /prefers-reduced-motion/);
  assert.match(notFound, /ban-tin/);
});
