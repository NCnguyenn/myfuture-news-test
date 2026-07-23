import type { ArticleListItem } from '../../types/news';
import { NewsCard } from './NewsCard';
import styles from './RelatedNews.module.css';

type RelatedNewsProps = { articles: ArticleListItem[] };

export function RelatedNews({ articles }: RelatedNewsProps) {
  if (articles.length === 0) return null;
  return <section aria-labelledby="related-heading"><div className="section-heading"><h2 id="related-heading">Bài viết liên quan</h2></div><div className={styles.grid}>{articles.map((article) => <NewsCard article={article} compact key={article.id} />)}</div></section>;
}
