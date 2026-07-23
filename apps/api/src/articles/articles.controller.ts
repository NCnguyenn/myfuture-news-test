import { Controller, Get, Param, Query } from '@nestjs/common';
import { ArticlesQueryDto } from './articles-query.dto';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  list(@Query() query: ArticlesQueryDto) {
    return this.articlesService.list(query);
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.articlesService.detail(slug);
  }
}
