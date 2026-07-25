import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const routePath = 'apps/frontend/app/api/news-search/route.ts';

test('quick-search route validates, bounds, and proxies through api-client', () => {
  assert.equal(existsSync(routePath), true, 'quick-search route must exist');
  const source = readFileSync(routePath, 'utf8');

  assert.match(source, /getArticles/);
  assert.match(source, /query\.length < 2/);
  assert.match(source, /query\.length > 100/);
  assert.match(source, /Math\.min\(6/);
  assert.doesNotMatch(source, /API_BASE_URL/);
});
