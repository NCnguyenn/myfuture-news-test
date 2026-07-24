import type { ArticleListItem } from '../../types/news';
import { NewsCard } from './NewsCard';
import { EmptyState } from './NewsStates';
import styles from './NewsList.module.css';

type NewsListProps = { articles: ArticleListItem[]; title?: string; description?: string };

export function NewsList({ articles, title = 'Bài viết', description }: NewsListProps) {
  return (
    <section aria-labelledby="news-list-heading">
      <div className="section-heading"><div><h2 id="news-list-heading">{title}</h2>{description && <p>{description}</p>}</div></div>
      {articles.length > 0 ? (
        <div className={styles.list}>
          {articles.map((article) => (
            <NewsCard article={article} variant="list" key={article.id} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </section>
  );
}
