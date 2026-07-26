import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { assertSeedSnapshot } from './lib/seed-invariants';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: {
      slug: true,
      _count: {
        select: {
          articles: { where: { isPublished: true } },
        },
      },
    },
  });
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    select: {
      slug: true,
      sourceUrl: true,
      isFeatured: true,
      category: { select: { slug: true } },
    },
  });
  const overviewCategoryCount = await prisma.category.count({
    where: {
      OR: [
        { slug: { in: ['overview', 'toan-canh'] } },
        { name: { in: ['Overview', 'Toàn cảnh'] } },
      ],
    },
  });

  assertSeedSnapshot({
    categories: categories.map((category) => ({
      slug: category.slug,
      publishedArticleCount: category._count.articles,
    })),
    articles: articles.map((article) => ({
      slug: article.slug,
      sourceUrl: article.sourceUrl,
      isFeatured: article.isFeatured,
      categorySlug: article.category.slug,
    })),
    overviewCategoryCount,
  });

  console.log(
    JSON.stringify({
      categories: categories.length,
      publishedArticles: articles.length,
      featuredArticles: articles.filter((article) => article.isFeatured).length,
      status: 'ok',
    }),
  );
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
