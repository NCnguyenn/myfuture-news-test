import Link from 'next/link';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div><strong>MyFuture News</strong><p>Thông tin bất động sản rõ ràng hơn cho những quyết định tốt hơn.</p></div>
        <Link href="/ban-tin">Về trang bản tin →</Link>
      </div>
    </footer>
  );
}
