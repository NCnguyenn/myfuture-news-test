import Link from 'next/link';
import type { NewsCategory } from '../../types/news';
import styles from './CategoryDirectory.module.css';

type CategoryDirectoryProps = {
  categories: NewsCategory[];
};

export function CategoryDirectory({ categories }: CategoryDirectoryProps) {
  if (categories.length === 0) return null;

  return (
    <section className={styles.panel} aria-labelledby="category-directory-heading">
      <div className={styles.heading}>
        <p className="eyebrow">KHÁM PHÁ</p>
        <h2 id="category-directory-heading">Theo chuyên mục</h2>
      </div>
      <div className={styles.links}>
        {categories.map((category) => (
          <Link href={`/ban-tin/chuyen-muc/${category.slug}`} key={category.id}>
            <span>{category.name}</span>
            <small>{category.articleCount} bài</small>
          </Link>
        ))}
      </div>
    </section>
  );
}
