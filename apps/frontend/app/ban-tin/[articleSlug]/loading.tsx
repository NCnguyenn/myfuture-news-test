import { ArticleLoadingSkeleton } from '../../../components/news/NewsStates';
import styles from '../loading.module.css';

export default function Loading() {
  return (
    <div className={styles.routeState}>
      <ArticleLoadingSkeleton />
    </div>
  );
}
