import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiClientError } from '../lib/api-client';
import { loadArticlePageData } from '../lib/article-page-data';
import { selectPopularStories } from '../lib/news-overview';
import type { ArticleDetail, ArticleListItem } from '../types/news';

function article(slug: string): ArticleListItem {
  return {
    id: slug,
    title: `Title ${slug}`,
    slug,
    excerpt: `Excerpt ${slug}`,
    thumbnailUrl: `/${slug}.jpg`,
    imageAlt: `Image ${slug}`,
    publishedAt: '2026-07-25T00:00:00.000Z',
    viewCount: 0,
    category: { name: 'Category', slug: 'category' },
    author: {
      name: 'MyFuture News',
      slug: 'myfuture-news',
      authorType: 'organization',
    },
  };
}

function articleDetail(
  slug: string,
  relatedArticles: ArticleListItem[] = [],
): ArticleDetail {
  return {
    ...article(slug),
    contentHtml: '<p>Content</p>',
    coverImageUrl: null,
    readingTime: null,
    sourceName: null,
    sourceUrl: null,
    isFeatured: false,
    author: {
      ...article(slug).author,
      verificationNote: 'Editorial desk',
    },
    evidence: [],
    imageProvenance: {
      localPath: '/image.jpg',
      originalImageUrl: null,
      sourcePageUrl: 'https://example.com/image',
      credit: null,
      isPlaceholder: false,
    },
    relatedArticles,
    previousArticle: null,
    nextArticle: null,
  };
}

test('article page falls back to related stories when popular discovery rejects', async () => {
  const events: string[] = [];
  let resolveArticle: (article: ArticleDetail) => void;
  const articlePromise = new Promise<ArticleDetail>((resolve) => {
    resolveArticle = resolve;
  });

  const dataPromise = loadArticlePageData({
    loadArticle: () => {
      events.push('article');
      return articlePromise;
    },
    loadCategories: async () => {
      events.push('categories');
      return { data: [] };
    },
    loadPopular: async () => {
      events.push('popular');
      throw new Error('popular request timed out');
    },
  });

  await Promise.resolve();
  assert.deepEqual(events, ['article']);

  resolveArticle!(articleDetail('current', [article('related-a')]));
  const data = await dataPromise;
  const selection = selectPopularStories(
    data.popularResponse.data,
    data.article.relatedArticles,
    [data.article],
  );

  assert.deepEqual(events, ['article', 'categories', 'popular']);
  assert.deepEqual(data.popularResponse.data, []);
  assert.deepEqual(selection.articles.map(({ slug }) => slug), ['related-a']);
});

test('article page resolves an article 404 before starting optional discovery', async () => {
  const events: string[] = [];
  const notFound = new ApiClientError(404, 'article not found');

  await assert.rejects(
    loadArticlePageData({
      loadArticle: async () => {
        events.push('article');
        throw notFound;
      },
      loadCategories: async () => {
        events.push('categories');
        return { data: [] };
      },
      loadPopular: async () => {
        events.push('popular');
        return {
          data: [],
          meta: {
            page: 1,
            limit: 6,
            totalItems: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      },
    }),
    (error) => error === notFound,
  );

  assert.deepEqual(events, ['article']);
});
