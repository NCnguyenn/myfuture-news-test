import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const workspaceRoot = path.resolve(import.meta.dirname, '..', '..', '..');

function read(relativePath: string): string {
  return readFileSync(path.join(workspaceRoot, relativePath), 'utf8');
}

test('news presentation: cards show supported metadata and deterministic image sizes', () => {
  const card = read('apps/frontend/components/news/NewsCard.tsx');
  const featured = read('apps/frontend/components/news/FeaturedNews.tsx');

  assert.match(card, /article\.author\.name/);
  assert.match(card, /article\.viewCount !== undefined/);
  assert.match(card, /article\.readingTime/);
  assert.match(card, /sizes=\{IMAGE_SIZES\[variant\]\}/);
  assert.match(card, /lead:\s*'\(max-width: 768px\) 100vw, 66vw'/);
  assert.match(
    card,
    /supporting:\s*'\(max-width: 360px\) 96px, \(max-width: 768px\) 112px, 34vw'/,
  );
  assert.match(
    card,
    /feed:\s*'\(max-width: 360px\) 96px, \(max-width: 768px\) 112px, 230px'/,
  );
  assert.match(card, /compact:\s*'\(max-width: 360px\) 96px, 112px'/);
  assert.match(
    card,
    /related:\s*'\(max-width: 600px\) 100vw, \(max-width: 850px\) 50vw, 33vw'/,
  );
  assert.match(featured, /primary\.author\.name/);
});

test('news presentation: article details show author, image provenance, and verification evidence', () => {
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
  assert.match(evidence, /Nguồn tham khảo/);
  assert.match(evidence, /evidence\.map/);
  assert.match(page, /<PopularStories/);
  assert.match(page, /<CategoryDirectory/);
  assert.match(page, /<ScrollToTopOnArticleChange/);
  assert.match(page, /sort:\s*'popular'/);
  assert.match(detailStyles, /position:\s*sticky/);
  assert.match(detailStyles, /max-height:\s*calc\(100vh/);
  assert.match(detailStyles, /@media\s*\(max-width:\s*1199px\)/);
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

test('news presentation: images use the responsive Next Image boundary', () => {
  const image = read('apps/frontend/components/news/NewsImage.tsx');

  assert.match(image, /import Image from 'next\/image';/);
  assert.match(image, /<Image\b/);
  assert.doesNotMatch(image, /<img\b/);
  assert.match(image, /sizes\?: string/);
  assert.match(image, /sizes\s*=\s*'\(max-width: 768px\) 100vw, 50vw'/);
  assert.match(image, /\bfill\b/);
  assert.match(image, /sizes=\{sizes\}/);
  assert.match(image, /priority=\{priority\}/);
  assert.match(image, /onError=/);
  assert.doesNotMatch(image, /unoptimized/);
});
