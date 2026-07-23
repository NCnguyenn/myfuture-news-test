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
    <div className={styles.wrapper}>
      <p className="eyebrow">404</p>
      <h1>Không tìm thấy nội dung</h1>
      <p>Liên kết này không tồn tại hoặc bài viết chưa được xuất bản.</p>
      <Link href="/ban-tin">Quay lại Bản tin</Link>
    </div>
  );
}
