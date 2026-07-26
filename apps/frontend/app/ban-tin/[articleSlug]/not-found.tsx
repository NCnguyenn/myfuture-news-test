import Link from 'next/link';
import styles from '../not-found.module.css';

export default function ArticleNotFound() {
  return (
    <section
      className={styles.routeState}
      aria-labelledby="article-not-found-title"
    >
      <p className="eyebrow">BÀI VIẾT</p>
      <h1 id="article-not-found-title">Không tìm thấy bài viết</h1>
      <p>
        Bài viết này không tồn tại hoặc chưa được xuất bản. Bạn có thể quay lại
        trang tổng quan để tiếp tục đọc những tin mới nhất.
      </p>
      <Link href="/ban-tin">Về trang tổng quan</Link>
    </section>
  );
}
