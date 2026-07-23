import assert from 'node:assert/strict';
import test from 'node:test';
import { CategoriesService } from '../src/categories/categories.service';

test('returns active categories with published article counts', async () => {
  const prisma = {
    category: {
      findMany: async () => [
        {
          id: 'category-id',
          name: 'Pháp lý dự án',
          slug: 'phap-ly-du-an',
          description: 'Description',
          sortOrder: 1,
          _count: { articles: 12 },
        },
      ],
    },
  };

  const cache = {
    getJson: async () => null,
    setJson: async () => true,
  };
  const service = new CategoriesService(prisma as never, cache as never);

  assert.deepEqual(await service.list(), {
    data: [
      {
        id: 'category-id',
        name: 'Pháp lý dự án',
        slug: 'phap-ly-du-an',
        description: 'Description',
        articleCount: 12,
      },
    ],
  });
});

test('returns cached categories without querying Prisma', async () => {
  const cached = {
    data: [
      {
        id: 'cached-category-id',
        name: 'Cached category',
        slug: 'cached-category',
        description: null,
        articleCount: 4,
      },
    ],
  };
  const prisma = {
    category: {
      findMany: async () => {
        throw new Error('Prisma should not run on a cache hit');
      },
    },
  };
  const cache = {
    getJson: async () => cached,
    setJson: async () => true,
  };

  const service = new CategoriesService(prisma as never, cache as never);

  assert.deepEqual(await service.list(), cached);
});
