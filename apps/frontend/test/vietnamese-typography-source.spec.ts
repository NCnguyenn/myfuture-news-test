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

test('Vietnamese headings use the dedicated font without negative tracking', () => {
  const globals = readFileSync('apps/frontend/app/globals.css', 'utf8');
  const overview = readFileSync(
    'apps/frontend/app/ban-tin/page.module.css',
    'utf8',
  );
  const category = readFileSync(
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.module.css',
    'utf8',
  );
  const articleHeader = readFileSync(
    'apps/frontend/components/news/ArticleHeader.module.css',
    'utf8',
  );
  const newsCard = readFileSync(
    'apps/frontend/components/news/NewsCard.module.css',
    'utf8',
  );

  assert.match(
    globals,
    /--font-editorial:\s*var\(--font-vietnamese\),\s*"Be Vietnam Pro"/,
  );
  assert.match(
    globals,
    /\.page-intro h1\s*\{[^}]*letter-spacing:\s*normal/,
  );
  assert.match(
    overview,
    /\.intro h1\s*\{[^}]*letter-spacing:\s*normal/,
  );
  assert.match(
    category,
    /\.intro h1\s*\{[^}]*letter-spacing:\s*normal/,
  );
  assert.match(
    articleHeader,
    /\.title\s*\{[^}]*letter-spacing:\s*normal/,
  );
  assert.match(
    newsCard,
    /\.body h3\s*\{[^}]*letter-spacing:\s*normal/,
  );
  assert.match(
    newsCard,
    /\.lead \.body h3\s*\{[^}]*letter-spacing:\s*normal/,
  );
});
