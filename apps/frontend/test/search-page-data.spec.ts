import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiClientError } from '../lib/api-client';
import {
  loadSearchPageData,
  normalizeSearchQuery,
  parseSearchPage,
  SEARCH_PAGE_SIZE,
  SEARCH_RESULTS_PATH,
} from '../lib/search-page-data';
import type { ArticleListResponse } from '../types/news';

function listResponse(
  overrides: Partial<ArticleListResponse['meta']> & {
    data?: ArticleListResponse['data'];
  } = {},
): ArticleListResponse {
  const {
    data = [],
    page = 1,
    limit = SEARCH_PAGE_SIZE,
    totalItems = 0,
    totalPages = 0,
    hasNextPage = false,
    hasPreviousPage = false,
  } = overrides;
  return {
    data,
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
  };
}

test('normalizeSearchQuery accepts trimmed queries between 2 and 100 characters', () => {
  assert.deepEqual(normalizeSearchQuery('  bất động sản  '), {
    ok: true,
    query: 'bất động sản',
  });
  assert.deepEqual(normalizeSearchQuery('a'), {
    ok: false,
    query: 'a',
    reason: 'too_short',
  });
  assert.deepEqual(normalizeSearchQuery(''), {
    ok: false,
    query: '',
    reason: 'empty',
  });
  assert.deepEqual(normalizeSearchQuery('x'.repeat(101)), {
    ok: false,
    query: 'x'.repeat(101),
    reason: 'too_long',
  });
});

test('parseSearchPage canonicalizes invalid page tokens to 1', () => {
  assert.equal(parseSearchPage(undefined), 1);
  assert.equal(parseSearchPage('0'), 1);
  assert.equal(parseSearchPage('abc'), 1);
  assert.equal(parseSearchPage(['2', '9']), 2);
});

test('loadSearchPageData does not call the API for invalid queries', async () => {
  let calls = 0;
  const result = await loadSearchPageData(
    { q: ' ', page: '3' },
    {
      loadArticles: async () => {
        calls += 1;
        return listResponse();
      },
    },
  );

  assert.equal(calls, 0);
  assert.deepEqual(result, {
    status: 'invalid',
    query: '',
    reason: 'empty',
    page: 3,
  });
});

test('loadSearchPageData returns success payloads for valid queries', async () => {
  const response = listResponse({
    data: [
      {
        id: '1',
        title: 'Hưng Yên mở rộng hạ tầng',
        slug: 'hung-yen',
        excerpt: 'Trục Bắc Nam',
        thumbnailUrl: '/images/news/placeholder-default.svg',
        imageAlt: 'Hưng Yên',
        publishedAt: '2026-07-24T00:00:00.000Z',
        category: { name: 'Quy hoạch hạ tầng', slug: 'quy-hoach-ha-tang' },
        author: {
          name: 'MyFuture News',
          slug: 'myfuture-news',
          authorType: 'organization',
        },
      },
    ],
    page: 1,
    totalItems: 1,
    totalPages: 1,
  });

  const result = await loadSearchPageData(
    { q: 'hung yen', page: '1' },
    {
      loadArticles: async (input) => {
        assert.deepEqual(input, {
          q: 'hung yen',
          page: 1,
          limit: SEARCH_PAGE_SIZE,
        });
        return response;
      },
    },
  );

  assert.equal(result.status, 'success');
  if (result.status === 'success') {
    assert.equal(result.query, 'hung yen');
    assert.equal(result.response.data[0]?.slug, 'hung-yen');
  }
});

test('loadSearchPageData redirects beyond totalPages while preserving q', async () => {
  const result = await loadSearchPageData(
    { q: 'bat dong san', page: '9' },
    {
      loadArticles: async () =>
        listResponse({
          page: 9,
          totalItems: 12,
          totalPages: 2,
        }),
    },
  );

  assert.deepEqual(result, {
    status: 'redirect',
    to: `${SEARCH_RESULTS_PATH}?q=bat+dong+san&page=2`,
  });
});

test('loadSearchPageData hides upstream details in its user-facing error state', async () => {
  const result = await loadSearchPageData(
    { q: 'hung yen', page: '1' },
    {
      loadArticles: async () => {
        throw new ApiClientError(
          400,
          'property q should not exist',
          'INVALID_REQUEST',
        );
      },
    },
  );

  assert.deepEqual(result, {
    status: 'error',
    query: 'hung yen',
    page: 1,
    message: 'Tìm kiếm đang tạm thời gián đoạn. Vui lòng thử lại.',
    code: 'INVALID_REQUEST',
  });
  if (result.status === 'error') {
    assert.doesNotMatch(result.message, /property q should not exist/i);
  }
});

test('loadSearchPageData maps unexpected failures to SEARCH_UNAVAILABLE', async () => {
  const result = await loadSearchPageData(
    { q: 'hung yen' },
    {
      loadArticles: async () => {
        throw new Error('network down');
      },
    },
  );

  assert.equal(result.status, 'error');
  if (result.status === 'error') {
    assert.equal(result.code, 'SEARCH_UNAVAILABLE');
    assert.match(result.message, /gián đoạn/i);
  }
});
