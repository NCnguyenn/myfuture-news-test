import { unstable_cache } from 'next/cache';
import type {
  ArticleDetailResponse,
  ArticleListResponse,
  ArticleQuery,
  NewsCategory,
} from '../types/news';
import {
  NEWS_CACHE_SECONDS,
  NEWS_REQUEST_TIMEOUT_MS,
} from './news-config';

export function resolveApiBaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const configured = env.API_BASE_URL?.trim().replace(/\/+$/, '');
  if (configured) return configured;
  if (env.NODE_ENV === 'production') {
    throw new Error('API_BASE_URL is required in production');
  }
  return 'http://localhost:4000/api';
}

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
type NewsRead = (path: string, options?: RequestOptions) => Promise<unknown>;
type CacheFactory = (
  reader: NewsRead,
  keyParts?: string[],
  options?: { revalidate?: number | false; tags?: string[] },
) => NewsRead;
type NewsApiReaderDependencies = {
  fetchImpl?: typeof fetch;
  cache?: CacheFactory;
  resolveBaseUrl?: () => string;
  timeoutSignal?: (delay: number) => AbortSignal;
};

export function createNewsApiReader({
  fetchImpl = fetch,
  cache = unstable_cache,
  resolveBaseUrl = resolveApiBaseUrl,
  timeoutSignal = AbortSignal.timeout,
}: NewsApiReaderDependencies = {}) {
  async function requestUncached(
    path: string,
    options: RequestOptions = {},
  ): Promise<unknown> {
    const timeout = timeoutSignal(NEWS_REQUEST_TIMEOUT_MS);
    const signal = options.signal
      ? AbortSignal.any([options.signal, timeout])
      : timeout;
    const response = await fetchImpl(`${resolveBaseUrl()}${path}`, {
      cache: 'no-store',
      signal,
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
        errorBody.message ??
          `News API request failed with status ${response.status}`,
        errorBody.code,
      );
    }

    return response.json();
  }

  const requestCached = cache(
    requestUncached,
    ['news-api-read'],
    { revalidate: NEWS_CACHE_SECONDS },
  );

  return async function request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    if (options.signal) {
      return (await requestUncached(path, options)) as T;
    }
    return (await requestCached(path)) as T;
  };
}

const request = createNewsApiReader();

export function getCategories(): Promise<{ data: NewsCategory[] }> {
  return request<{ data: NewsCategory[] }>('/categories');
}

export function buildArticlesPath(query: ArticleQuery = {}): string {
  const search = new URLSearchParams();
  if (query.q) search.set('q', query.q);
  if (query.category) search.set('category', query.category);
  if (query.page !== undefined) search.set('page', String(query.page));
  if (query.limit !== undefined) search.set('limit', String(query.limit));
  if (query.featured !== undefined) search.set('featured', String(query.featured));
  if (query.sort) search.set('sort', query.sort);
  const queryString = search.toString();
  return `/articles${queryString ? `?${queryString}` : ''}`;
}

export function getArticles(
  query: ArticleQuery = {},
  options: RequestOptions = {},
): Promise<ArticleListResponse> {
  return request<ArticleListResponse>(
    buildArticlesPath(query),
    options,
  );
}

export function getArticleBySlug(slug: string): Promise<ArticleDetailResponse> {
  return request<ArticleDetailResponse>(`/articles/${encodeURIComponent(slug)}`);
}

export function isNotFoundError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError && error.status === 404;
}
