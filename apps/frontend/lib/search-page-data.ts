import { ApiClientError } from './api-client';
import { parseOverviewPage, resolvePageRedirect } from './news-overview';
import type { ArticleListResponse } from '../types/news';

export const SEARCH_PAGE_SIZE = 10;
export const SEARCH_RESULTS_PATH = '/ban-tin/tim-kiem';
const SEARCH_UNAVAILABLE_MESSAGE =
  'Tìm kiếm đang tạm thời gián đoạn. Vui lòng thử lại.';

export type SearchQueryInvalidReason = 'empty' | 'too_short' | 'too_long';

export type NormalizedSearchQuery =
  | { ok: true; query: string }
  | { ok: false; query: string; reason: SearchQueryInvalidReason };

export type SearchPageLoadResult =
  | {
      status: 'invalid';
      query: string;
      reason: SearchQueryInvalidReason;
      page: number;
    }
  | {
      status: 'error';
      query: string;
      page: number;
      message: string;
      code?: string;
    }
  | {
      status: 'success';
      query: string;
      page: number;
      response: ArticleListResponse;
    }
  | {
      status: 'redirect';
      to: string;
    };

type SearchPageDependencies = {
  loadArticles: (input: {
    q: string;
    page: number;
    limit: number;
  }) => Promise<ArticleListResponse>;
};

export function firstSearchParam(
  value: string | string[] | undefined,
): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export function normalizeSearchQuery(raw: string): NormalizedSearchQuery {
  const query = raw.trim();
  if (!query) {
    return { ok: false, query, reason: 'empty' };
  }
  if (query.length < 2) {
    return { ok: false, query, reason: 'too_short' };
  }
  if (query.length > 100) {
    return { ok: false, query, reason: 'too_long' };
  }
  return { ok: true, query };
}

export function parseSearchPage(
  value: string | string[] | undefined,
): number {
  return parseOverviewPage(value);
}

export async function loadSearchPageData(
  input: {
    q?: string | string[];
    page?: string | string[];
  },
  { loadArticles }: SearchPageDependencies,
): Promise<SearchPageLoadResult> {
  const rawQuery = firstSearchParam(input.q);
  const normalized = normalizeSearchQuery(rawQuery);
  const page = parseSearchPage(input.page);

  if (!normalized.ok) {
    return {
      status: 'invalid',
      query: normalized.query,
      reason: normalized.reason,
      page,
    };
  }

  try {
    const response = await loadArticles({
      q: normalized.query,
      page,
      limit: SEARCH_PAGE_SIZE,
    });

    const redirectTo = resolvePageRedirect(
      page,
      response.meta,
      SEARCH_RESULTS_PATH,
      { q: normalized.query },
    );
    if (redirectTo) {
      return { status: 'redirect', to: redirectTo };
    }

    return {
      status: 'success',
      query: normalized.query,
      page,
      response,
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return {
        status: 'error',
        query: normalized.query,
        page,
        message: SEARCH_UNAVAILABLE_MESSAGE,
        code: error.code,
      };
    }
    return {
      status: 'error',
      query: normalized.query,
      page,
      message: SEARCH_UNAVAILABLE_MESSAGE,
      code: 'SEARCH_UNAVAILABLE',
    };
  }
}
