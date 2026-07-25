import type { ArticleListItem } from '../../types/news';
import { NewsCard } from './NewsCard';
import styles from './FeaturedNews.module.css';

type FeaturedNewsProps = { articles: ArticleListItem[] };

export function FeaturedNews({ articles }: FeaturedNewsProps) {
  const [primary, ...secondary] = articles;
  if (!primary) return null;

  return (
    <section
      aria-labelledby="featured-heading"
      aria-label={`Bài nổi bật của ${primary.author.name}`}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">ĐÁNG CHÚ Ý</p>
          <h2 id="featured-heading">Tin nổi bật</h2>
        </div>
      </div>
      <div className={styles.featured}>
        <NewsCard article={primary} variant="lead" showExcerpt />
        {secondary.length > 0 ? (
          <div className={styles.secondary}>
            {secondary.slice(0, 4).map((article) => (
              <NewsCard article={article} variant="supporting" key={article.id} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
