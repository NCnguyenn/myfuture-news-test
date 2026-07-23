import Link from 'next/link';
import { formatDate } from '../../lib/format-date';
import type { ArticleListItem } from '../../types/news';
import { NewsImage } from './NewsImage';
import styles from './NewsCard.module.css';

type NewsCardProps = { article: ArticleListItem; compact?: boolean };

export function NewsCard({ article, compact = false }: NewsCardProps) {
  return (
    <article className={`${styles.card} ${compact ? styles.compact : ''}`}>
      <Link href={`/ban-tin/${article.slug}`} className={styles.imageLink}>
        <NewsImage src={article.thumbnailUrl} alt={article.title} />
      </Link>
      <div className={styles.body}>
        <Link href={`/ban-tin/chuyen-muc/${article.category.slug}`} className={styles.category}>{article.category.name}</Link>
        <h3><Link href={`/ban-tin/${article.slug}`}>{article.title}</Link></h3>
        {!compact && <p>{article.excerpt}</p>}
        <div className={styles.meta}><time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time><span>{article.viewCount.toLocaleString('vi-VN')} lượt xem</span></div>
      </div>
    </article>
  );
}
