/**
 * Official 30-article import for MyFuture News.
 *
 * Usage:
 *   npx tsx scripts/import-official-news.ts [--dry-run]
 *   npm run import:official-news
 *   npm run import:official-news:dry-run
 *
 * Safety:
 * - Only runs against localhost / 127.0.0.1 DATABASE_URL
 * - Backs up before destructive ops
 * - Never FLUSHALL Redis; deletes only news:* keys
 * - Idempotent upserts by slug
 */
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { PrismaClient, type Prisma } from '@prisma/client';
import {
  CATEGORY_META,
  loadOfficialArticles,
  OFFICIAL_CATEGORY_ORDER,
  type OfficialArticleSeed,
} from './lib/official-news-data';

const DEMO_SLUG_RE =
  /^(phap-ly-du-an|quy-hoach-ha-tang|lai-suat-tai-chinh|thi-truong-gia-ca|dau-tu-dong-tien|cho-thue)-bai-\d+$/;

const DEMO_CONTENT_MARKERS = [
  'Nội dung demo',
  'Bài viết mẫu',
  'Nội dung minh họa',
  'example.com',
];

type ExistingArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  thumbnailUrl: string;
  isPublished: boolean;
  category: { slug: string };
};

function workspaceRoot(): string {
  const candidates = [
    path.resolve(import.meta.dirname, '..'),
    path.resolve(process.cwd()),
  ];
  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, 'prisma/schema.prisma'))) {
      return candidate;
    }
  }
  return path.resolve(import.meta.dirname, '..');
}

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function resolveEnv(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dotenv = require('dotenv') as { config: (opts?: { path?: string }) => void };
    const root = workspaceRoot();
    dotenv.config({ path: path.join(root, '.env') });
    dotenv.config({ path: path.join(root, 'apps/api/.env') });
  } catch {
    // dotenv optional
  }
  const root = workspaceRoot();
  loadEnvFile(path.join(root, '.env'));
  loadEnvFile(path.join(root, 'apps/api/.env'));
}

function maskSecret(value: string): string {
  return value
    .replace(/(postgres(?:ql)?:\/\/[^:]+:)([^@]+)(@)/gi, '$1***$3')
    .replace(/(redis:\/\/:)([^@]+)(@)/gi, '$1***$3')
    .replace(/(password=)([^&\s]+)/gi, '$1***');
}

function parseDatabaseUrl(url: string): {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
} {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port || '5432',
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
  };
}

