export type NewsCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  articleCount: number;
};

export type ArticleCategory = Pick<NewsCategory, 'name' | 'slug'>;

export type ArticleListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  category: ArticleCategory;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ArticleListResponse = {
  data: ArticleListItem[];
  meta: PaginationMeta;
};

export type ArticleDetail = ArticleListItem & {
  contentHtml: string;
  coverImageUrl: string | null;
  readingTime: number | null;
  sourceName: string | null;
  sourceUrl: string | null;
  isFeatured: boolean;
  category: ArticleCategory;
  relatedArticles: ArticleListItem[];
  previousArticle: ArticleListItem | null;
  nextArticle: ArticleListItem | null;
};

export type ArticleDetailResponse = {
  data: ArticleDetail;
};

export type ArticleQuery = {
  category?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
  sort?: 'newest' | 'oldest' | 'popular';
};
