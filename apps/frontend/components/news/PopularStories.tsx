import type { ArticleListItem } from '../../types/news';
import { NewsCard } from './NewsCard';
import styles from './PopularStories.module.css';

type PopularStoriesProps = {
  articles: ArticleListItem[];
  title: 'Đọc nhiều' | 'Đáng chú ý';
};

export function PopularStories({
  articles,
  title,
}: PopularStoriesProps) {
  if (articles.length === 0) return null;

  return (
    <section className={styles.panel} aria-labelledby="popular-heading">
      <div className={styles.heading}>
        <p className="eyebrow">ĐỀ XUẤT</p>
        <h2 id="popular-heading">{title}</h2>
      </div>
      <ol className={styles.list}>
        {articles.slice(0, 5).map((article, index) => (
          <li key={article.id}>
            <span className={styles.rank} aria-hidden="true">
              {index + 1}
            </span>
            <NewsCard article={article} variant="compact" />
          </li>
        ))}
      </ol>
    </section>
  );
}
