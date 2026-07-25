import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const searchPagePath =
  'apps/frontend/app/ban-tin/tim-kiem/page.tsx';

test('search page server-renders API results and preserves the query', () => {
  assert.equal(existsSync(searchPagePath), true, 'search page must exist');
  const page = readFileSync(searchPagePath, 'utf8');

  assert.match(page, /getArticles\(\{[\s\S]*?q:/);
  assert.match(page, /Kết quả tìm kiếm/);
  assert.match(page, /query=\{\{\s*q:\s*query\s*\}\}/);
  assert.match(page, /string \| string\[\]/);
  assert.match(page, /Array\.isArray/);
  assert.doesNotMatch(page, /\.slice\(0, 100\)/);
});

test('pagination merges query parameters instead of concatenating question marks', () => {
  const pagination = readFileSync(
    'apps/frontend/components/news/Pagination.tsx',
    'utf8',
  );

  assert.match(pagination, /URLSearchParams/);
  assert.match(pagination, /query\?/);
});
