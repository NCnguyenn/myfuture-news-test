import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const ARTICLE_SORTS = ['newest', 'oldest', 'popular'] as const;
export type ArticleSort = (typeof ARTICLE_SORTS)[number];

const toNumber = ({ value }: { value: unknown }) => {
  if (value === undefined) return value;
  return Number(value);
};

const toBoolean = ({ value }: { value: unknown }) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

export class ArticlesQueryDto {
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsOptional()
  @IsString()
  category?: string;

  @Transform(toNumber)
  @IsInt()
  @Min(1)
  page = 1;

  @Transform(toNumber)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 10;

  @Transform(toBoolean)
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsIn(ARTICLE_SORTS as unknown as string[])
  sort: ArticleSort = 'newest';
}