function assertLocalDatabase(databaseUrl: string): void {
  let host: string;
  try {
    host = new URL(databaseUrl).hostname;
  } catch {
    throw new Error(`Invalid DATABASE_URL: ${maskSecret(databaseUrl)}`);
  }
  if (host !== 'localhost' && host !== '127.0.0.1') {
    throw new Error(
      `Refusing to run import against non-local database host "${host}". Only localhost/127.0.0.1 allowed.`,
    );
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function isDemoArticle(
  article: ExistingArticle,
  officialSlugs: Set<string>,
): boolean {
  if (officialSlugs.has(article.slug)) {
    return false;
  }

  if (DEMO_SLUG_RE.test(article.slug)) return true;
  if (article.slug.endsWith('-draft-unpublished')) return true;
  if (article.slug.includes('draft-unpublished')) return true;

  const searchable = [article.contentHtml, article.title, article.excerpt]
    .filter(Boolean)
    .join('\n');
  for (const marker of DEMO_CONTENT_MARKERS) {
    if (searchable.includes(marker)) return true;
  }

  if (!article.title?.trim() || !article.slug?.trim()) return true;
  if (!article.excerpt?.trim() || !article.contentHtml?.trim()) return true;
  if (!article.thumbnailUrl?.trim()) return true;

  const plain = stripHtml(article.contentHtml);
  if (plain.length < 80 && !officialSlugs.has(article.slug)) return true;

  return false;
}

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
  // Intentionally omit viewCount so re-import preserves existing counts.
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

async function backupDatabase(
  prisma: PrismaClient,
  databaseUrl: string,
  root: string,
): Promise<string> {
  const backupsDir = path.join(root, 'backups');
  mkdirSync(backupsDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dumpPath = path.join(backupsDir, `pre-import-${stamp}.sql`);
  const jsonPath = path.join(backupsDir, `pre-import-${stamp}.json`);

  try {
    const db = parseDatabaseUrl(databaseUrl);
    execFileSync(
      'pg_dump',
      [
        '-h',
        db.host,
        '-p',
        db.port,
        '-U',
        db.user,
        '-d',
        db.database,
        '-f',
        dumpPath,
        '--no-owner',
        '--no-acl',
      ],
      {
        env: { ...process.env, PGPASSWORD: db.password },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    console.log(`Backup (pg_dump): ${dumpPath}`);
    return dumpPath;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`pg_dump unavailable or failed (${message}); writing JSON backup.`);
  }

  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  const articles = await prisma.article.findMany({ orderBy: { publishedAt: 'desc' } });
  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        categories,
        articles,
      },
      null,
      2,
    ),
    'utf8',
  );
  console.log(`Backup (JSON): ${jsonPath}`);
  return jsonPath;
}

async function invalidateNewsCache(): Promise<number> {
  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Redis = require('ioredis') as typeof import('ioredis').default;
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    try {
      await client.connect();
      let cursor = '0';
      let deleted = 0;
      do {
        const [nextCursor, keys] = await client.scan(
          cursor,
          'MATCH',
          'news:*',
          'COUNT',
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          deleted += await client.del(...keys);
        }
      } while (cursor !== '0');
      return deleted;
    } finally {
      client.disconnect();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Redis invalidation skipped (graceful): ${message}`);
    return 0;
  }
}

function printCategoryCounts(
  label: string,
  rows: Array<{ slug: string; published: number; total: number }>,
): void {
  console.log(label);
  for (const row of rows) {
    console.log(`  ${row.slug}: published=${row.published} total=${row.total}`);
  }
}

async function categoryCounts(
  prisma: PrismaClient,
): Promise<Array<{ slug: string; published: number; total: number }>> {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: {
      slug: true,
      articles: { select: { isPublished: true } },
    },
  });
  return categories.map((c) => ({
    slug: c.slug,
    total: c.articles.length,
    published: c.articles.filter((a) => a.isPublished).length,
  }));
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const root = workspaceRoot();
  resolveEnv();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env for local development.',
    );
  }

  console.log(`Mode: ${dryRun ? 'DRY-RUN' : 'EXECUTE'}`);
  console.log(`DATABASE_URL: ${maskSecret(databaseUrl)}`);
  assertLocalDatabase(databaseUrl);

  const officialArticles = loadOfficialArticles();
  const officialSlugs = new Set(officialArticles.map((a) => a.slug));
  console.log(
    `Loaded ${officialArticles.length} official articles across ${OFFICIAL_CATEGORY_ORDER.length} categories.`,
  );

  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });

  try {
    const existing = await prisma.article.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        contentHtml: true,
        thumbnailUrl: true,
        isPublished: true,
        category: { select: { slug: true } },
      },
    });

    const hardDelete = existing.filter((a) => isDemoArticle(a, officialSlugs));
    const hardDeleteSlugs = new Set(hardDelete.map((a) => a.slug));
    const unpublish = existing.filter(
      (a) =>
        !officialSlugs.has(a.slug) &&
        !hardDeleteSlugs.has(a.slug) &&
        a.isPublished,
    );

    const total = existing.length;
    const published = existing.filter((a) => a.isPublished).length;
    const beforeCounts = await categoryCounts(prisma);

    console.log('--- Audit report ---');
    console.log(`Current total articles: ${total}`);
    console.log(`Current published articles: ${published}`);
    console.log(`Hard-delete (demo/empty) count: ${hardDelete.length}`);
    console.log(
      `Hard-delete slugs: ${
        hardDelete.map((a) => a.slug).join(', ') || '(none)'
      }`,
    );
    console.log(`Unpublish (legacy valid) count: ${unpublish.length}`);
    console.log(
      `Unpublish slugs: ${
        unpublish.map((a) => a.slug).join(', ') || '(none)'
      }`,
    );
    console.log(`Upsert official count: ${officialArticles.length}`);
    console.log(
      `Upsert official slugs: ${officialArticles.map((a) => a.slug).join(', ')}`,
    );
    printCategoryCounts('Per-category BEFORE:', beforeCounts);

    const projectedPublishedByCategory = new Map<string, number>();
    for (const slug of OFFICIAL_CATEGORY_ORDER) {
      projectedPublishedByCategory.set(slug, 0);
    }
    for (const article of officialArticles) {
      projectedPublishedByCategory.set(
        article.categorySlug,
        (projectedPublishedByCategory.get(article.categorySlug) ?? 0) + 1,
      );
    }
    console.log('Per-category AFTER (projected published official):');
    for (const slug of OFFICIAL_CATEGORY_ORDER) {
      console.log(
        `  ${slug}: published=${projectedPublishedByCategory.get(slug) ?? 0}`,
      );
    }

    if (dryRun) {
      console.log('Dry-run complete. No database changes were made.');
      return;
    }

    const backupPath = await backupDatabase(prisma, databaseUrl, root);
    console.log(`Backup stored at: ${backupPath}`);

    await prisma.$transaction(async (tx) => {
      const categoryIdBySlug = new Map<string, string>();

      for (const slug of OFFICIAL_CATEGORY_ORDER) {
        const meta = CATEGORY_META[slug];
        const row = await tx.category.upsert({
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

      if (hardDelete.length > 0) {
        await tx.article.deleteMany({
          where: { id: { in: hardDelete.map((a) => a.id) } },
        });
      }

      if (unpublish.length > 0) {
        await tx.article.updateMany({
          where: { id: { in: unpublish.map((a) => a.id) } },
          data: { isPublished: false, isFeatured: false },
        });
      }

      for (const article of officialArticles) {
        const categoryId = categoryIdBySlug.get(article.categorySlug);
        if (!categoryId) {
          throw new Error(`Missing category id for ${article.categorySlug}`);
        }
        await tx.article.upsert({
          where: { slug: article.slug },
          create: articleCreateData(article, categoryId),
          update: articleUpdateData(article, categoryId),
        });
      }
    });

    const deletedCacheKeys = await invalidateNewsCache();
    const afterTotal = await prisma.article.count();
    const afterPublished = await prisma.article.count({
      where: { isPublished: true },
    });
    const afterFeatured = await prisma.article.count({
      where: { isPublished: true, isFeatured: true },
    });
    const afterCounts = await categoryCounts(prisma);

    console.log('--- Import summary ---');
    console.log(`Hard-deleted: ${hardDelete.length}`);
    console.log(`Unpublished: ${unpublish.length}`);
    console.log(`Upserted official: ${officialArticles.length}`);
    console.log(`Articles total now: ${afterTotal}`);
    console.log(`Published now: ${afterPublished}`);
    console.log(`Featured published now: ${afterFeatured}`);
    console.log(`Redis news:* keys deleted: ${deletedCacheKeys}`);
    printCategoryCounts('Per-category AFTER:', afterCounts);
    console.log('Import completed successfully.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
