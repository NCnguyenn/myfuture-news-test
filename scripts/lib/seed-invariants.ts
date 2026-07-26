import {
  EXPECTED_ARTICLE_COUNTS,
  EXPECTED_FEATURED_ARTICLES,
  EXPECTED_PUBLISHED_ARTICLES,
} from './news-dataset-contract';

export type SeedSnapshot = {
  categories: Array<{
    slug: string;
    publishedArticleCount: number;
  }>;
  articles: Array<{
    slug: string;
    sourceUrl: string | null;
    isFeatured: boolean;
    categorySlug: string;
  }>;
  overviewCategoryCount: number;
};

function uniqueCount(values: string[]): number {
  return new Set(values).size;
}

export function assertSeedSnapshot(snapshot: SeedSnapshot): void {
  if (snapshot.categories.length !== Object.keys(EXPECTED_ARTICLE_COUNTS).length) {
    throw new Error('Seed must contain exactly 6 categories');
  }
  if (snapshot.articles.length !== EXPECTED_PUBLISHED_ARTICLES) {
    throw new Error(
      `Seed must contain exactly ${EXPECTED_PUBLISHED_ARTICLES} published articles`,
    );
  }
  if (snapshot.overviewCategoryCount !== 0) {
    throw new Error('Overview must not be stored as a category');
  }
  for (const [slug, expectedCount] of Object.entries(EXPECTED_ARTICLE_COUNTS)) {
    const category = snapshot.categories.find(
      (candidate) => candidate.slug === slug,
    );
    if (!category || category.publishedArticleCount !== expectedCount) {
      throw new Error(
        `Category ${slug} must contain exactly ${expectedCount} published articles`,
      );
    }
  }
  const slugs = snapshot.articles.map((article) => article.slug);
  if (uniqueCount(slugs) !== slugs.length) {
    throw new Error('Seed must contain unique article slugs');
  }
  const sourceUrls = snapshot.articles.map((article) => article.sourceUrl);
  if (
    sourceUrls.some((value) => !value) ||
    uniqueCount(sourceUrls as string[]) !== sourceUrls.length
  ) {
    throw new Error('Seed must contain unique non-empty source URLs');
  }
  if (
    snapshot.articles.filter((article) => article.isFeatured).length !==
    EXPECTED_FEATURED_ARTICLES
  ) {
    throw new Error(
      `Seed must contain exactly ${EXPECTED_FEATURED_ARTICLES} featured articles`,
    );
  }
  const categorySlugs = new Set(
    snapshot.categories.map((category) => category.slug),
  );
  if (
    snapshot.articles.some(
      (article) => !categorySlugs.has(article.categorySlug),
    )
  ) {
    throw new Error('Every article must reference a known category');
  }
}
