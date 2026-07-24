import Link from 'next/link';
import { getCategories } from '../../lib/api-client';
import styles from './Footer.module.css';

export async function Footer() {
  const categories = await getCategories()
    .then((response) => response.data)
    .catch(() => []);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.about}>
          <Link href="/ban-tin" className={styles.brand}>
            <span>my</span>FUTURE
          </Link>
          <p>Thông tin rõ ràng hơn cho những quyết định về tương lai.</p>
        </div>
        {categories.length > 0 ? (
          <nav className={styles.links} aria-label="Chuyên mục ở chân trang">
            {categories.slice(0, 6).map((category) => (
              <Link href={`/ban-tin/chuyen-muc/${category.slug}`} key={category.id}>
                {category.name}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </footer>
  );
}
