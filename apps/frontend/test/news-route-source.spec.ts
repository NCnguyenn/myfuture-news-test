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
  assert.match(source, /CATEGORY_PAGE_SIZE/);
  assert.doesNotMatch(source, /limit:\s*10/);
});
