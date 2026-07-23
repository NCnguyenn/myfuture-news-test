import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { getResearchedImage } from '../data/researched-images';
import type {
  ArticleDetail,
  ArticleDetailResponse,
  ArticleListItem,
  ArticleListResponse,
  ArticleQuery,
  NewsCategory,
} from '../types/news';
import { markdownToSafeHtml } from './markdown-to-html';

type RawArticle = {
  title: string;
  slug: string;
  excerpt: string;
  bodyMarkdown: string;
  categorySlug: string;
  datePublished: string;
  author: {
    name: string;
    slug: string;
    authorType: 'person' | 'organization';
    verified: boolean;
    verificationNote: string;
  };
  sources: Array<{
    sourceName: string;
    canonicalUrl: string;
    verified: boolean;
  }>;
  evidence: Array<{
    claim: string;
    sourceUrl: string;
    evidenceNote: string;
  }>;
  imagePlan: {
    cover: {
      alt: string;
    };
  };
};

type RawManifest = {
  categories: Array<{
    name: string;
    slug: string;
    articles: RawArticle[];
  }>;
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'phap-ly-du-an': 'Cập nhật pháp lý dự án và chính sách bất động sản.',
  'quy-hoach-ha-tang': 'Quy hoạch, giao thông và hạ tầng liên vùng.',
  'lai-suat-tai-chinh': 'Lãi suất, tín dụng và chính sách tài chính.',
  'thi-truong-gia-ca': 'Diễn biến thị trường, giá cả và nguồn cung.',
  'dau-tu-dong-tien': 'Đầu tư, FDI và dịch chuyển dòng vốn.',
  'cho-thue': 'Nhà ở, văn phòng và thị trường cho thuê.',
};

function findWorkspaceFile(relativePath: string): string {
  const candidates = [
    path.resolve(process.cwd(), relativePath),
    path.resolve(process.cwd(), '..', '..', relativePath),
  ];
  const match = candidates.find((candidate) => existsSync(candidate));
  if (!match) {
    throw new Error(`Required researched-news file not found: ${relativePath}`);
  }
  return match;
}

function readManifest(): RawManifest {
  return JSON.parse(
    readFileSync(
      findWorkspaceFile(
        'md/content-research/manifest-codex-2026-07-23.json',
      ),
      'utf8',
    ),
  ) as RawManifest;
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

const rawManifest = readManifest();
const rawArticles = rawManifest.categories
  .flatMap((category) => category.articles)
  .filter(isComplete)
  .sort(
    (left, right) =>
      Date.parse(right.datePublished) - Date.parse(left.datePublished),
  );

if (rawManifest.categories.length !== 6 || rawArticles.length !== 30) {
  throw new Error(
    `Researched-news completeness gate failed: ${rawManifest.categories.length} categories, ${rawArticles.length} articles`,
  );
}

const categories: NewsCategory[] = rawManifest.categories.map((category) => ({
  id: category.slug,
  name: category.name,
  slug: category.slug,
  description: CATEGORY_DESCRIPTIONS[category.slug] ?? null,
  articleCount: category.articles.filter(isComplete).length,
}));

function toListItem(article: RawArticle): ArticleListItem {
  const category = categories.find(
    (item) => item.slug === article.categorySlug,
  );
  if (!category) {
    throw new Error(`Unknown category: ${article.categorySlug}`);
  }

  const source = article.sources[0];
  const image = getResearchedImage(article.slug, source.canonicalUrl);
  return {
    id: article.slug,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    thumbnailUrl: image.localPath,
    imageAlt: article.imagePlan.cover.alt,
    publishedAt: article.datePublished,
    category: {
      name: category.name,
      slug: category.slug,
    },
    author: {
      name: article.author.name,
      slug: article.author.slug,
      authorType: article.author.authorType,
    },
  };
}

export function getResearchedCategories(): { data: NewsCategory[] } {
  return { data: categories };
}

export function getResearchedArticles(
  query: ArticleQuery = {},
): ArticleListResponse {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  let selected = query.category
    ? rawArticles.filter((item) => item.categorySlug === query.category)
    : rawArticles;

  if (query.sort === 'oldest') {
    selected = [...selected].reverse();
  }

  const totalItems = selected.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const start = (page - 1) * limit;

  return {
    data: selected.slice(start, start + limit).map(toListItem),
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export function getResearchedArticleBySlug(
  slug: string,
): ArticleDetailResponse | undefined {
  const index = rawArticles.findIndex((item) => item.slug === slug);
  if (index < 0) {
    return undefined;
  }

  const article = rawArticles[index];
  const source = article.sources[0];
  const image = getResearchedImage(article.slug, source.canonicalUrl);
  const detail: ArticleDetail = {
    ...toListItem(article),
    contentHtml: markdownToSafeHtml(article.bodyMarkdown),
    coverImageUrl: image.localPath,
    readingTime: Math.max(
      1,
      Math.ceil(article.bodyMarkdown.split(/\s+/).length / 220),
    ),
    sourceName: source.sourceName,
    sourceUrl: source.canonicalUrl,
    isFeatured: index < 5,
    author: {
      name: article.author.name,
      slug: article.author.slug,
      authorType: article.author.authorType,
      verificationNote: article.author.verificationNote,
    },
    evidence: article.evidence,
    imageProvenance: image,
    relatedArticles: rawArticles
      .filter(
        (item) =>
          item.categorySlug === article.categorySlug &&
          item.slug !== article.slug,
      )
      .slice(0, 3)
      .map(toListItem),
    previousArticle: rawArticles[index + 1]
      ? toListItem(rawArticles[index + 1])
      : null,
    nextArticle: rawArticles[index - 1]
      ? toListItem(rawArticles[index - 1])
      : null,
  };

  return { data: detail };
}
