import type {
  ArticleDetail,
  ArticleListResponse,
  NewsCategory,
} from '../types/news';

type ArticlePageDataDependencies = {
  loadArticle: () => Promise<ArticleDetail>;
  loadCategories: () => Promise<{ data: NewsCategory[] }>;
  loadPopular: () => Promise<ArticleListResponse>;
};

export type ArticlePageData = {
  article: ArticleDetail;
  categoriesResponse: { data: NewsCategory[] };
  popularResponse: ArticleListResponse;
};

const EMPTY_POPULAR_RESPONSE: ArticleListResponse = {
  data: [],
  meta: {
    page: 1,
    limit: 0,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

export async function loadArticlePageData({
  loadArticle,
  loadCategories,
  loadPopular,
}: ArticlePageDataDependencies): Promise<ArticlePageData> {
  const article = await loadArticle();
  const [categoriesResponse, popularResponse] = await Promise.all([
    loadCategories(),
    loadPopular().catch(() => EMPTY_POPULAR_RESPONSE),
  ]);

  return { article, categoriesResponse, popularResponse };
}
