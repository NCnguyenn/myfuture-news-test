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
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
  }>;
};

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const query = firstParam(params.q).trim();
  const parsedPage = Number(firstParam(params.page) || '1');
  const page =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const isValidQuery = query.length >= 2 && query.length <= 100;
  const response =
    isValidQuery
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
          {isValidQuery
            ? `Tìm thấy ${response?.meta.totalItems ?? 0} bài viết cho “${query}”.`
            : query.length > 100
              ? 'Từ khóa tìm kiếm không được vượt quá 100 ký tự.'
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
          <p>
            {query.length > 100
              ? 'Hãy rút gọn từ khóa rồi tìm kiếm lại.'
              : 'Mở Tìm kiếm trên thanh đầu trang để bắt đầu khám phá.'}
          </p>
        </div>
      )}
    </div>
  );
}
