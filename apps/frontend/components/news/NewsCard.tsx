import Link from 'next/link';
import { formatDate } from '../../lib/format-date';
import type { ArticleListItem } from '../../types/news';
import { NewsImage } from './NewsImage';
import styles from './NewsCard.module.css';

export type StoryCardVariant = 'featured' | 'compact' | 'list' | 'related';

type NewsCardProps = {
  article: ArticleListItem;
  variant?: StoryCardVariant;
  showExcerpt?: boolean;
};

export function NewsCard({
  article,
  variant = 'list',
  showExcerpt = variant === 'list',
}: NewsCardProps) {
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
          priority={variant === 'featured'}
        />
      </Link>
      <div className={styles.body}>
        <Link
          href={`/ban-tin/chuyen-muc/${article.category.slug}`}
          className={styles.category}
        >
          {article.category.name}
        </Link>
        <h3>
          <Link href={`/ban-tin/${article.slug}`}>{article.title}</Link>
        </h3>
        {showExcerpt ? <p className={styles.excerpt}>{article.excerpt}</p> : null}
        <div className={styles.meta}>
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          <span>{article.author.name}</span>
          {article.viewCount !== undefined && article.viewCount > 0 ? (
            <span>{article.viewCount.toLocaleString('vi-VN')} lượt xem</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
