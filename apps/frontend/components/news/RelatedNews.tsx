import type { ArticleListItem } from '../../types/news';
import { NewsCard } from './NewsCard';
import styles from './RelatedNews.module.css';

type RelatedNewsProps = { articles: ArticleListItem[] };

export function RelatedNews({ articles }: RelatedNewsProps) {
  if (articles.length === 0) return null;

  return (
    <section
      className={styles.section}
      aria-labelledby="related-heading"
    >
      <div className={styles.heading}>
        <p className="eyebrow">ĐỌC TIẾP</p>
        <h2 id="related-heading">Bài viết liên quan</h2>
      </div>
      <div className={styles.grid}>
        {articles.map((article) => (
          <NewsCard article={article} variant="related" key={article.id} />
        ))}
      </div>
    </section>
  );
}
