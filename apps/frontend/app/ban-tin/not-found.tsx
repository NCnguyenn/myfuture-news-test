import Link from 'next/link';
import styles from './not-found.module.css';

export default function NewsNotFound() {
  return (
    <section className={styles.routeState} aria-labelledby="news-not-found-title">
      <p className="eyebrow">KHÔNG TÌM THẤY</p>
      <h1 id="news-not-found-title">Không tìm thấy nội dung Bản tin</h1>
      <p>
        Liên kết này không tồn tại hoặc nội dung chưa được xuất bản. Hãy quay lại
        trang tổng quan để tiếp tục đọc.
      </p>
      <Link href="/ban-tin">Về trang tổng quan</Link>
    </section>
  );
}
