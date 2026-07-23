import { Injectable } from '@nestjs/common';
import { CACHE_TTL_SECONDS } from '../cache/cache.constants';
import { categoriesCacheKey } from '../cache/cache.keys';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';

type CategoriesResponse = {
  data: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    articleCount: number;
  }>;
};

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async list(): Promise<CategoriesResponse> {
    const cached = await this.cache.getJson<CategoriesResponse>(categoriesCacheKey());
    if (cached) {
      return cached;
    }

    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: {
            articles: { where: { isPublished: true } },
          },
        },
      },
    });

    const response = {
      data: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        articleCount: category._count.articles,
      })),
    };

    await this.cache.setJson(categoriesCacheKey(), response, CACHE_TTL_SECONDS.categories);
    return response;
  }
}
