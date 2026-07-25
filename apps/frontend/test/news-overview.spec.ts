import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  parseOverviewPage,
  resolveOverviewPageRedirect,
  selectPopularStories,
} from '../lib/news-overview';
import type { ArticleListItem, PaginationMeta } from '../types/news';

function article(
  slug: string,
  viewCount = 0,
): ArticleListItem {
  return {
    id: slug,
    title: `Title ${slug}`,
    slug,
    excerpt: `Excerpt ${slug}`,
    thumbnailUrl: `/${slug}.jpg`,
    imageAlt: `Image ${slug}`,
    publishedAt: '2026-07-25T00:00:00.000Z',
    viewCount,
    category: { name: 'Thị trường', slug: 'thi-truong' },
    author: {
      name: 'MyFuture News',
      slug: 'myfuture-news',
      authorType: 'organization',
    },
  };
}

function meta(
  page: number,
  totalPages: number,
): PaginationMeta {
  return {
    page,
    limit: 10,
    totalItems: totalPages * 10,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

test('editorial UI: overview page parser accepts only positive integers', () => {
  assert.equal(parseOverviewPage(undefined), 1);
  assert.equal(parseOverviewPage('invalid'), 1);
  assert.equal(parseOverviewPage('0'), 1);
  assert.equal(parseOverviewPage('-2'), 1);
  assert.equal(parseOverviewPage('2.5'), 1);
  assert.equal(parseOverviewPage(['3', '8']), 3);
});

test('editorial UI: overview redirects requests beyond available metadata', () => {
  assert.equal(resolveOverviewPageRedirect(4, meta(4, 3)), '/ban-tin?page=3');
  assert.equal(resolveOverviewPageRedirect(2, meta(2, 1)), '/ban-tin');
  assert.equal(resolveOverviewPageRedirect(2, meta(2, 0)), '/ban-tin');
  assert.equal(resolveOverviewPageRedirect(1, meta(1, 0)), null);
  assert.equal(resolveOverviewPageRedirect(2, meta(2, 3)), null);
});

test('editorial UI: overview labels selected positive-view stories as popular', () => {
  const selected = selectPopularStories(
    [article('popular-a', 14), article('popular-b')],
    [article('latest-a')],
    [article('hero-a')],
  );

  assert.equal(selected.title, 'Đọc nhiều');
  assert.deepEqual(
    selected.articles.map(({ slug }) => slug),
    ['popular-a', 'popular-b'],
  );
});

test('editorial UI: overview uses unique non-hero latest stories for zero-view fallback', () => {
  const selected = selectPopularStories(
    [article('seed-a'), article('seed-b')],
    [
      article('hero-a'),
      article('latest-a'),
      article('latest-a'),
      article('hero-b'),
      article('latest-b'),
      article('latest-c'),
      article('latest-d'),
      article('latest-e'),
      article('latest-f'),
    ],
    [article('hero-a'), article('hero-b')],
  );

  assert.equal(selected.title, 'Đáng chú ý');
  assert.deepEqual(
    selected.articles.map(({ slug }) => slug),
    ['latest-a', 'latest-b', 'latest-c', 'latest-d', 'latest-e'],
  );
});

test('editorial UI: featured news renders coherent sparse hero markup', async () => {
  const runtimeRequire = createRequire(import.meta.url);
  runtimeRequire.extensions['.css'] = (module) => {
    const styles = new Proxy(
      {},
      { get: (_target, property) => String(property) },
    );
    module.exports = { __esModule: true, default: styles };
  };
  (globalThis as typeof globalThis & { React: typeof React }).React = React;

  const featuredModule = runtimeRequire(
    '../components/news/FeaturedNews.tsx',
  ) as typeof import('../components/news/FeaturedNews');

  for (const articles of [
    [article('lead')],
    [article('lead'), article('support')],
  ]) {
    const html = renderToStaticMarkup(
      React.createElement(featuredModule.FeaturedNews, { articles }),
    );

    assert.match(html, /<h2[^>]*>Tin nổi bật<\/h2>/);
    assert.equal((html.match(/<article\b/g) ?? []).length, articles.length);
  }
});
