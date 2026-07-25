import type { ArticleListItem } from '../../types/news';
import { NewsCard } from './NewsCard';
import styles from './FeaturedNews.module.css';

type FeaturedNewsProps = { articles: ArticleListItem[] };

export function FeaturedNews({ articles }: FeaturedNewsProps) {
  const primary = articles[0];
  const supporting = articles.slice(1, 3);
  if (!primary) return null;

  return (
    <section
      className={styles.section}
      aria-label={`Tin nổi bật, dẫn đầu bởi bài của ${primary.author.name}`}
    >
      <div className={styles.featured}>
        <NewsCard article={primary} variant="lead" showExcerpt />
        {supporting.length > 0 ? (
          <div className={styles.secondary}>
            {supporting.map((article) => (
              <NewsCard article={article} variant="supporting" key={article.id} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
