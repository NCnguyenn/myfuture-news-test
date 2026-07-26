import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { NewsList } from '../../../components/news/NewsList';
import { ErrorPanel } from '../../../components/news/NewsStates';
import { Pagination } from '../../../components/news/Pagination';
import { getArticles } from '../../../lib/api-client';
import {
  loadSearchPageData,
  SEARCH_RESULTS_PATH,
} from '../../../lib/search-page-data';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tìm kiếm | MyFuture News',
  description: 'Tìm kiếm bài viết trong Bản tin MyFuture News.',
  robots: {
    index: false,
    follow: true,
  },
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
  }>;
};

function invalidMessage(
  reason: 'empty' | 'too_short' | 'too_long',
): { headline: string; detail: string } {
  if (reason === 'too_long') {
    return {
      headline: 'Từ khóa tìm kiếm không được vượt quá 100 ký tự.',
      detail: 'Hãy rút gọn từ khóa rồi tìm kiếm lại.',
    };
  }
  if (reason === 'too_short') {
    return {
      headline: 'Nhập ít nhất 2 ký tự để tìm kiếm.',
      detail: 'Mở Tìm kiếm trên thanh đầu trang để bắt đầu khám phá.',
    };
  }
  return {
    headline: 'Nhập ít nhất 2 ký tự từ nút Tìm kiếm trên đầu trang.',
    detail: 'Mở Tìm kiếm trên thanh đầu trang để bắt đầu khám phá.',
  };
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const result = await loadSearchPageData(params, {
    loadArticles: ({ q, page, limit }) => getArticles({ q, page, limit }),
  });

  if (result.status === 'redirect') {
    redirect(result.to);
  }

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
          {result.status === 'success'
            ? `Tìm thấy ${result.response.meta.totalItems} bài viết cho “${result.query}”.`
            : result.status === 'error'
              ? `Không thể tìm kiếm cho “${result.query}”.`
              : invalidMessage(result.reason).headline}
        </p>
      </header>

      {result.status === 'success' ? (
        <>
          <NewsList
            articles={result.response.data}
            title={`Kết quả cho “${result.query}”`}
            emptyTitle={`Không có bài viết cho “${result.query}”`}
            emptyDescription="Thử từ khóa khác hoặc mở tìm kiếm nhanh trên đầu trang."
          />
          <Pagination
            meta={result.response.meta}
            basePath={SEARCH_RESULTS_PATH}
            query={{ q: result.query }}
          />
        </>
      ) : null}

      {result.status === 'error' ? (
        <ErrorPanel
          title="Tìm kiếm tạm thời gián đoạn"
          description={
            result.message ||
            'Dịch vụ tìm kiếm đang gặp sự cố. Bạn có thể thử lại hoặc quay về Bản tin.'
          }
        >
          <Link
            href={`${SEARCH_RESULTS_PATH}?q=${encodeURIComponent(result.query)}${
              result.page > 1 ? `&page=${result.page}` : ''
            }`}
          >
            Thử lại
          </Link>
          <Link href="/ban-tin">Về trang tổng quan</Link>
        </ErrorPanel>
      ) : null}

      {result.status === 'invalid' ? (
        <div className={styles.prompt}>
          <span aria-hidden="true">⌕</span>
          <p>{invalidMessage(result.reason).detail}</p>
        </div>
      ) : null}
    </div>
  );
}
