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
          <Link href="/ban-tin" className={styles.brand} aria-label="MyFuture - Bản tin">
            <span>my</span>FUTURE
          </Link>
          <p>
            myFUTURE — Bản tin thị trường bất động sản với góc nhìn chọn lọc,
            khách quan và chuyên sâu.
          </p>
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
      <div className={styles.legal}>
        <small>© 2026 myFUTURE. Mọi quyền được bảo lưu.</small>
        <Link href="/ban-tin">Bản tin thị trường</Link>
      </div>
    </footer>
  );
}
