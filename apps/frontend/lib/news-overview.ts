import type {
  ArticleListItem,
  PaginationMeta,
} from '../types/news';

const POPULAR_STORY_LIMIT = 5;

export type PopularStorySelection = {
  articles: ArticleListItem[];
  title: 'Đọc nhiều' | 'Đáng chú ý';
};

export function parseOverviewPage(
  value: string | string[] | undefined,
): number {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function resolveOverviewPageRedirect(
  requestedPage: number,
  meta: Pick<PaginationMeta, 'totalPages'>,
): string | null {
  if (requestedPage <= meta.totalPages || requestedPage === 1) return null;

  return meta.totalPages > 1
    ? `/ban-tin?page=${meta.totalPages}`
    : '/ban-tin';
}

function uniqueBySlug(articles: ArticleListItem[]): ArticleListItem[] {
  const seen = new Set<string>();

  return articles.filter((article) => {
    if (seen.has(article.slug)) return false;
    seen.add(article.slug);
    return true;
  });
}

export function selectPopularStories(
  popularArticles: ArticleListItem[],
  latestArticles: ArticleListItem[],
  featuredArticles: ArticleListItem[],
): PopularStorySelection {
  const featuredSlugs = new Set(
    featuredArticles.map((article) => article.slug),
  );
  const popularSelection = uniqueBySlug(popularArticles)
    .filter((article) => !featuredSlugs.has(article.slug))
    .slice(0, POPULAR_STORY_LIMIT);

  if (
    popularSelection.some(
      (article) => (article.viewCount ?? 0) > 0,
    )
  ) {
    return { articles: popularSelection, title: 'Đọc nhiều' };
  }

  const fallbackArticles = uniqueBySlug(latestArticles)
    .filter((article) => !featuredSlugs.has(article.slug))
    .slice(0, POPULAR_STORY_LIMIT);

  return { articles: fallbackArticles, title: 'Đáng chú ý' };
}
