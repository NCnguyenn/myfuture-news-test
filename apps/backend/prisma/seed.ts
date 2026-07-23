import { PrismaClient, type Prisma } from '@prisma/client';
import {
  CATEGORY_META,
  loadOfficialArticles,
  OFFICIAL_CATEGORY_ORDER,
  type OfficialArticleSeed,
} from '../../../scripts/lib/official-news-data';

const prisma = new PrismaClient();

function articleCreateData(
  article: OfficialArticleSeed,
  categoryId: string,
): Prisma.ArticleCreateInput {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    contentHtml: article.contentHtml,
    thumbnailUrl: article.thumbnailUrl,
    coverImageUrl: article.coverImageUrl,
    publishedAt: article.publishedAt,
    isPublished: true,
    isFeatured: article.isFeatured,
    viewCount: 0,
    readingTime: article.readingTime,
    sourceName: article.sourceName,
    sourceUrl: article.sourceUrl,
    imageAlt: article.imageAlt,
    imageCredit: article.imageCredit,
    originalImageUrl: article.originalImageUrl,
    imageSourcePageUrl: article.imageSourcePageUrl,
    imageIsPlaceholder: article.imageIsPlaceholder,
    authorName: article.authorName,
    authorSlug: article.authorSlug,
    authorType: article.authorType,
    authorVerificationNote: article.authorVerificationNote,
    dateModified: article.dateModified,
    tags: article.tags as Prisma.InputJsonValue,
    evidence: article.evidence as Prisma.InputJsonValue,
    verification: (article.verification ?? undefined) as
      | Prisma.InputJsonValue
      | undefined,
    category: { connect: { id: categoryId } },
  };
}

function articleUpdateData(
  article: OfficialArticleSeed,
  categoryId: string,
): Prisma.ArticleUpdateInput {
  // Preserve viewCount on re-seed.
  return {
    title: article.title,
    excerpt: article.excerpt,
    contentHtml: article.contentHtml,
    thumbnailUrl: article.thumbnailUrl,
    coverImageUrl: article.coverImageUrl,
    publishedAt: article.publishedAt,
    isPublished: true,
    isFeatured: article.isFeatured,
    readingTime: article.readingTime,
    sourceName: article.sourceName,
    sourceUrl: article.sourceUrl,
    imageAlt: article.imageAlt,
    imageCredit: article.imageCredit,
    originalImageUrl: article.originalImageUrl,
    imageSourcePageUrl: article.imageSourcePageUrl,
    imageIsPlaceholder: article.imageIsPlaceholder,
    authorName: article.authorName,
    authorSlug: article.authorSlug,
    authorType: article.authorType,
    authorVerificationNote: article.authorVerificationNote,
    dateModified: article.dateModified,
    tags: article.tags as Prisma.InputJsonValue,
    evidence: article.evidence as Prisma.InputJsonValue,
    verification: (article.verification ?? undefined) as
      | Prisma.InputJsonValue
      | undefined,
    category: { connect: { id: categoryId } },
  };
}

async function main() {
  console.log('Seeding official categories (upsert by slug)...');

  const categoryIdBySlug = new Map<string, string>();

  for (const slug of OFFICIAL_CATEGORY_ORDER) {
    const meta = CATEGORY_META[slug];
    const row = await prisma.category.upsert({
      where: { slug },
      create: {
        name: meta.name,
        slug,
        description: meta.description,
        sortOrder: meta.sortOrder,
        isActive: true,
      },
      update: {
        name: meta.name,
        description: meta.description,
        sortOrder: meta.sortOrder,
        isActive: true,
      },
    });
    categoryIdBySlug.set(slug, row.id);
  }

  const articles = loadOfficialArticles();
  console.log(`Seeding ${articles.length} official articles (upsert by slug)...`);

  for (const article of articles) {
    const categoryId = categoryIdBySlug.get(article.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category for slug: ${article.categorySlug}`);
    }

    await prisma.article.upsert({
      where: { slug: article.slug },
      create: articleCreateData(article, categoryId),
      update: articleUpdateData(article, categoryId),
    });
  }

  const categoryCount = await prisma.category.count();
  const articleCount = await prisma.article.count();
  const publishedCount = await prisma.article.count({ where: { isPublished: true } });
  const featuredCount = await prisma.article.count({
    where: { isFeatured: true, isPublished: true },
  });

  const perCategory = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: {
      slug: true,
      name: true,
      _count: {
        select: {
          articles: { where: { isPublished: true } },
        },
      },
    },
  });

  console.log('--- Seed summary ---');
  console.log(`Categories: ${categoryCount} (expected 6)`);
  console.log(`Articles total: ${articleCount}`);
  console.log(`Published: ${publishedCount}`);
  console.log(`Featured (published): ${featuredCount}`);
  for (const c of perCategory) {
    console.log(`  ${c.slug}: ${c._count.articles} published articles`);
  }
  console.log('Seed completed (official researched articles only).');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
