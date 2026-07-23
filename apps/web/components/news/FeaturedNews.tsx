import Link from 'next/link';
import type { ArticleListItem } from '../../types/news';
import { NewsImage } from './NewsImage';
import styles from './FeaturedNews.module.css';

type FeaturedNewsProps = { articles: ArticleListItem[] };

export function FeaturedNews({ articles }: FeaturedNewsProps) {
  const [primary, ...secondary] = articles;
  if (!primary) return null;
  return (
    <section aria-labelledby="featured-heading">
      <div className="section-heading"><div><p className="eyebrow">ĐÁNG CHÚ Ý</p><h2 id="featured-heading">Tin nổi bật</h2></div></div>
      <div className={styles.featured}>
        <Link href={`/ban-tin/${primary.slug}`} className={styles.primary}>
          <div className={styles.primaryImage}><NewsImage src={primary.thumbnailUrl} alt={primary.title} priority /></div>
          <div className={styles.primaryBody}><span className={styles.category}>{primary.category.name}</span><h3>{primary.title}</h3><p>{primary.excerpt}</p><span className={styles.readMore}>Đọc bài viết →</span></div>
        </Link>
        {secondary.length > 0 && <div className={styles.secondary}>{secondary.slice(0, 4).map((article) => <Link href={`/ban-tin/${article.slug}`} className={styles.secondaryCard} key={article.id}><div className={styles.secondaryImage}><NewsImage src={article.thumbnailUrl} alt={article.title} /></div><div><span className={styles.category}>{article.category.name}</span><h3>{article.title}</h3></div></Link>)}</div>}
      </div>
    </section>
  );
}
