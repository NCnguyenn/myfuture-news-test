import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className={styles.wrapper}>
      <p className="eyebrow">LỖI 404</p>
      <h1>Không tìm thấy nội dung</h1>
      <p>
        Liên kết này không tồn tại hoặc bài viết chưa được xuất bản. Bạn có thể
        quay lại Bản tin để tiếp tục đọc.
      </p>
      <Link href="/ban-tin">Quay lại Bản tin</Link>
    </main>
  );
}
