import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const searchPagePath = 'apps/frontend/app/ban-tin/tim-kiem/page.tsx';
const bffPath = 'apps/frontend/app/api/news-search/route.ts';

test('search page uses behavioral loader, robots noindex, and preserves query pagination', () => {
  assert.equal(existsSync(searchPagePath), true, 'search page must exist');
  const page = readFileSync(searchPagePath, 'utf8');

  assert.match(page, /loadSearchPageData/);
  assert.match(page, /robots:\s*\{[\s\S]*index:\s*false/);
  assert.match(page, /follow:\s*true/);
  assert.match(page, /status === 'error'/);
  assert.match(page, /status === 'redirect'/);
  assert.match(page, /redirect\(/);
  assert.match(page, /query=\{\{\s*q:\s*result\.query\s*\}\}/);
  assert.match(page, /ErrorPanel/);
  assert.doesNotMatch(
    page,
    /const\s+response\s*=\s*await\s+getArticles\(/,
  );
});

test('search BFF route exists under App Router api/news-search', () => {
  assert.equal(existsSync(bffPath), true, 'BFF search route must exist');
  const route = readFileSync(bffPath, 'utf8');
  assert.match(route, /export async function GET/);
  assert.match(route, /getArticles/);
  assert.match(route, /request\.signal/);
});

test('pagination merges query parameters instead of concatenating question marks', () => {
  const pagination = readFileSync(
    'apps/frontend/components/news/Pagination.tsx',
    'utf8',
  );

  assert.match(pagination, /URLSearchParams/);
  assert.match(pagination, /query\?/);
});
