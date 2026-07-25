import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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
  const detailStyles = read(
    'apps/frontend/app/ban-tin/[articleSlug]/page.module.css',
  );
  const header = read('apps/frontend/components/news/ArticleHeader.tsx');
  const evidence = read('apps/frontend/components/news/SourceEvidence.tsx');
  const scrollResetPath =
    'apps/frontend/components/news/ScrollToTopOnArticleChange.tsx';

  assert.match(header, /Tác giả:/);
  assert.match(page, /article\.imageProvenance\.isPlaceholder/);
  assert.match(evidence, /Nguồn kiểm chứng/);
  assert.match(evidence, /evidence\.map/);
  assert.match(page, /<PopularStories/);
  assert.match(page, /<CategoryDirectory/);
  assert.match(page, /<ScrollToTopOnArticleChange/);
  assert.match(page, /sort:\s*'popular'/);
  assert.match(detailStyles, /position:\s*sticky/);
  assert.match(detailStyles, /max-height:\s*calc\(100vh/);
  assert.match(detailStyles, /@media\s*\(max-width:\s*980px\)/);
  assert.equal(
    existsSync(path.join(workspaceRoot, scrollResetPath)),
    true,
    'scroll reset component must exist',
  );
  if (existsSync(path.join(workspaceRoot, scrollResetPath))) {
    const scrollReset = read(scrollResetPath);
    assert.match(scrollReset, /window\.scrollTo/);
    assert.match(scrollReset, /articleSlug/);
  }
});
