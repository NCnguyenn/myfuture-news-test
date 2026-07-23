import { Module } from '@nestjs/common';
import { ArticlesModule } from './articles/articles.module';
import { CacheModule } from './cache/cache.module';
import { CategoriesModule } from './categories/categories.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [PrismaModule, HealthModule, CacheModule, CategoriesModule, ArticlesModule],
})
export class AppModule {}
