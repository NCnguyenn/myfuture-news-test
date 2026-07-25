import Link from 'next/link';
import styles from '../../not-found.module.css';

export default function CategoryNotFound() {
  return (
    <section
      className={styles.routeState}
      aria-labelledby="category-not-found-title"
    >
      <p className="eyebrow">CHUYÊN MỤC</p>
      <h1 id="category-not-found-title">Không tìm thấy chuyên mục</h1>
      <p>
        Chuyên mục này không tồn tại hoặc chưa được xuất bản. Bạn có thể quay lại
        trang tổng quan để khám phá các chuyên mục đang hoạt động.
      </p>
      <Link href="/ban-tin">Về trang tổng quan</Link>
    </section>
  );
}
