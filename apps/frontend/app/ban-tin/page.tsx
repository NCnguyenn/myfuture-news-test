import type { Metadata } from 'next';
import Link from 'next/link';
import { CategoryDirectory } from '../../components/news/CategoryDirectory';
import { FeaturedNews } from '../../components/news/FeaturedNews';
import { NewsList } from '../../components/news/NewsList';
import { NewsTabs } from '../../components/news/NewsTabs';
import { Pagination } from '../../components/news/Pagination';
import { PopularStories } from '../../components/news/PopularStories';
import { getArticles, getCategories } from '../../lib/api-client';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

const LATEST_PAGE_SIZE = 10;

type SearchParams = { [key: string]: string | string[] | undefined };
type NewsOverviewPageProps = {
  searchParams: Promise<SearchParams>;
};

function parsePage(value: string | string[] | undefined): number {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export const metadata: Metadata = {
  title: 'Bản tin | MyFuture News',
  description:
    'Khám phá tin tức, quy hoạch, tài chính và thị trường bất động sản.',
  openGraph: {
    type: 'website',
    title: 'Bản tin | MyFuture News',
    description:
      'Khám phá tin tức, quy hoạch, tài chính và thị trường bất động sản.',
  },
};

export default async function NewsOverviewPage({
  searchParams,
}: NewsOverviewPageProps) {
  const query = await searchParams;
  const page = parsePage(query.page);
  const [
    categoriesResponse,
    featuredResponse,
    latestResponse,
    popularResponse,
  ] = await Promise.all([
    getCategories(),
    getArticles({ page: 1, limit: 5, featured: true, sort: 'newest' }),
    getArticles({
      page,
      limit: LATEST_PAGE_SIZE,
      sort: 'newest',
    }),
    getArticles({ page: 1, limit: 5, sort: 'popular' }),
  ]);

  const featuredArticles =
    featuredResponse.data.length > 0
      ? featuredResponse.data
      : latestResponse.data.slice(0, 5);

  return (
    <div className={`page-shell ${styles.page}`}>
      <section className={styles.intro}>
        <p className="eyebrow">MYFUTURE NEWS</p>
        <h1>Bản tin thị trường</h1>
        <p>
          Góc nhìn chọn lọc về thị trường, quy hoạch, tài chính và pháp lý — được
          biên tập đầy đủ từ nguồn tin có thể kiểm chứng.
        </p>
        <Link href="#category-directory" className={styles.directoryLink}>
          Khám phá chuyên mục
          <span aria-hidden="true">↓</span>
        </Link>
      </section>
      <NewsTabs categories={categoriesResponse.data} activeSlug={null} />
      <FeaturedNews articles={featuredArticles} />
      <div className={styles.contentGrid}>
        <div className={styles.feed}>
          <NewsList articles={latestResponse.data} title="Tin mới nhất" />
          <Pagination meta={latestResponse.meta} basePath="/ban-tin" />
        </div>
        <aside className={styles.sidebar} aria-label="Bài viết đọc nhiều">
          <PopularStories
            popularArticles={popularResponse.data}
            featuredFallback={featuredArticles}
          />
        </aside>
      </div>
      <CategoryDirectory categories={categoriesResponse.data} />
    </div>
  );
}
