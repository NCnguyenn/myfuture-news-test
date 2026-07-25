import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const routeFiles = [
  'apps/frontend/app/ban-tin/page.tsx',
  'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx',
  'apps/frontend/app/ban-tin/[articleSlug]/page.tsx',
];
const workspaceRoot = path.resolve(import.meta.dirname, '..', '..', '..');

test('news routes use api-client and never import researched-news at runtime', () => {
  for (const relativePath of routeFiles) {
    const source = readFileSync(
      path.join(workspaceRoot, relativePath),
      'utf8',
    );
    assert.match(source, /api-client/);
    assert.doesNotMatch(source, /researched-news/);
  }
});

test('article metadata only catches ApiClientError 404 and rethrows other errors', () => {
  const articlePage = readFileSync(
    path.join(
      workspaceRoot,
    'apps/frontend/app/ban-tin/[articleSlug]/page.tsx',
    ),
    'utf8',
  );

  // Must not use a bare catch that swallows navigation/notFound errors.
  assert.doesNotMatch(articlePage, /\bcatch\s*\{/);
  assert.match(articlePage, /isNotFoundError|ApiClientError/);
  assert.match(articlePage, /notFound\(\)/);
});

test('category pagination uses the demonstrable page size', () => {
  const source = readFileSync(
    path.join(
      workspaceRoot,
      'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx',
    ),
    'utf8',
  );
  const configSource = readFileSync(
    path.join(workspaceRoot, 'apps/frontend/lib/news-config.ts'),
    'utf8',
  );

  assert.match(configSource, /CATEGORY_PAGE_SIZE\s*=\s*4/);
  assert.match(source, /limit:\s*CATEGORY_PAGE_SIZE/);
  assert.doesNotMatch(source, /limit:\s*10/);
});

test('category route preserves first-page lead and later-page feed semantics', () => {
  const source = readFileSync(
    path.join(
      workspaceRoot,
      'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx',
    ),
    'utf8',
  );

  assert.match(
    source,
    /page === 1\s*\?\s*articlesResponse\.data\[0\]\s*:\s*undefined/,
  );
  assert.match(
    source,
    /page === 1\s*\?\s*articlesResponse\.data\.slice\(1\)\s*:\s*articlesResponse\.data/,
  );
  assert.match(source, /meta\.totalItems/);
  assert.match(
    source,
    /basePath=\{`\/ban-tin\/chuyen-muc\/\$\{category\.slug\}`\}/,
  );
});

test('overview pagination parses the selected page and keeps a fixed page size', () => {
  const source = readFileSync(
    path.join(workspaceRoot, 'apps/frontend/app/ban-tin/page.tsx'),
    'utf8',
  );

  assert.match(source, /const LATEST_PAGE_SIZE = 10/);
  assert.match(source, /parseOverviewPage/);
  assert.match(source, /const page = parseOverviewPage\(query\.page\)/);
  assert.match(source, /page,\s*limit:\s*LATEST_PAGE_SIZE/);
  assert.match(source, /<Pagination[\s\S]*meta=\{latestResponse\.meta\}/);
  assert.match(source, /basePath="\/ban-tin"/);
});

test('overview redirects out-of-range pages after reading response metadata', () => {
  const source = readFileSync(
    path.join(workspaceRoot, 'apps/frontend/app/ban-tin/page.tsx'),
    'utf8',
  );

  assert.match(source, /import\s+\{\s*redirect\s*\}\s+from\s+'next\/navigation'/);
  assert.match(source, /resolveOverviewPageRedirect\(page,\s*latestResponse\.meta\)/);
  assert.match(source, /if\s*\(redirectTo\)\s*redirect\(redirectTo\)/);
});
