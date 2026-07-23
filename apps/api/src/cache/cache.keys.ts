import { ArticleSort } from '../articles/articles-query.dto';

export type ArticleListCacheKeyInput = {
  category?: string;
  page: number;
  limit: number;
  featured?: boolean;
  sort: ArticleSort;
};

export function categoriesCacheKey(): string {
  return 'news:categories';
}

export function articleListCacheKey(input: ArticleListCacheKeyInput): string {
  const category = input.category || 'all';
  const featured = input.featured === undefined ? 'any' : String(input.featured);
  return `news:articles:${category}:${input.page}:${input.limit}:${featured}:${input.sort}`;
}

export function articleDetailCacheKey(slug: string): string {
  return `news:article:${slug}`;
}
