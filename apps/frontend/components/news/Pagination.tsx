import Link from 'next/link';
import type { PaginationMeta } from '../../types/news';
import styles from './Pagination.module.css';

type PaginationProps = { meta: PaginationMeta; basePath: string };

function pageHref(basePath: string, page: number) { return page === 1 ? basePath : `${basePath}?page=${page}`; }

export function Pagination({ meta, basePath }: PaginationProps) {
  if (meta.totalPages <= 1) return null;
  return (
    <nav className={styles.pagination} aria-label="Phân trang bài viết">
      {meta.hasPreviousPage ? <Link href={pageHref(basePath, meta.page - 1)}>← Trước</Link> : <span>← Trước</span>}
      <strong>Trang {meta.page} / {meta.totalPages}</strong>
      {meta.hasNextPage ? <Link href={pageHref(basePath, meta.page + 1)}>Sau →</Link> : <span>Sau →</span>}
    </nav>
  );
}
