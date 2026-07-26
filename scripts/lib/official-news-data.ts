import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { estimateReadingTimeMinutes, markdownToSafeHtml } from './markdown-to-html';
import {
  EXPECTED_ARTICLE_COUNTS,
  EXPECTED_FEATURED_ARTICLES,
  EXPECTED_PUBLISHED_ARTICLES,
} from './news-dataset-contract';

export const OFFICIAL_CATEGORY_ORDER = [
  'phap-ly-du-an',
  'quy-hoach-ha-tang',
  'lai-suat-tai-chinh',
  'thi-truong-gia-ca',
  'dau-tu-dong-tien',
  'cho-thue',
] as const;

export const CATEGORY_META: Record<
  (typeof OFFICIAL_CATEGORY_ORDER)[number],
  { name: string; description: string; sortOrder: number }
> = {
  'phap-ly-du-an': {
    name: 'Pháp lý dự án',
    description: 'Cập nhật pháp lý dự án và chính sách bất động sản.',
    sortOrder: 1,
  },
  'quy-hoach-ha-tang': {
    name: 'Quy hoạch hạ tầng',
    description: 'Quy hoạch, giao thông và hạ tầng liên vùng.',
    sortOrder: 2,
  },
  'lai-suat-tai-chinh': {
    name: 'Lãi suất tài chính',
    description: 'Lãi suất, tín dụng và chính sách tài chính.',
    sortOrder: 3,
  },
  'thi-truong-gia-ca': {
    name: 'Thị trường giá cả',
    description: 'Diễn biến thị trường, giá cả và nguồn cung.',
    sortOrder: 4,
  },
  'dau-tu-dong-tien': {
    name: 'Đầu tư dòng tiền',
    description: 'Đầu tư, FDI và dịch chuyển dòng vốn.',
    sortOrder: 5,
  },
  'cho-thue': {
    name: 'Cho thuê',
    description: 'Nhà ở, văn phòng và thị trường cho thuê.',
    sortOrder: 6,
  },
};

type RawAuthor = {
  name: string;
  slug: string;
  authorType: 'person' | 'organization';
  verified: boolean;
  verificationNote: string;
};

type RawSource = {
  sourceName: string;
  canonicalUrl: string;
  verified: boolean;
};

type RawEvidence = {
  claim: string;
  sourceUrl: string;
  evidenceNote: string;
  shortQuote?: string | null;
};

type RawArticle = {
  title: string;
  slug: string;
  excerpt: string;
  bodyMarkdown: string;
  categorySlug: string;
  datePublished: string;
  dateModified?: string | null;
  tags?: string[];
  author: RawAuthor;
  sources: RawSource[];
  evidence: RawEvidence[];
  imagePlan: { cover: { alt: string } };
  verification?: Record<string, unknown>;
};

type RawManifest = {
  categories: Array<{
    name: string;
    slug: string;
    articles: RawArticle[];
  }>;
};

type ImageRecord = {
  localPath: string;
  originalImageUrl: string | null;
  sourcePageUrl: string;
  credit: string | null;
  isPlaceholder: boolean;
};

const FEATURED_ARTICLE_SLUGS = new Set([
  'hung-yen-truc-bac-nam-89km-thanh-pho-truc-thuoc-trung-uong',
  'bac-ninh-do-thi-da-cuc-bon-hanh-lang-phat-trien-2075',
  'luat-phat-trien-do-thi-khu-kinh-te-dac-biet-2026',
  'gia-can-ho-neo-cao-nguoi-mua-chon-loc-2026',
  'quy-hoach-duong-bo-2050-bo-sung-nam-tuyen-cao-toc',
]);

export type OfficialArticleSeed = {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  thumbnailUrl: string;
  coverImageUrl: string;
  publishedAt: Date;
  dateModified: Date | null;
  isPublished: boolean;
  isFeatured: boolean;
  readingTime: number;
  sourceName: string;
  sourceUrl: string;
  imageAlt: string;
  imageCredit: string | null;
  originalImageUrl: string | null;
  imageSourcePageUrl: string;
  imageIsPlaceholder: boolean;
  authorName: string;
  authorSlug: string;
  authorType: string;
  authorVerificationNote: string;
  tags: string[];
  evidence: RawEvidence[];
  verification: Record<string, unknown> | null;
  categorySlug: string;
};

function findWorkspaceRoot(): string {
  const candidates = [
    path.resolve(import.meta.dirname, '../..'),
    path.resolve(process.cwd()),
    path.resolve(process.cwd(), '../..'),
  ];
  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, 'data/news/articles.json'))) {
      return candidate;
    }
  }
  throw new Error('Could not locate workspace root (data/news/articles.json missing)');
}

