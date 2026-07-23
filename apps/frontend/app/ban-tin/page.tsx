import type { Metadata } from 'next';
import { FeaturedNews } from '../../components/news/FeaturedNews';
import { NewsList } from '../../components/news/NewsList';
import { NewsTabs } from '../../components/news/NewsTabs';
import { getArticles, getCategories } from '../../lib/api-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bản tin | MyFuture News',
  description: 'Khám phá tin tức, quy hoạch, tài chính và thị trường bất động sản.',
  openGraph: {
    type: 'website',
    title: 'Bản tin | MyFuture News',
    description: 'Khám phá tin tức, quy hoạch, tài chính và thị trường bất động sản.',
  },
};

export default async function NewsOverviewPage() {
  const [categoriesResponse, featuredResponse, latestResponse] = await Promise.all([
    getCategories(),
    getArticles({ page: 1, limit: 5, featured: true, sort: 'newest' }),
    getArticles({ page: 1, limit: 10, sort: 'newest' }),
  ]);

  const featuredArticles =
    featuredResponse.data.length > 0
      ? featuredResponse.data
      : latestResponse.data.slice(0, 5);

  return (
    <div className="page-shell">
      <section className="page-intro">
        <p className="eyebrow">MYFUTURE NEWS</p>
        <h1>Bản tin thị trường</h1>
        <p>Ba mươi bài viết mới được biên tập đầy đủ và kiểm chứng trực tiếp từ nguồn gốc.</p>
      </section>
      <NewsTabs categories={categoriesResponse.data} activeSlug={null} />
      <FeaturedNews articles={featuredArticles} />
      <NewsList articles={latestResponse.data} title="Tin mới nhất" />
    </div>
  );
}
