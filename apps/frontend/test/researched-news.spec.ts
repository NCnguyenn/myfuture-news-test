import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  getResearchedArticleBySlug,
  getResearchedArticles,
  getResearchedCategories,
} from '../lib/researched-news';

const workspaceRoot = path.resolve(import.meta.dirname, '..', '..', '..');

test('loads exactly six categories and thirty complete new articles', () => {
  const categories = getResearchedCategories().data;
  const articles = getResearchedArticles({ limit: 100 }).data;

  assert.equal(categories.length, 6);
  assert.equal(articles.length, 30);
  assert.deepEqual(
    categories.map((item) => item.articleCount),
    [5, 5, 5, 5, 5, 5],
  );
});

test('returns only articles from the requested category', () => {
  const response = getResearchedArticles({
    category: 'phap-ly-du-an',
    limit: 100,
  });

  assert.equal(response.data.length, 5);
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
  assert.equal(new Set(articles.map((item) => item.slug)).size, 30);

  const sourceUrls = articles.map((item) => {
    const detail = getResearchedArticleBySlug(item.slug);
    assert.ok(detail);
    return detail.data.sourceUrl;
  });
  assert.equal(new Set(sourceUrls).size, 30);
});

test('records image provenance for all thirty researched articles', () => {
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
  assert.equal(Object.keys(imageManifest).length, 30);

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
