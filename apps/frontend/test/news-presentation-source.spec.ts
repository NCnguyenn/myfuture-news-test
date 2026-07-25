import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const workspaceRoot = path.resolve(import.meta.dirname, '..', '..', '..');

function read(relativePath: string): string {
  return readFileSync(path.join(workspaceRoot, relativePath), 'utf8');
}

test('news cards show authors and only render real view counts', () => {
  const card = read('apps/frontend/components/news/NewsCard.tsx');
  const featured = read('apps/frontend/components/news/FeaturedNews.tsx');

  assert.match(card, /article\.author\.name/);
  assert.match(card, /article\.viewCount !== undefined/);
  assert.match(featured, /primary\.author\.name/);
});

test('article details show author, image provenance, and verification evidence', () => {
  const page = read('apps/frontend/app/ban-tin/[articleSlug]/page.tsx');
  const header = read('apps/frontend/components/news/ArticleHeader.tsx');
  const evidence = read('apps/frontend/components/news/SourceEvidence.tsx');

  assert.match(header, /Tác giả:/);
  assert.match(page, /article\.imageProvenance\.isPlaceholder/);
  assert.match(evidence, /Nguồn kiểm chứng/);
  assert.match(evidence, /evidence\.map/);
});

test('news images render through Next Image optimization', () => {
  const image = read('apps/frontend/components/news/NewsImage.tsx');

  assert.match(image, /import Image from 'next\/image';/);
  assert.match(image, /<Image\b/);
  assert.doesNotMatch(image, /<img\b/);
  assert.match(image, /width=\{1200\}/);
  assert.match(image, /height=\{675\}/);
  assert.match(image, /priority=\{priority\}/);
  assert.doesNotMatch(image, /unoptimized/);
});
