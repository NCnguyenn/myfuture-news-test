import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

test('review fixes: category sidebar uses the compact directory', () => {
  const source = read(
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx',
  );

  assert.match(source, /<CategoryDirectory\s+categories=\{categories\}\s+compact\s*\/>/);
});

test('review fixes: global CSS excludes dead article-specific selectors', () => {
  const css = read('apps/frontend/app/globals.css');
  const deadSelectors = [
    'article-header',
    'article-category',
    'article-excerpt',
    'article-meta',
    'article-cover',
    'article-layout',
    'article-content',
    'article-sidebar',
    'article-evidence',
    'article-nav',
  ];

  for (const selector of deadSelectors) {
    assert.doesNotMatch(css, new RegExp(`\\.${selector}(?:\\b|\\s|:|\\[)`));
  }
});
