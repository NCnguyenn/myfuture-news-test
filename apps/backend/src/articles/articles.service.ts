import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CACHE_TTL_SECONDS } from '../cache/cache.constants';
import { articleDetailCacheKey, articleListCacheKey } from '../cache/cache.keys';
import { CacheService } from '../cache/cache.service';
import { ContentSanitizerService } from '../content/content-sanitizer.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  normalizeVietnameseSearch,
  rankArticleSearch,
  type SearchMatchedField,
} from './article-search';
import { ArticleSort, ArticlesQueryDto } from './articles-query.dto';

type ArticleListQuery = Partial<ArticlesQueryDto> & {
  category?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
  sort?: ArticleSort;
};

const listSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  thumbnailUrl: true,
  imageAlt: true,
  publishedAt: true,
  viewCount: true,
  authorName: true,
  authorSlug: true,
  authorType: true,
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ArticleSelect;

const searchSelect = {
  ...listSelect,
  contentHtml: true,
} satisfies Prisma.ArticleSelect;

type ArticleListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl: string;
  imageAlt: string;
  publishedAt: Date | string;
  viewCount: number;
  category: { name: string; slug: string };
  author: {
    name: string;
    slug: string;
    authorType: string;
  };
  searchSnippet?: string;
  matchedFields?: SearchMatchedField[];
};

type ArticleListResponse = {
  data: ArticleListItem[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type ArticleEvidence = {
  claim: string;
  sourceUrl: string;
  evidenceNote: string;
};

type ArticleDetailResponse = {
  data: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    contentHtml: string;
    thumbnailUrl: string;
    coverImageUrl: string | null;
    imageAlt: string;
    publishedAt: Date | string;
    viewCount: number;
    readingTime: number | null;
    sourceName: string | null;
    sourceUrl: string | null;
    isFeatured: boolean;
    category: { name: string; slug: string };
    author: {
      name: string;
      slug: string;
      authorType: string;
      verificationNote: string;
    };
    evidence: ArticleEvidence[];
    imageProvenance: {
      localPath: string;
      originalImageUrl: string | null;
      sourcePageUrl: string;
      credit: string | null;
      isPlaceholder: boolean;
    };
    relatedArticles: ArticleListItem[];
    previousArticle: ArticleListItem | null;
    nextArticle: ArticleListItem | null;
  };
};

function mapListItem(article: {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl: string;
  imageAlt: string | null;
  publishedAt: Date;
  viewCount: number;
  authorName: string | null;
  authorSlug: string | null;
  authorType: string | null;
  category: { name: string; slug: string };
}): ArticleListItem {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    thumbnailUrl: article.thumbnailUrl,
    imageAlt: article.imageAlt?.trim() || 'Ảnh minh họa',
    publishedAt: article.publishedAt,
    viewCount: article.viewCount,
    category: article.category,
    author: {
      name: article.authorName?.trim() || 'MyFuture News',
      slug: article.authorSlug?.trim() || 'myfuture-news',
      authorType: article.authorType?.trim() || 'organization',
    },
  };
}

