import Link from 'next/link';
import type { PaginationMeta } from '../../types/news';
import styles from './Pagination.module.css';

type PaginationProps = {
  meta: PaginationMeta;
  basePath: string;
  query?: Record<string, string>;
};

function pageHref(
  basePath: string,
  page: number,
  query: Record<string, string> = {},
) {
  const search = new URLSearchParams(query);
  if (page === 1) search.delete('page');
  else search.set('page', String(page));
  const queryString = search.toString();
  return `${basePath}${queryString ? `?${queryString}` : ''}`;
}

export function Pagination({ meta, basePath, query }: PaginationProps) {
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
          href={pageHref(basePath, meta.page - 1, query)}
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
            <Link href={pageHref(basePath, page, query)} key={page}>
              {page}
            </Link>
          ),
        )}
      </div>
      {meta.hasNextPage ? (
        <Link
          href={pageHref(basePath, meta.page + 1, query)}
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
