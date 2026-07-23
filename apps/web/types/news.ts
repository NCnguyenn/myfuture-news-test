export type NewsCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  articleCount: number;
};

export type ArticleCategory = Pick<NewsCategory, 'name' | 'slug'>;

export type ArticleAuthor = {
  name: string;
  slug: string;
  authorType: 'person' | 'organization';
  verificationNote: string;
};

export type ArticleEvidence = {
  claim: string;
  sourceUrl: string;
  evidenceNote: string;
};

export type ImageProvenance = {
  localPath: string;
  originalImageUrl: string | null;
  sourcePageUrl: string;
  credit: string | null;
  isPlaceholder: boolean;
};

export type ArticleListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl: string;
  imageAlt: string;
  publishedAt: string;
  viewCount?: number;
  category: ArticleCategory;
  author: Pick<ArticleAuthor, 'name' | 'slug' | 'authorType'>;
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
  author: ArticleAuthor;
  evidence: ArticleEvidence[];
  imageProvenance: ImageProvenance;
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
