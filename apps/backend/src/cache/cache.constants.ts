export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const CACHE_TTL_SECONDS = {
  categories: 30 * 60,
  articleList: 10 * 60,
  articleDetail: 15 * 60,
} as const;
