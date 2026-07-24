import Link from 'next/link';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/ban-tin" className={styles.brand} aria-label="MyFuture - Bản tin">
          <span className={styles.wordmark}>
            <span>my</span>FUTURE
          </span>
          <span className={styles.divider} aria-hidden="true" />
          <span className={styles.channel}>Bản tin</span>
        </Link>
        <nav className={styles.nav} aria-label="Điều hướng chính">
          <Link href="/ban-tin" className={styles.active}>
            Bản tin
          </Link>
          <span className={styles.muted}>Góc nhìn thị trường</span>
        </nav>
      </div>
    </header>
  );
}
