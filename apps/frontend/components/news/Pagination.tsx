import Link from 'next/link';
import type { PaginationMeta } from '../../types/news';
import styles from './Pagination.module.css';

type PaginationProps = { meta: PaginationMeta; basePath: string };

function pageHref(basePath: string, page: number) {
  return page === 1 ? basePath : `${basePath}?page=${page}`;
}

export function Pagination({ meta, basePath }: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  const start = Math.max(
    1,
    Math.min(meta.page - 1, meta.totalPages - 2),
  );
  const pages = Array.from(
    { length: Math.min(3, meta.totalPages) },
    (_, index) => start + index,
  );

  return (
    <nav className={styles.pagination} aria-label="Phân trang bài viết">
      {meta.hasPreviousPage ? (
        <Link
          href={pageHref(basePath, meta.page - 1)}
          className={styles.direction}
          aria-label="Trang trước"
        >
          <span aria-hidden="true">←</span>
          <span className={styles.directionLabel}>Trước</span>
        </Link>
      ) : (
        <span className={`${styles.direction} ${styles.disabled}`} aria-disabled="true">
          <span aria-hidden="true">←</span>
          <span className={styles.directionLabel}>Trước</span>
        </span>
      )}
      <div className={styles.pages}>
        {pages.map((page) =>
          page === meta.page ? (
            <span className={styles.current} aria-current="page" key={page}>
              {page}
            </span>
          ) : (
            <Link href={pageHref(basePath, page)} key={page}>
              {page}
            </Link>
          ),
        )}
      </div>
      {meta.hasNextPage ? (
        <Link
          href={pageHref(basePath, meta.page + 1)}
          className={styles.direction}
          aria-label="Trang sau"
        >
          <span className={styles.directionLabel}>Sau</span>
          <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span className={`${styles.direction} ${styles.disabled}`} aria-disabled="true">
          <span className={styles.directionLabel}>Sau</span>
          <span aria-hidden="true">→</span>
        </span>
      )}
    </nav>
  );
}
