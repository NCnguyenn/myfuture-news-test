import type {
  ArticleDetailResponse,
  ArticleListResponse,
  ArticleQuery,
  NewsCategory,
} from '../types/news';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4000/api';

export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

type ErrorBody = { message?: string; code?: string };
type RequestOptions = { signal?: AbortSignal };

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
    signal: options.signal,
  });

  if (!response.ok) {
    let errorBody: ErrorBody = {};
    try {
      errorBody = (await response.json()) as ErrorBody;
    } catch {
      errorBody = {};
    }
    throw new ApiClientError(
      response.status,
      errorBody.message ?? `News API request failed with status ${response.status}`,
      errorBody.code,
    );
  }

  return (await response.json()) as T;
}

export function getCategories(): Promise<{ data: NewsCategory[] }> {
  return request<{ data: NewsCategory[] }>('/categories');
}

export function getArticles(
  query: ArticleQuery = {},
  options: RequestOptions = {},
): Promise<ArticleListResponse> {
  const search = new URLSearchParams();
  if (query.q) search.set('q', query.q);
  if (query.category) search.set('category', query.category);
  if (query.page !== undefined) search.set('page', String(query.page));
  if (query.limit !== undefined) search.set('limit', String(query.limit));
  if (query.featured !== undefined) search.set('featured', String(query.featured));
  if (query.sort) search.set('sort', query.sort);
  const queryString = search.toString();
  return request<ArticleListResponse>(
    `/articles${queryString ? `?${queryString}` : ''}`,
    options,
  );
}

export function getArticleBySlug(slug: string): Promise<ArticleDetailResponse> {
  return request<ArticleDetailResponse>(`/articles/${encodeURIComponent(slug)}`);
}

export function isNotFoundError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError && error.status === 404;
}
