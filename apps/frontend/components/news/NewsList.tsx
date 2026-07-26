import type { ArticleListItem } from '../../types/news';
import { NewsCard } from './NewsCard';
import { EmptyState } from './NewsStates';
import styles from './NewsList.module.css';

type NewsListProps = {
  articles: ArticleListItem[];
  title?: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function NewsList({
  articles,
  title = 'Bài viết',
  description,
  emptyTitle,
  emptyDescription,
}: NewsListProps) {
  return (
    <section className={styles.section} aria-labelledby="news-list-heading">
      <div className="section-heading">
        <div>
          <h2 id="news-list-heading">{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
      </div>
      {articles.length > 0 ? (
        <div className={styles.list}>
          {articles.map((article) => (
            <NewsCard article={article} variant="feed" key={article.id} />
          ))}
        </div>
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </section>
  );
}
