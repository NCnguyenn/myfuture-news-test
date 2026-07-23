import assert from 'node:assert/strict';
import test from 'node:test';
import { ArticlesService } from '../src/articles/articles.service';

test('returns published article list data with pagination metadata', async () => {
  const prisma = {
    category: {
      findUnique: async () => ({ id: 'category-id', name: 'Pháp lý dự án', slug: 'phap-ly-du-an' }),
    },
    article: {
      count: async () => 12,
      findMany: async () => [
        {
          id: 'article-id',
          title: 'Article title',
          slug: 'article-slug',
          excerpt: 'Excerpt',
          thumbnailUrl: '/images/news/placeholder-01.svg',
          publishedAt: new Date('2026-07-20T00:00:00.000Z'),
          viewCount: 12,
          category: { name: 'Pháp lý dự án', slug: 'phap-ly-du-an' },
        },
      ],
    },
  };

  const cache = {
    getJson: async () => null,
    setJson: async () => true,
  };
  const service = new ArticlesService(prisma as never, new (class {})() as never, cache as never);
  const result = await service.list({ category: 'phap-ly-du-an', page: 2, limit: 10 });

  assert.deepEqual(result.meta, {
    page: 2,
    limit: 10,
    totalItems: 12,
    totalPages: 2,
    hasNextPage: false,
    hasPreviousPage: true,
  });
  assert.equal(result.data[0].slug, 'article-slug');
  assert.equal('contentHtml' in result.data[0], false);
});

test('returns cached article list without querying Prisma on a normalized key hit', async () => {
  const cached = {
    data: [],
    meta: {
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
  const prisma = {
    category: {
      findUnique: async () => {
        throw new Error('Prisma should not run on an overview cache hit');
      },
    },
    article: {
      count: async () => {
        throw new Error('Prisma should not run on a cache hit');
      },
      findMany: async () => {
        throw new Error('Prisma should not run on a cache hit');
      },
    },
  };
  const cache = {
    getJson: async () => cached,
    setJson: async () => true,
  };
  const service = new ArticlesService(prisma as never, new (class {})() as never, cache as never);

  assert.deepEqual(await service.list({ page: 1, limit: 10, sort: 'newest' }), cached);
});
