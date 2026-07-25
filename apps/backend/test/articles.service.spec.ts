import assert from 'node:assert/strict';
import test from 'node:test';
import { NotFoundException } from '@nestjs/common';
import { ArticlesService } from '../src/articles/articles.service';

function createSanitizer(calls: string[] = []) {
  return {
    sanitize: (html: string) => {
      calls.push(html);
      return `sanitized:${html}`;
    },
  };
}

const baseListRow = {
  id: 'article-id',
  title: 'Article title',
  slug: 'article-slug',
  excerpt: 'Excerpt',
  thumbnailUrl: '/images/news/placeholder-01.svg',
  imageAlt: 'Ảnh bài viết',
  publishedAt: new Date('2026-07-20T00:00:00.000Z'),
  viewCount: 12,
  authorName: 'Phan Trang',
  authorSlug: 'phan-trang',
  authorType: 'person',
  category: { name: 'Pháp lý dự án', slug: 'phap-ly-du-an' },
};

const searchRows = [
  {
    ...baseListRow,
    id: 'search-title',
    title: 'Bất động sản dẫn đầu',
    slug: 'bat-dong-san-dan-dau',
    excerpt: 'Bất động sản tiếp tục được quan tâm.',
    contentHtml: '<p>Dữ liệu thị trường mới nhất.</p>',
    publishedAt: new Date('2026-07-22T00:00:00.000Z'),
  },
  {
    ...baseListRow,
    id: 'search-excerpt',
    title: 'Dòng vốn trên thị trường',
    slug: 'dong-von-thi-truong',
    excerpt: 'Dòng vốn bất động sản đang dịch chuyển.',
    contentHtml: '<p>Phân tích nguồn vốn.</p>',
    publishedAt: new Date('2026-07-21T00:00:00.000Z'),
  },
  {
    ...baseListRow,
    id: 'search-unrelated',
    title: 'Tiến độ đường cao tốc',
    slug: 'tien-do-duong-cao-toc',
    excerpt: 'Dự án giao thông bước vào giai đoạn mới.',
    contentHtml: '<p>Thông tin hạ tầng liên vùng.</p>',
    publishedAt: new Date('2026-07-20T00:00:00.000Z'),
  },
];

test('returns published article list data with pagination metadata', async () => {
  const prisma = {
    category: {
      findUnique: async () => ({ id: 'category-id', name: 'Pháp lý dự án', slug: 'phap-ly-du-an' }),
    },
    article: {
      count: async () => 12,
      findMany: async () => [baseListRow],
    },
  };

  const cache = {
    getJson: async () => null,
    setJson: async () => true,
  };
  const service = new ArticlesService(
    prisma as never,
    createSanitizer() as never,
    cache as never,
  );
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
  assert.equal(result.data[0].imageAlt, 'Ảnh bài viết');
  assert.equal(result.data[0].author.name, 'Phan Trang');
  assert.equal(result.data[0].author.slug, 'phan-trang');
  assert.equal(result.data[0].author.authorType, 'person');
  assert.equal('contentHtml' in result.data[0], false);
});

test('list must not return contentHtml even when present on raw rows', async () => {
  const prisma = {
    category: {
      findUnique: async () => ({ id: 'category-id' }),
    },
    article: {
      count: async () => 1,
      findMany: async () => [{ ...baseListRow, contentHtml: '<p>secret</p>' }],
    },
  };
  const cache = { getJson: async () => null, setJson: async () => true };
  const service = new ArticlesService(
    prisma as never,
    createSanitizer() as never,
    cache as never,
  );
  const result = await service.list({ page: 1, limit: 10 });
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
  const service = new ArticlesService(
    prisma as never,
    createSanitizer() as never,
    cache as never,
  );

  assert.deepEqual(await service.list({ page: 1, limit: 10, sort: 'newest' }), cached);
});

