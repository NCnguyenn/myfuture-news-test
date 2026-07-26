import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EXPECTED_ARTICLE_COUNTS,
  EXPECTED_FEATURED_ARTICLES,
  EXPECTED_PUBLISHED_ARTICLES,
} from '../../../scripts/lib/news-dataset-contract';
import {
  assertSeedSnapshot,
  type SeedSnapshot,
} from '../../../scripts/lib/seed-invariants';

const articles = Object.entries(EXPECTED_ARTICLE_COUNTS).flatMap(
  ([categorySlug, count]) =>
    Array.from({ length: count }, (_, index) => ({
      slug: `${categorySlug}-${index + 1}`,
      categorySlug,
      sourceUrl: `https://example.com/${categorySlug}/${index + 1}`,
      isFeatured: index === 0 && categorySlug !== 'cho-thue',
    })),
);

const valid: SeedSnapshot = {
  categories: Object.entries(EXPECTED_ARTICLE_COUNTS).map(
    ([slug, publishedArticleCount]) => ({ slug, publishedArticleCount }),
  ),
  articles,
  overviewCategoryCount: 0,
};

test('accepts the exact 42-article dataset contract', () => {
  assert.equal(articles.length, EXPECTED_PUBLISHED_ARTICLES);
  assert.equal(
    articles.filter((article) => article.isFeatured).length,
    EXPECTED_FEATURED_ARTICLES,
  );
  assert.doesNotThrow(() => assertSeedSnapshot(valid));
});

test('rejects an incorrect category count', () => {
  const invalid = structuredClone(valid);
  invalid.categories.pop();
  assert.throws(() => assertSeedSnapshot(invalid), /6 categories/);
});

test('rejects a total of 41 published articles', () => {
  const invalid = structuredClone(valid);
  invalid.articles.pop();
  assert.throws(
    () => assertSeedSnapshot(invalid),
    /42 published articles/,
  );
});

test('rejects a stored overview category', () => {
  const invalid = structuredClone(valid);
  invalid.overviewCategoryCount = 1;
  assert.throws(() => assertSeedSnapshot(invalid), /must not be stored/);
});

test('rejects a category with one too few articles', () => {
  const invalid = structuredClone(valid);
  invalid.categories[0].publishedArticleCount -= 1;
  assert.throws(() => assertSeedSnapshot(invalid), /published articles/);
});

test('rejects duplicate article slugs', () => {
  const invalid = structuredClone(valid);
  invalid.articles[1].slug = invalid.articles[0].slug;
  assert.throws(() => assertSeedSnapshot(invalid), /article slugs/);
});

test('rejects an empty source URL', () => {
  const invalid = structuredClone(valid);
  invalid.articles[0].sourceUrl = null;
  assert.throws(() => assertSeedSnapshot(invalid), /non-empty source URLs/);
});

test('rejects duplicate source URLs', () => {
  const invalid = structuredClone(valid);
  invalid.articles[1].sourceUrl = invalid.articles[0].sourceUrl;
  assert.throws(() => assertSeedSnapshot(invalid), /source URLs/);
});

test('rejects an incorrect featured count', () => {
  const invalid = structuredClone(valid);
  invalid.articles[5].isFeatured = true;
  assert.throws(() => assertSeedSnapshot(invalid), /5 featured/);
});

test('rejects an article with an unknown category', () => {
  const invalid = structuredClone(valid);
  invalid.articles[0].categorySlug = 'unknown-category';
  assert.throws(() => assertSeedSnapshot(invalid), /known category/);
});