function asEvidenceArray(value: Prisma.JsonValue | null | undefined): ArticleEvidence[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return null;
      }
      const record = item as Record<string, unknown>;
      const claim = typeof record.claim === 'string' ? record.claim : '';
      const sourceUrl = typeof record.sourceUrl === 'string' ? record.sourceUrl : '';
      const evidenceNote =
        typeof record.evidenceNote === 'string' ? record.evidenceNote : '';
      if (!claim && !sourceUrl) {
        return null;
      }
      return { claim, sourceUrl, evidenceNote };
    })
    .filter((item): item is ArticleEvidence => item !== null);
}

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sanitizer: ContentSanitizerService,
    private readonly cache: CacheService,
  ) {}

  async list(query: ArticleListQuery = {}): Promise<ArticleListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sort = query.sort ?? 'newest';
    const where: Prisma.ArticleWhereInput = { isPublished: true };

    if (query.featured !== undefined) {
      where.isFeatured = query.featured;
    }

    if (query.category) {
      const category = await this.prisma.category.findUnique({
        where: { slug: query.category },
        select: { id: true },
      });
      if (!category) {
        throw new NotFoundException({
          message: 'Category not found',
          code: 'CATEGORY_NOT_FOUND',
        });
      }
      where.categoryId = category.id;
    }

    const normalizedQuery = query.q
      ? normalizeVietnameseSearch(query.q)
      : undefined;
    const cacheKey = articleListCacheKey({
      category: query.category,
      page,
      limit,
      featured: query.featured,
      sort,
      q: normalizedQuery,
    });
    const cached = await this.cache.getJson<ArticleListResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    if (normalizedQuery) {
      const candidates = await this.prisma.article.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        select: searchSelect,
      });
      const ranked = candidates
        .flatMap((candidate) => {
          const match = rankArticleSearch(candidate, normalizedQuery);
          return match ? [{ candidate, match }] : [];
        })
        .sort(
          (left, right) =>
            right.match.score - left.match.score ||
            right.candidate.publishedAt.getTime() -
              left.candidate.publishedAt.getTime(),
        );
      const totalItems = ranked.length;
      const totalPages = Math.ceil(totalItems / limit);
      const pageItems = ranked.slice((page - 1) * limit, page * limit);
      const response: ArticleListResponse = {
        data: pageItems.map(({ candidate, match }) => ({
          ...mapListItem(candidate),
          searchSnippet: match.searchSnippet,
          matchedFields: match.matchedFields,
        })),
        meta: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };

      await this.cache.setJson(
        cacheKey,
        response,
        CACHE_TTL_SECONDS.articleList,
      );
      return response;
    }

    const totalItems = await this.prisma.article.count({ where });
    const totalPages = Math.ceil(totalItems / limit);
    const articles = await this.prisma.article.findMany({
      where,
      orderBy: this.orderBy(sort),
      skip: (page - 1) * limit,
      take: limit,
      select: listSelect,
    });

    const response: ArticleListResponse = {
      data: articles.map(mapListItem),
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

    await this.cache.setJson(cacheKey, response, CACHE_TTL_SECONDS.articleList);
    return response;
  }

  async detail(slug: string): Promise<ArticleDetailResponse> {
    const cacheKey = articleDetailCacheKey(slug);
    const cached = await this.cache.getJson<ArticleDetailResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const article = await this.prisma.article.findFirst({
      where: { slug, isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        contentHtml: true,
        thumbnailUrl: true,
        coverImageUrl: true,
        imageAlt: true,
        imageCredit: true,
        originalImageUrl: true,
        imageSourcePageUrl: true,
        imageIsPlaceholder: true,
        publishedAt: true,
        viewCount: true,
        readingTime: true,
        sourceName: true,
        sourceUrl: true,
        isFeatured: true,
        authorName: true,
        authorSlug: true,
        authorType: true,
        authorVerificationNote: true,
        evidence: true,
        categoryId: true,
        category: { select: { name: true, slug: true } },
      },
    });

    if (!article) {
      throw new NotFoundException({
        message: 'Article not found',
        code: 'ARTICLE_NOT_FOUND',
      });
    }

    const relatedRaw = await this.prisma.article.findMany({
      where: {
        isPublished: true,
        categoryId: article.categoryId,
        id: { not: article.id },
      },
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: 3,
      select: listSelect,
    });

    // previous = older (lower publishedAt), next = newer (higher publishedAt)
    // among all published articles ordered by publishedAt desc.
    const previousRaw = await this.prisma.article.findFirst({
      where: {
        isPublished: true,
        OR: [
          { publishedAt: { lt: article.publishedAt } },
          {
            publishedAt: article.publishedAt,
            id: { lt: article.id },
          },
        ],
      },
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      select: listSelect,
    });

    const nextRaw = await this.prisma.article.findFirst({
      where: {
        isPublished: true,
        OR: [
          { publishedAt: { gt: article.publishedAt } },
          {
            publishedAt: article.publishedAt,
            id: { gt: article.id },
          },
        ],
      },
      orderBy: [{ publishedAt: 'asc' }, { id: 'asc' }],
      select: listSelect,
    });

    const listShape = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      thumbnailUrl: article.thumbnailUrl,
      imageAlt: article.imageAlt,
      publishedAt: article.publishedAt,
      viewCount: article.viewCount,
      authorName: article.authorName,
      authorSlug: article.authorSlug,
      authorType: article.authorType,
      category: article.category,
    };

    const response: ArticleDetailResponse = {
      data: {
        ...mapListItem(listShape),
        contentHtml: this.sanitizer.sanitize(article.contentHtml),
        coverImageUrl: article.coverImageUrl,
        readingTime: article.readingTime,
        sourceName: article.sourceName,
        sourceUrl: article.sourceUrl,
        isFeatured: article.isFeatured,
        author: {
          name: article.authorName?.trim() || 'MyFuture News',
          slug: article.authorSlug?.trim() || 'myfuture-news',
          authorType: article.authorType?.trim() || 'organization',
          verificationNote: article.authorVerificationNote?.trim() || '',
        },
        evidence: asEvidenceArray(article.evidence),
        imageProvenance: {
          localPath: article.thumbnailUrl,
          originalImageUrl: article.originalImageUrl,
          sourcePageUrl:
            article.imageSourcePageUrl?.trim() || article.sourceUrl || '',
          credit: article.imageCredit,
          isPlaceholder: article.imageIsPlaceholder,
        },
        relatedArticles: relatedRaw.map(mapListItem),
        previousArticle: previousRaw ? mapListItem(previousRaw) : null,
        nextArticle: nextRaw ? mapListItem(nextRaw) : null,
      },
    };

    await this.cache.setJson(cacheKey, response, CACHE_TTL_SECONDS.articleDetail);
    return response;
  }

  private orderBy(sort: ArticleSort): Prisma.ArticleOrderByWithRelationInput[] {
    if (sort === 'oldest') {
      return [{ publishedAt: 'asc' }, { id: 'asc' }];
    }
    if (sort === 'popular') {
      return [{ viewCount: 'desc' }, { publishedAt: 'desc' }, { id: 'desc' }];
    }
    return [{ publishedAt: 'desc' }, { id: 'desc' }];
  }
}