test('searches published articles without diacritics and ranks title matches first', async () => {
  let findManyArgs: Record<string, unknown> | undefined;
  const prisma = {
    category: {
      findUnique: async () => ({ id: 'category-id' }),
    },
    article: {
      count: async () => searchRows.length,
      findMany: async (args: Record<string, unknown>) => {
        findManyArgs = args;
        return searchRows;
      },
    },
  };
  const cache = { getJson: async () => null, setJson: async () => true };
  const service = new ArticlesService(
    prisma as never,
    createSanitizer() as never,
    cache as never,
  );

  const result = await service.list({
    q: 'bat dong san',
    page: 1,
    limit: 2,
  });

  assert.equal(result.meta.totalItems, 2);
  assert.equal(result.data.length, 2);
  assert.equal(result.data[0].title, 'Bất động sản dẫn đầu');
  assert.match(result.data[0].searchSnippet ?? '', /bất động sản/i);
  assert.deepEqual(result.data[0].matchedFields, ['title', 'excerpt']);
  assert.equal('contentHtml' in result.data[0], false);
  assert.deepEqual(findManyArgs?.where, { isPublished: true });
});

test('paginates relevance-ranked search results after filtering', async () => {
  const prisma = {
    category: {
      findUnique: async () => ({ id: 'category-id' }),
    },
    article: {
      count: async () => searchRows.length,
      findMany: async () => searchRows,
    },
  };
  const cache = { getJson: async () => null, setJson: async () => true };
  const service = new ArticlesService(
    prisma as never,
    createSanitizer() as never,
    cache as never,
  );

  const result = await service.list({
    q: 'bat dong san',
    page: 2,
    limit: 1,
  });

  assert.deepEqual(result.meta, {
    page: 2,
    limit: 1,
    totalItems: 2,
    totalPages: 2,
    hasNextPage: false,
    hasPreviousPage: true,
  });
  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].slug, 'dong-von-thi-truong');
});

test('detail returns author, image provenance, evidence and sanitizes contentHtml', async () => {
  const sanitizeCalls: string[] = [];
  const prisma = {
    article: {
      findFirst: async (args: { where: { slug: string; isPublished: boolean } }) => {
        if (args.where.slug !== 'official-slug' || args.where.isPublished !== true) {
          return null;
        }
        return {
          id: 'article-id',
          title: 'Official title',
          slug: 'official-slug',
          excerpt: 'Excerpt',
          contentHtml: '<p>raw</p><script>alert(1)</script>',
          thumbnailUrl: '/images/news/researched/official-slug.jpg',
          coverImageUrl: '/images/news/researched/official-slug.jpg',
          imageAlt: 'Cover alt',
          imageCredit: 'Báo Điện tử Chính phủ',
          originalImageUrl: 'https://cdn.example.org/image.jpg',
          imageSourcePageUrl: 'https://baochinhphu.vn/article',
          imageIsPlaceholder: false,
          publishedAt: new Date('2026-07-03T10:00:00.000Z'),
          viewCount: 5,
          readingTime: 4,
          sourceName: 'Báo Điện tử Chính phủ',
          sourceUrl: 'https://baochinhphu.vn/article',
          isFeatured: true,
          authorName: 'Phan Trang',
          authorSlug: 'phan-trang',
          authorType: 'person',
          authorVerificationNote: 'Byline verified on source page',
          evidence: [
            {
              claim: 'Claim A',
              sourceUrl: 'https://baochinhphu.vn/article',
              evidenceNote: 'Note A',
            },
          ],
          categoryId: 'category-id',
          category: { name: 'Pháp lý dự án', slug: 'phap-ly-du-an' },
        };
      },
      findMany: async () => [
        {
          ...baseListRow,
          id: 'related-1',
          slug: 'related-1',
          title: 'Related',
        },
      ],
    },
  };

  // previous/next use findFirst after the detail lookup
  let findFirstCalls = 0;
  const originalFindFirst = prisma.article.findFirst;
  prisma.article.findFirst = async (
    args: Parameters<typeof originalFindFirst>[0],
  ) => {
    findFirstCalls += 1;
    if (findFirstCalls === 1) {
      return originalFindFirst(args);
    }
    // previous / next
    return null;
  };

  const cache = { getJson: async () => null, setJson: async () => true };
  const service = new ArticlesService(
    prisma as never,
    createSanitizer(sanitizeCalls) as never,
    cache as never,
  );

  const result = await service.detail('official-slug');

  assert.equal(result.data.author.name, 'Phan Trang');
  assert.equal(result.data.author.slug, 'phan-trang');
  assert.equal(result.data.author.authorType, 'person');
  assert.equal(result.data.author.verificationNote, 'Byline verified on source page');
  assert.equal(result.data.imageAlt, 'Cover alt');
  assert.deepEqual(result.data.imageProvenance, {
    localPath: '/images/news/researched/official-slug.jpg',
    originalImageUrl: 'https://cdn.example.org/image.jpg',
    sourcePageUrl: 'https://baochinhphu.vn/article',
    credit: 'Báo Điện tử Chính phủ',
    isPlaceholder: false,
  });
  assert.equal(result.data.evidence.length, 1);
  assert.equal(result.data.evidence[0].claim, 'Claim A');
  assert.equal(result.data.contentHtml, 'sanitized:<p>raw</p><script>alert(1)</script>');
  assert.equal(sanitizeCalls.length, 1);
  assert.equal(result.data.relatedArticles.length, 1);
  assert.equal(result.data.relatedArticles[0].slug, 'related-1');
});

