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
  if (snapshot.categories.length !== 6) {
    throw new Error('Seed must contain exactly 6 categories');
  }
  if (snapshot.articles.length !== 30) {
    throw new Error('Seed must contain exactly 30 published articles');
  }
  if (snapshot.overviewCategoryCount !== 0) {
    throw new Error('Overview must not be stored as a category');
  }
  if (
    snapshot.categories.some(
      (category) => category.publishedArticleCount !== 5,
    )
  ) {
    throw new Error('Each category must contain 5 published articles');
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
  if (snapshot.articles.filter((article) => article.isFeatured).length !== 5) {
    throw new Error('Seed must contain exactly 5 featured articles');
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
