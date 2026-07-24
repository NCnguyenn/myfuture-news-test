import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertSeedSnapshot,
  type SeedSnapshot,
} from '../../../scripts/lib/seed-invariants';

const valid: SeedSnapshot = {
  categories: Array.from({ length: 6 }, (_, index) => ({
    slug: `category-${index + 1}`,
    publishedArticleCount: 5,
  })),
  articles: Array.from({ length: 30 }, (_, index) => ({
    slug: `article-${index + 1}`,
    sourceUrl: `https://source.example.test/${index + 1}`,
    isFeatured: index < 5,
    categorySlug: `category-${Math.floor(index / 5) + 1}`,
  })),
  overviewCategoryCount: 0,
};

test('accepts the exact recruiter dataset', () => {
  assert.doesNotThrow(() => assertSeedSnapshot(valid));
});

test('rejects an incorrect category count', () => {
  const invalid = structuredClone(valid);
  invalid.categories.pop();
  assert.throws(() => assertSeedSnapshot(invalid), /6 categories/);
});

test('rejects an incorrect published article count', () => {
  const invalid = structuredClone(valid);
  invalid.articles.pop();
  assert.throws(() => assertSeedSnapshot(invalid), /30 published articles/);
});

test('rejects a stored overview category', () => {
  const invalid = structuredClone(valid);
  invalid.overviewCategoryCount = 1;
  assert.throws(() => assertSeedSnapshot(invalid), /must not be stored/);
});

test('rejects an incorrect per-category article count', () => {
  const invalid = structuredClone(valid);
  invalid.categories[0].publishedArticleCount = 4;
  assert.throws(() => assertSeedSnapshot(invalid), /5 published articles/);
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
