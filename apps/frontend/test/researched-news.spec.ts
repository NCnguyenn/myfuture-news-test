import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  EXPECTED_ARTICLE_COUNTS,
  EXPECTED_PUBLISHED_ARTICLES,
} from '../../../scripts/lib/news-dataset-contract';
import {
  getResearchedArticleBySlug,
  getResearchedArticles,
  getResearchedCategories,
} from '../lib/researched-news';

const workspaceRoot = path.resolve(import.meta.dirname, '..', '..', '..');

test('researched news loads the complete dataset with approved category counts', () => {
  const categories = getResearchedCategories().data;
  const articles = getResearchedArticles({ limit: 100 }).data;

  assert.equal(categories.length, 6);
  assert.equal(articles.length, EXPECTED_PUBLISHED_ARTICLES);
  assert.deepEqual(
    Object.fromEntries(categories.map((item) => [item.slug, item.articleCount])),
    EXPECTED_ARTICLE_COUNTS,
  );
  assert.equal(new Set(articles.map(({ slug }) => slug)).size, 42);
});

test('production smoke uses the shared dataset contract instead of legacy totals', () => {
  const smokeSource = readFileSync(
    path.join(workspaceRoot, 'scripts', 'smoke-production.ts'),
    'utf8',
  );

  assert.match(smokeSource, /from ['"]\.\/lib\/news-dataset-contract['"]/);
  assert.match(smokeSource, /EXPECTED_ARTICLE_COUNTS/);
  assert.match(smokeSource, /EXPECTED_PUBLISHED_ARTICLES/);
  assert.doesNotMatch(smokeSource, /totalItems, 30/);
  assert.doesNotMatch(smokeSource, /meta\.totalItems, 5/);
});

test('returns only articles from the requested category', () => {
  const response = getResearchedArticles({
    category: 'phap-ly-du-an',
    limit: 100,
  });

  assert.equal(
    response.data.length,
    EXPECTED_ARTICLE_COUNTS['phap-ly-du-an'],
  );
  assert.ok(
    response.data.every(
      (item) => item.category.slug === 'phap-ly-du-an',
    ),
  );
});

test('does not expose a known old demo slug', () => {
  assert.equal(getResearchedArticleBySlug('phap-ly-du-an-bai-01'), undefined);
});

test('maps full detail with author, source, evidence, and safe HTML', () => {
  const first = getResearchedArticles({ limit: 1 }).data[0];
  const response = getResearchedArticleBySlug(first.slug);

  assert.ok(first.imageAlt.length > 0);
  assert.ok(response);
  assert.ok(response.data.author.name.length > 0);
  assert.match(response.data.sourceUrl ?? '', /^https:\/\//);
  assert.ok(response.data.evidence.length > 0);
  assert.match(response.data.contentHtml, /<h[23]>/);
});

test('uses unique new slugs and source URLs only', () => {
  const articles = getResearchedArticles({ limit: 100 }).data;
  assert.equal(new Set(articles.map((item) => item.slug)).size, 42);

  const sourceUrls = articles.map((item) => {
    const detail = getResearchedArticleBySlug(item.slug);
    assert.ok(detail);
    return detail.data.sourceUrl;
  });
  assert.equal(new Set(sourceUrls).size, EXPECTED_PUBLISHED_ARTICLES);
});

test('does not reuse any source URL from the Antigravity manifest', () => {
  const excludedSourceUrls = JSON.parse(
    readFileSync(
      path.join(
        import.meta.dirname,
        'fixtures',
        'antigravity-source-urls.json',
      ),
      'utf8',
    ),
  ) as string[];
  assert.equal(excludedSourceUrls.length, 29);
  assert.equal(new Set(excludedSourceUrls).size, 29);

  const excluded = new Set(excludedSourceUrls);
  const articles = getResearchedArticles({ limit: 100 }).data;
  for (const article of articles) {
    const detail = getResearchedArticleBySlug(article.slug);
    assert.ok(detail);
    assert.equal(
      excluded.has(detail.data.sourceUrl ?? ''),
      false,
      `Reused excluded source URL: ${detail.data.sourceUrl}`,
    );
  }
});

test('records image provenance for every researched article', () => {
  type ImageRecord = {
    localPath: string;
    originalImageUrl: string | null;
    sourcePageUrl: string;
    credit: string | null;
    isPlaceholder: boolean;
  };

  const imageManifest = JSON.parse(
    readFileSync(
      path.join(
        workspaceRoot,
        'data/news/images.json',
      ),
      'utf8',
    ),
  ) as Record<string, ImageRecord>;
  assert.equal(Object.keys(imageManifest).length, EXPECTED_PUBLISHED_ARTICLES);

  const articles = getResearchedArticles({ limit: 100 }).data;
  for (const article of articles) {
    const detail = getResearchedArticleBySlug(article.slug);
    const image = imageManifest[article.slug];
    assert.ok(detail);
    assert.ok(image);
    assert.equal(image.sourcePageUrl, detail.data.sourceUrl);
    assert.ok(image.localPath.startsWith('/images/news/'));

    if (!image.isPlaceholder) {
      const localFile = path.join(
        workspaceRoot,
        'apps',
        'frontend',
        'public',
        image.localPath.replace(/^\//, ''),
      );
      assert.equal(existsSync(localFile), true);
      assert.ok(statSync(localFile).size > 0);
    }
  }
});
