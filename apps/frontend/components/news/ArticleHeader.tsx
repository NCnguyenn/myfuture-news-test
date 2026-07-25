import Link from 'next/link';
import { formatDate } from '../../lib/format-date';
import type { ArticleDetail } from '../../types/news';
import styles from './ArticleHeader.module.css';

type ArticleHeaderProps = {
  article: ArticleDetail;
};

export function ArticleHeader({ article }: ArticleHeaderProps) {
  return (
    <header className={styles.header}>
      <Link
        href={`/ban-tin/chuyen-muc/${article.category.slug}`}
        className={styles.category}
      >
        {article.isFeatured ? 'NỔI BẬT · ' : ''}
        {article.category.name}
      </Link>
      <h1 className={styles.title}>{article.title}</h1>
      <p className={styles.excerpt}>{article.excerpt}</p>
      <div className={styles.meta} aria-label="Thông tin bài viết">
        <span className={styles.author}>
          <span className={styles.metaLabel}>Tác giả: </span>
          {article.author.name}
        </span>
        <time dateTime={String(article.publishedAt)}>
          {formatDate(article.publishedAt)}
        </time>
        {article.readingTime && article.readingTime > 0 ? (
          <span>{article.readingTime} phút đọc</span>
        ) : null}
        {article.viewCount !== undefined && article.viewCount > 0 ? (
          <span>{article.viewCount.toLocaleString('vi-VN')} lượt xem</span>
        ) : null}
        {article.sourceName && article.sourceUrl ? (
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Nguồn: {article.sourceName}
          </a>
        ) : null}
      </div>
    </header>
  );
}