function isComplete(article: RawArticle): boolean {
  return Boolean(
    article.title &&
      article.slug &&
      article.excerpt &&
      article.bodyMarkdown &&
      article.categorySlug &&
      article.datePublished &&
      article.author?.verified &&
      article.author.verificationNote &&
      article.sources?.[0]?.verified &&
      article.sources[0].canonicalUrl &&
      article.evidence?.length,
  );
}

function rejectExampleComSources(article: RawArticle): void {
  for (const source of article.sources ?? []) {
    const url = source.canonicalUrl ?? '';
    if (/example\.com/i.test(url)) {
      throw new Error(
        `Rejected example.com source for article "${article.slug}": ${url}`,
      );
    }
  }
  for (const item of article.evidence ?? []) {
    if (/example\.com/i.test(item.sourceUrl ?? '')) {
      throw new Error(
        `Rejected example.com evidence URL for article "${article.slug}": ${item.sourceUrl}`,
      );
    }
  }
}

function webPathToPublicFile(workspaceRoot: string, webPath: string): string {
  if (!webPath.startsWith('/')) {
    throw new Error(`Image localPath must be a relative web path starting with /: ${webPath}`);
  }
  const publicRoot = path.resolve(workspaceRoot, 'apps/frontend/public');
  const filePath = path.resolve(publicRoot, webPath.replace(/^[/\\]+/, ''));
  const relativePath = path.relative(publicRoot, filePath);
  if (
    !relativePath ||
    relativePath.startsWith('..') ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error(
      `Image localPath escapes apps/frontend/public: ${webPath}`,
    );
  }
  return filePath;
}

function loadImageManifest(
  imageManifestPath: string,
): Record<string, ImageRecord> {
  if (!existsSync(imageManifestPath)) {
    throw new Error(`Image manifest not found: ${imageManifestPath}`);
  }
  return JSON.parse(
    readFileSync(imageManifestPath, 'utf8'),
  ) as Record<string, ImageRecord>;
}

function auditImages(
  workspaceRoot: string,
  imageManifest: Record<string, ImageRecord>,
  articleSlugs: string[],
): void {
  const expectedSlugs = [...articleSlugs].sort();
  const imageSlugs = Object.keys(imageManifest).sort();
  const missing = expectedSlugs.filter((slug) => !imageManifest[slug]);
  const extra = imageSlugs.filter((slug) => !articleSlugs.includes(slug));
  if (missing.length || extra.length) {
    throw new Error(
      `Article/image slug sets differ (missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'})`,
    );
  }

  const entries = articleSlugs.map((slug) => {
    const record = imageManifest[slug];
    if (!record.localPath?.startsWith('/images/news/')) {
      throw new Error(
        `Image localPath must be under /images/news/: ${slug} -> ${record.localPath}`,
      );
    }
    const filePath = webPathToPublicFile(workspaceRoot, record.localPath);
    if (!existsSync(filePath)) {
      throw new Error(`Image file missing on disk for ${slug}: ${filePath}`);
    }
    return record;
  });

  const placeholders = entries.filter((e) => e.isPlaceholder);

  if (entries.length !== EXPECTED_PUBLISHED_ARTICLES) {
    throw new Error(
      `Image audit expected ${EXPECTED_PUBLISHED_ARTICLES} mapped articles, got ${entries.length}`,
    );
  }

  for (const record of placeholders) {
    if (record.localPath !== '/images/news/placeholder-default.svg') {
      throw new Error(
        `Placeholder must use /images/news/placeholder-default.svg, got ${record.localPath}`,
      );
    }
  }
}

/**
 * Load, validate, and map the official Codex articles for DB import/seed.
 */