test('detail throws for unpublished or missing slug', async () => {
  const prisma = {
    article: {
      findFirst: async () => null,
      findMany: async () => {
        throw new Error('should not load related for missing article');
      },
    },
  };
  const cache = { getJson: async () => null, setJson: async () => true };
  const service = new ArticlesService(
    prisma as never,
    createSanitizer() as never,
    cache as never,
  );

  await assert.rejects(
    () => service.detail('phap-ly-du-an-draft-unpublished'),
    (error: unknown) => error instanceof NotFoundException,
  );
});

test('related articles query only published items in same category (take 3)', async () => {
  const relatedCalls: Array<Record<string, unknown>> = [];
  const prisma = {
    article: {
      findFirst: async (args: { where?: { slug?: string } }) => {
        if (args.where?.slug === 'main-slug') {
          return {
            id: 'main-id',
            title: 'Main',
            slug: 'main-slug',
            excerpt: 'Excerpt',
            contentHtml: '<p>body</p>',
            thumbnailUrl: '/images/news/placeholder-default.svg',
            coverImageUrl: null,
            imageAlt: null,
            imageCredit: null,
            originalImageUrl: null,
            imageSourcePageUrl: null,
            imageIsPlaceholder: true,
            publishedAt: new Date('2026-07-01T00:00:00.000Z'),
            viewCount: 0,
            readingTime: 2,
            sourceName: null,
            sourceUrl: null,
            isFeatured: false,
            authorName: null,
            authorSlug: null,
            authorType: null,
            authorVerificationNote: null,
            evidence: null,
            categoryId: 'cat-1',
            category: { name: 'Cho thuê', slug: 'cho-thue' },
          };
        }
        return null;
      },
      findMany: async (args: Record<string, unknown>) => {
        relatedCalls.push(args);
        return [];
      },
    },
  };
  const cache = { getJson: async () => null, setJson: async () => true };
  const service = new ArticlesService(
    prisma as never,
    createSanitizer() as never,
    cache as never,
  );

  await service.detail('main-slug');

  assert.equal(relatedCalls.length, 1);
  const relatedWhere = relatedCalls[0].where as {
    isPublished: boolean;
    categoryId: string;
    id: { not: string };
  };
  assert.equal(relatedWhere.isPublished, true);
  assert.equal(relatedWhere.categoryId, 'cat-1');
  assert.equal(relatedWhere.id.not, 'main-id');
  assert.equal(relatedCalls[0].take, 3);
});
