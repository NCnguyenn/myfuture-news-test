import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeVietnameseSearch,
  rankArticleSearch,
} from '../src/articles/article-search';

const article = {
  title: 'Hà Nội phát triển nhà ở cho thuê dài hạn',
  excerpt: 'Giá thuê và vận hành là hai điểm cốt lõi.',
  contentHtml:
    '<h2>Từ chủ trương đến sản phẩm ở được</h2><p>Nguồn cung ổn định.</p>',
  category: { name: 'Cho thuê' },
};

test('normalizes Vietnamese diacritics and đ deterministically', () => {
  assert.equal(
    normalizeVietnameseSearch('  Bất động sản — Đà Nẵng  '),
    'bat dong san da nang',
  );
});

test('matches unaccented queries and ranks title above body', () => {
  const titleMatch = rankArticleSearch(article, 'ha noi');
  const bodyMatch = rankArticleSearch(article, 'san pham o duoc');

  assert.ok(titleMatch);
  assert.ok(bodyMatch);
  assert.ok(titleMatch.score > bodyMatch.score);
  assert.deepEqual(titleMatch.matchedFields, ['title']);
});

test('returns a plain-text snippet and no match for unrelated terms', () => {
  const match = rankArticleSearch(article, 'cot loi');

  assert.ok(match);
  assert.equal(match.searchSnippet.includes('<'), false);
  assert.match(match.searchSnippet, /cốt lõi/i);
  assert.equal(rankArticleSearch(article, 'chứng khoán'), null);
});
