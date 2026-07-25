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
