import type { ArticleListItem } from '../../types/news';
import { NewsCard } from './NewsCard';
import styles from './PopularStories.module.css';

type PopularStoriesProps = {
  popularArticles: ArticleListItem[];
  featuredFallback: ArticleListItem[];
};

export function PopularStories({
  popularArticles,
  featuredFallback,
}: PopularStoriesProps) {
  const hasMeaningfulViews = popularArticles.some(
    (article) => (article.viewCount ?? 0) > 0,
  );
  const title = hasMeaningfulViews ? 'Đọc nhiều' : 'Tin nổi bật';
  const articles = hasMeaningfulViews ? popularArticles : featuredFallback;

  if (articles.length === 0) return null;

  return (
    <section className={styles.panel} aria-labelledby="popular-heading">
      <div className={styles.heading}>
        <p className="eyebrow">ĐỀ XUẤT</p>
        <h2 id="popular-heading">{title}</h2>
      </div>
      <div className={styles.list}>
        {articles.slice(0, 5).map((article) => (
          <NewsCard article={article} variant="compact" key={article.id} />
        ))}
      </div>
    </section>
  );
}
