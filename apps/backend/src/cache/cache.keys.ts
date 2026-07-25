import { ArticleSort } from '../articles/articles-query.dto';

export type ArticleListCacheKeyInput = {
  category?: string;
  page: number;
  limit: number;
  featured?: boolean;
  sort: ArticleSort;
  q?: string;
};

export function categoriesCacheKey(): string {
  return 'news:categories';
}

export function articleListCacheKey(input: ArticleListCacheKeyInput): string {
  const category = input.category || 'all';
  const featured = input.featured === undefined ? 'any' : String(input.featured);
  const search = input.q ? `:q:${encodeURIComponent(input.q)}` : '';
  return `news:articles:${category}:${input.page}:${input.limit}:${featured}:${input.sort}${search}`;
}

export function articleDetailCacheKey(slug: string): string {
  return `news:article:${slug}`;
}
