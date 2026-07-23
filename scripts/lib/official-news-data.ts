import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { estimateReadingTimeMinutes, markdownToSafeHtml } from './markdown-to-html';

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
    if (
      existsSync(path.join(candidate, 'md/content-research/manifest-codex-2026-07-23.json'))
    ) {
      return candidate;
    }
  }
  throw new Error('Could not locate workspace root (manifest-codex-2026-07-23.json missing)');
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
  return path.join(
    workspaceRoot,
    'apps/frontend/public',
    webPath.replace(/^\//, ''),
  );
}

function loadImageManifest(
  workspaceRoot: string,
): Record<string, ImageRecord> {
  const manifestPath = path.join(
    workspaceRoot,
    'apps/frontend/public/images/news/researched/manifest.json',
  );
  if (!existsSync(manifestPath)) {
    throw new Error(`Image manifest not found: ${manifestPath}`);
  }
  return JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, ImageRecord>;
}

function auditImages(
  workspaceRoot: string,
  imageManifest: Record<string, ImageRecord>,
  articleSlugs: string[],
): void {
  const entries = articleSlugs.map((slug) => {
    const record = imageManifest[slug];
    if (!record) {
      throw new Error(`Missing image manifest entry for slug: ${slug}`);
    }
    if (!record.localPath?.startsWith('/images/')) {
      throw new Error(
        `Image localPath must be a relative web path under /images/: ${slug} -> ${record.localPath}`,
      );
    }
    const filePath = webPathToPublicFile(workspaceRoot, record.localPath);
    if (!existsSync(filePath)) {
      throw new Error(`Image file missing on disk for ${slug}: ${filePath}`);
    }
    return record;
  });

  const placeholders = entries.filter((e) => e.isPlaceholder);
  const sources = entries.filter((e) => !e.isPlaceholder);

  if (entries.length !== 30) {
    throw new Error(`Image audit expected 30 mapped articles, got ${entries.length}`);
  }
  if (sources.length !== 26) {
    throw new Error(`Image audit expected 26 source images, got ${sources.length}`);
  }
  if (placeholders.length !== 4) {
    throw new Error(`Image audit expected 4 placeholders, got ${placeholders.length}`);
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
 * Load, validate, and map the official 30 Codex articles for DB import/seed.
 */
export function loadOfficialArticles(): OfficialArticleSeed[] {
  const workspaceRoot = findWorkspaceRoot();
  const manifestPath = path.join(
    workspaceRoot,
    'md/content-research/manifest-codex-2026-07-23.json',
  );
  const rawManifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as RawManifest;
  const imageManifest = loadImageManifest(workspaceRoot);

  if (rawManifest.categories.length !== 6) {
    throw new Error(
      `Completeness gate failed: expected 6 categories, got ${rawManifest.categories.length}`,
    );
  }

  const categorySlugs = rawManifest.categories.map((c) => c.slug);
  for (const expected of OFFICIAL_CATEGORY_ORDER) {
    if (!categorySlugs.includes(expected)) {
      throw new Error(`Missing approved category: ${expected}`);
    }
  }

  const completeArticles = rawManifest.categories.flatMap((category) => {
    const articles = category.articles.filter(isComplete);
    if (articles.length !== 5) {
      throw new Error(
        `Category ${category.slug} expected 5 complete articles, got ${articles.length}`,
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

  if (completeArticles.length !== 30) {
    throw new Error(
      `Completeness gate failed: expected 30 articles, got ${completeArticles.length}`,
    );
  }

  const slugs = completeArticles.map((a) => a.slug);
  if (new Set(slugs).size !== 30) {
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

  const sortedByDate = [...completeArticles].sort(
    (left, right) => Date.parse(right.datePublished) - Date.parse(left.datePublished),
  );
  const featuredSlugs = new Set(sortedByDate.slice(0, 5).map((a) => a.slug));

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
        isFeatured: featuredSlugs.has(article.slug),
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
      (left, right) => right.publishedAt.getTime() - left.publishedAt.getTime(),
    );
}

export function officialSlugSet(): Set<string> {
  return new Set(loadOfficialArticles().map((article) => article.slug));
}
