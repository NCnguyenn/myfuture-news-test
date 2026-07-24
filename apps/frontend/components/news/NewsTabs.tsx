import Link from 'next/link';
import type { NewsCategory } from '../../types/news';
import styles from './NewsTabs.module.css';

type NewsTabsProps = { categories: NewsCategory[]; activeSlug: string | null };

export function NewsTabs({ categories, activeSlug }: NewsTabsProps) {
  return (
    <nav className={styles.tabs} aria-label="Danh mục bản tin">
      <div className={styles.track}>
        <Link
          href="/ban-tin"
          className={`${styles.tab} ${activeSlug === null ? styles.active : ''}`}
          aria-current={activeSlug === null ? 'page' : undefined}
        >Toàn cảnh</Link>
        {categories.map((category) => (
          <Link
            href={`/ban-tin/chuyen-muc/${category.slug}`}
            className={`${styles.tab} ${activeSlug === category.slug ? styles.active : ''}`}
            aria-current={activeSlug === category.slug ? 'page' : undefined}
            key={category.id}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
