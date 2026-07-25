import Link from 'next/link';
import type { NewsCategory } from '../../types/news';
import styles from './CategoryDirectory.module.css';

type CategoryDirectoryProps = {
  categories: NewsCategory[];
};

export function CategoryDirectory({ categories }: CategoryDirectoryProps) {
  if (categories.length === 0) return null;

  return (
    <section
      id="category-directory"
      className={styles.panel}
      aria-labelledby="category-directory-heading"
    >
      <div className={styles.intro}>
        <p className="eyebrow">KHÁM PHÁ</p>
        <h2 id="category-directory-heading">
          Góc nhìn chọn lọc về thị trường bất động sản
        </h2>
        <p>
          Theo dõi pháp lý, quy hoạch, tài chính và các chuyển động thị trường
          qua từng chuyên mục.
        </p>
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
