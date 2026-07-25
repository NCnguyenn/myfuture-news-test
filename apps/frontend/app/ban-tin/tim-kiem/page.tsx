import type { Metadata } from 'next';
import Link from 'next/link';
import { NewsList } from '../../../components/news/NewsList';
import { Pagination } from '../../../components/news/Pagination';
import { getArticles } from '../../../lib/api-client';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tìm kiếm | MyFuture News',
  description: 'Tìm kiếm bài viết trong Bản tin MyFuture News.',
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const query = (params.q ?? '').trim().slice(0, 100);
  const parsedPage = Number(params.page ?? '1');
  const page =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const response =
    query.length >= 2
      ? await getArticles({ q: query, page, limit: 10 })
      : null;

  return (
    <div className="page-shell">
      <div className={`${styles.breadcrumb} breadcrumb`}>
        <Link href="/ban-tin">Bản tin</Link>
        <span>/</span>
        <span>Tìm kiếm</span>
      </div>
      <header className={styles.header}>
        <p className="eyebrow">KHÁM PHÁ NỘI DUNG</p>
        <h1>Kết quả tìm kiếm</h1>
        <p>
          {query.length >= 2
            ? `Tìm thấy ${response?.meta.totalItems ?? 0} bài viết cho “${query}”.`
            : 'Nhập ít nhất 2 ký tự từ nút Tìm kiếm trên đầu trang.'}
        </p>
      </header>
      {response ? (
        <>
          <NewsList
            articles={response.data}
            title={`Kết quả cho “${query}”`}
          />
          <Pagination
            meta={response.meta}
            basePath="/ban-tin/tim-kiem"
            query={{ q: query }}
          />
        </>
      ) : (
        <div className={styles.prompt}>
          <span aria-hidden="true">⌕</span>
          <p>Mở Tìm kiếm trên thanh đầu trang để bắt đầu khám phá.</p>
        </div>
      )}
    </div>
  );
}
