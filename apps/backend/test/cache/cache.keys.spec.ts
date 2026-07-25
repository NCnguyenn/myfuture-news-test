import assert from 'node:assert/strict';
import test from 'node:test';
import { articleDetailCacheKey, articleListCacheKey, categoriesCacheKey } from '../../src/cache/cache.keys';

test('builds stable cache keys for normalized API inputs', () => {
  assert.equal(categoriesCacheKey(), 'news:categories');
  assert.equal(
    articleListCacheKey({ category: undefined, page: 1, limit: 10, featured: undefined, sort: 'newest' }),
    'news:articles:all:1:10:any:newest',
  );
  assert.equal(
    articleListCacheKey({ category: 'phap-ly-du-an', page: 2, limit: 20, featured: false, sort: 'popular' }),
    'news:articles:phap-ly-du-an:2:20:false:popular',
  );
  assert.equal(
    articleListCacheKey({
      category: undefined,
      page: 1,
      limit: 6,
      featured: undefined,
      sort: 'newest',
      q: 'bat dong san',
    }),
    'news:articles:all:1:6:any:newest:q:bat%20dong%20san',
  );
  assert.equal(articleDetailCacheKey('phap-ly-du-an-bai-01'), 'news:article:phap-ly-du-an-bai-01');
});
