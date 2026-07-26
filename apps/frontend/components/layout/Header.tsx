'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchLauncher } from '../search/SearchLauncher';
import styles from './Header.module.css';

export function Header() {
  const pathname = usePathname();

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
        <p className={styles.statement}>Góc nhìn chọn lọc cho quyết định tương lai.</p>
        <div className={styles.actions}>
          <nav className={styles.nav} aria-label="Điều hướng chính">
            <Link
              href="/ban-tin"
              className={pathname === '/ban-tin' ? styles.active : undefined}
              aria-current={pathname === '/ban-tin' ? 'page' : undefined}
            >
              Toàn cảnh
            </Link>
          </nav>
          <SearchLauncher />
        </div>
      </div>
    </header>
  );
}
