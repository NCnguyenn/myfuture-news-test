import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

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
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/[\p{L}\p{N}].*[\p{L}\p{N}]/u, {
    message: 'Search query must contain at least two letters or numbers',
  })
  q?: string;

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