export function loadOfficialArticles(): OfficialArticleSeed[] {
  const workspaceRoot = findWorkspaceRoot();
  const articleManifestPath = path.join(
    workspaceRoot,
    'data/news/articles.json',
  );
  const imageManifestPath = path.join(
    workspaceRoot,
    'data/news/images.json',
  );
  const rawManifest = JSON.parse(
    readFileSync(articleManifestPath, 'utf8'),
  ) as RawManifest;
  const imageManifest = loadImageManifest(imageManifestPath);

  const expectedCategorySlugs = Object.keys(EXPECTED_ARTICLE_COUNTS);
  if (rawManifest.categories.length !== expectedCategorySlugs.length) {
    throw new Error(
      `Completeness gate failed: expected ${expectedCategorySlugs.length} categories, got ${rawManifest.categories.length}`,
    );
  }

  const categorySlugs = rawManifest.categories.map((c) => c.slug);
  if (new Set(categorySlugs).size !== expectedCategorySlugs.length) {
    throw new Error('Duplicate category slugs detected in official manifest');
  }
  for (const expectedSlug of expectedCategorySlugs) {
    if (!categorySlugs.includes(expectedSlug)) {
      throw new Error(`Missing approved category: ${expectedSlug}`);
    }
  }

  const completeArticles = rawManifest.categories.flatMap((category) => {
    const articles = category.articles.filter(isComplete);
    const expectedCount =
      EXPECTED_ARTICLE_COUNTS[
        category.slug as keyof typeof EXPECTED_ARTICLE_COUNTS
      ];
    if (expectedCount === undefined) {
      throw new Error(`Unknown category in official manifest: ${category.slug}`);
    }
    if (articles.length !== expectedCount) {
      throw new Error(
        `Category ${category.slug} expected ${expectedCount} complete articles, got ${articles.length}`,
      );
    }
    for (const article of articles) {
      if (article.categorySlug !== category.slug) {
        throw new Error(
          `Article ${article.slug} categorySlug mismatch: ${article.categorySlug} vs ${category.slug}`,
        );
      }
      rejectExampleComSources(article);
    }
    return articles;
  });

  if (completeArticles.length !== EXPECTED_PUBLISHED_ARTICLES) {
    throw new Error(
      `Completeness gate failed: expected ${EXPECTED_PUBLISHED_ARTICLES} articles, got ${completeArticles.length}`,
    );
  }

  const slugs = completeArticles.map((a) => a.slug);
  if (new Set(slugs).size !== EXPECTED_PUBLISHED_ARTICLES) {
    throw new Error('Duplicate article slugs detected in official manifest');
  }

  const primaryUrlToSlug = new Map<string, string>();
  for (const article of completeArticles) {
    const url = article.sources[0].canonicalUrl;
    const existingSlug = primaryUrlToSlug.get(url);
    if (existingSlug) {
      throw new Error(
        `Duplicate primary source URL "${url}" used by slugs "${existingSlug}" and "${article.slug}"`,
      );
    }
    primaryUrlToSlug.set(url, article.slug);
  }

  auditImages(workspaceRoot, imageManifest, slugs);

  if (FEATURED_ARTICLE_SLUGS.size !== EXPECTED_FEATURED_ARTICLES) {
    throw new Error(
      `Featured selection expected ${EXPECTED_FEATURED_ARTICLES} slugs, got ${FEATURED_ARTICLE_SLUGS.size}`,
    );
  }
  for (const slug of FEATURED_ARTICLE_SLUGS) {
    if (!slugs.includes(slug)) {
      throw new Error(`Featured article is missing from official manifest: ${slug}`);
    }
  }

  return completeArticles
    .map((article): OfficialArticleSeed => {
      const source = article.sources[0];
      const image = imageManifest[article.slug];
      const contentHtml = markdownToSafeHtml(article.bodyMarkdown);

      return {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        contentHtml,
        thumbnailUrl: image.localPath,
        coverImageUrl: image.localPath,
        publishedAt: new Date(article.datePublished),
        dateModified: article.dateModified ? new Date(article.dateModified) : null,
        isPublished: true,
        isFeatured: FEATURED_ARTICLE_SLUGS.has(article.slug),
        readingTime: estimateReadingTimeMinutes(article.bodyMarkdown),
        sourceName: source.sourceName,
        sourceUrl: source.canonicalUrl,
        imageAlt: article.imagePlan.cover.alt,
        imageCredit: image.credit,
        originalImageUrl: image.originalImageUrl,
        imageSourcePageUrl: image.sourcePageUrl,
        imageIsPlaceholder: image.isPlaceholder,
        authorName: article.author.name,
        authorSlug: article.author.slug,
        authorType: article.author.authorType,
        authorVerificationNote: article.author.verificationNote,
        tags: article.tags ?? [],
        evidence: article.evidence,
        verification: article.verification ?? null,
        categorySlug: article.categorySlug,
      };
    })
    .sort(
      (left, right) =>
        right.publishedAt.getTime() - left.publishedAt.getTime() ||
        left.slug.localeCompare(right.slug, 'vi'),
    );
}

export function officialSlugSet(): Set<string> {
  return new Set(loadOfficialArticles().map((article) => article.slug));
}
