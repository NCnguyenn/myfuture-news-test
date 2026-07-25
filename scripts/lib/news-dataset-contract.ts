export const EXPECTED_ARTICLE_COUNTS = {
  'thi-truong-gia-ca': 8,
  'quy-hoach-ha-tang': 8,
  'phap-ly-du-an': 7,
  'lai-suat-tai-chinh': 7,
  'dau-tu-dong-tien': 6,
  'cho-thue': 6,
} as const;

export type NewsDatasetCategorySlug = keyof typeof EXPECTED_ARTICLE_COUNTS;

export const EXPECTED_PUBLISHED_ARTICLES = Object.values(
  EXPECTED_ARTICLE_COUNTS,
).reduce((total, count) => total + count, 0);

export const EXPECTED_FEATURED_ARTICLES = 5;
