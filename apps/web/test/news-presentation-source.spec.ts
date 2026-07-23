import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const workspaceRoot = path.resolve(import.meta.dirname, '..', '..', '..');

function read(relativePath: string): string {
  return readFileSync(path.join(workspaceRoot, relativePath), 'utf8');
}

test('news cards show authors and only render real view counts', () => {
  const card = read('apps/web/components/news/NewsCard.tsx');
  const featured = read('apps/web/components/news/FeaturedNews.tsx');

  assert.match(card, /article\.author\.name/);
  assert.match(card, /article\.viewCount !== undefined/);
  assert.match(featured, /primary\.author\.name/);
});

test('article details show author, image provenance, and verification evidence', () => {
  const page = read('apps/web/app/ban-tin/[articleSlug]/page.tsx');

  assert.match(page, /Tác giả:/);
  assert.match(page, /article\.imageProvenance\.isPlaceholder/);
  assert.match(page, /Nguồn kiểm chứng/);
  assert.match(page, /article\.evidence\.map/);
});
