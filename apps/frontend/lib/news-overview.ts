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

export function resolvePageRedirect(
  requestedPage: number,
  meta: Pick<PaginationMeta, 'totalPages'>,
  basePath: string,
  query: Record<string, string> = {},
): string | null {
  if (requestedPage <= meta.totalPages || requestedPage === 1) return null;

  const search = new URLSearchParams(query);
  if (meta.totalPages > 1) {
    search.set('page', String(meta.totalPages));
  } else {
    search.delete('page');
  }
  const queryString = search.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
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
