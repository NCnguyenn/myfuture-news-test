import type { Metadata } from 'next';
import { CategoryDirectory } from '../../components/news/CategoryDirectory';
import { FeaturedNews } from '../../components/news/FeaturedNews';
import { NewsList } from '../../components/news/NewsList';
import { NewsTabs } from '../../components/news/NewsTabs';
import { PopularStories } from '../../components/news/PopularStories';
import { getArticles, getCategories } from '../../lib/api-client';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

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

export default async function NewsOverviewPage() {
  const [
    categoriesResponse,
    featuredResponse,
    latestResponse,
    popularResponse,
  ] = await Promise.all([
    getCategories(),
    getArticles({ page: 1, limit: 5, featured: true, sort: 'newest' }),
    getArticles({ page: 1, limit: 10, sort: 'newest' }),
    getArticles({ page: 1, limit: 5, sort: 'popular' }),
  ]);

  const featuredArticles =
    featuredResponse.data.length > 0
      ? featuredResponse.data
      : latestResponse.data.slice(0, 5);

  return (
    <div className="page-shell">
      <section className={styles.intro}>
        <p className="eyebrow">MYFUTURE NEWS</p>
        <h1>Bản tin thị trường</h1>
        <p>
          Góc nhìn chọn lọc về thị trường, quy hoạch, tài chính và pháp lý — được
          biên tập đầy đủ từ nguồn tin có thể kiểm chứng.
        </p>
      </section>
      <NewsTabs categories={categoriesResponse.data} activeSlug={null} />
      <FeaturedNews articles={featuredArticles} />
      <div className={styles.contentGrid}>
        <div className={styles.feed}>
          <NewsList articles={latestResponse.data} title="Tin mới nhất" />
        </div>
        <aside className={styles.sidebar} aria-label="Nội dung gợi ý">
          <PopularStories
            popularArticles={popularResponse.data}
            featuredFallback={featuredArticles}
          />
          <CategoryDirectory categories={categoriesResponse.data} />
        </aside>
      </div>
    </div>
  );
}
