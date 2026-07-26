import type { ReactElement } from 'react';
import Link from 'next/link';
import { formatDate } from '../../lib/format-date';
import type { ArticleListItem } from '../../types/news';
import { NewsImage } from './NewsImage';
import styles from './NewsCard.module.css';

export type NewsCardVariant =
  | 'lead'
  | 'supporting'
  | 'feed'
  | 'compact'
  | 'related';

export type StoryCardVariant = NewsCardVariant;

type NewsCardArticle = ArticleListItem & {
  readingTime?: number | null;
};

export type NewsCardProps = {
  article: NewsCardArticle;
  variant?: NewsCardVariant;
  showExcerpt?: boolean;
};

const IMAGE_SIZES = {
  lead: '(max-width: 768px) 100vw, 66vw',
  supporting: '(max-width: 360px) 96px, (max-width: 768px) 112px, 34vw',
  feed: '(max-width: 360px) 96px, (max-width: 768px) 112px, 230px',
  compact: '(max-width: 360px) 96px, 112px',
  related: '(max-width: 600px) 100vw, (max-width: 850px) 50vw, 33vw',
} satisfies Record<NonNullable<NewsCardProps['variant']>, string>;

const VARIANT_METADATA = {
  lead: { category: true, date: true, author: true, readingTime: true, views: true },
  supporting: { category: true, date: true, author: false, readingTime: true, views: true },
  feed: { category: true, date: true, author: true, readingTime: true, views: true },
  compact: { category: false, date: false, author: false, readingTime: false, views: true },
  related: { category: true, date: true, author: false, readingTime: true, views: false },
} satisfies Record<NewsCardVariant, Record<string, boolean>>;

export function NewsCard({
  article,
  variant = 'feed',
  showExcerpt,
}: NewsCardProps): ReactElement {
  const metadata = VARIANT_METADATA[variant];
  const shouldShowExcerpt =
    showExcerpt ?? (variant === 'lead' || variant === 'feed');
  const hasReadingTime =
    metadata.readingTime &&
    article.readingTime !== undefined &&
    article.readingTime !== null &&
    article.readingTime > 0;
  const hasViews =
    metadata.views &&
    article.viewCount !== undefined &&
    article.viewCount > 0;
  const hasMeta =
    metadata.date || metadata.author || hasReadingTime || hasViews;

  return (
    <article className={`${styles.card} ${styles[variant]}`}>
      <Link
        href={`/ban-tin/${article.slug}`}
        className={styles.imageLink}
        aria-label={`Đọc bài: ${article.title}`}
      >
        <NewsImage
          src={article.thumbnailUrl}
          alt={article.imageAlt}
          priority={variant === 'lead'}
          sizes={IMAGE_SIZES[variant]}
        />
      </Link>
      <div className={styles.body}>
        {metadata.category ? (
          <Link
            href={`/ban-tin/chuyen-muc/${article.category.slug}`}
            className={styles.category}
          >
            {article.category.name}
          </Link>
        ) : null}
        <h3>
          <Link href={`/ban-tin/${article.slug}`}>{article.title}</Link>
        </h3>
        {shouldShowExcerpt ? (
          <p className={styles.excerpt}>{article.excerpt}</p>
        ) : null}
        {hasMeta ? (
          <div className={styles.meta}>
            {metadata.date ? (
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
            ) : null}
            {metadata.author ? <span>{article.author.name}</span> : null}
            {hasReadingTime ? <span>{article.readingTime} phút đọc</span> : null}
            {hasViews ? (
              <span>{article.viewCount?.toLocaleString('vi-VN')} lượt xem</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
