import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { CategoryDirectory } from '../../../../components/news/CategoryDirectory';
import { NewsCard } from '../../../../components/news/NewsCard';
import { NewsList } from '../../../../components/news/NewsList';
import { NewsTabs } from '../../../../components/news/NewsTabs';
import { Pagination } from '../../../../components/news/Pagination';
import { PopularStories } from '../../../../components/news/PopularStories';
import {
  ApiClientError,
  getArticles,
  getCategories,
  isNotFoundError,
} from '../../../../lib/api-client';
import { CATEGORY_PAGE_SIZE } from '../../../../lib/news-config';
import {
  resolvePageRedirect,
  selectPopularStories,
} from '../../../../lib/news-overview';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

type SearchParams = { [key: string]: string | string[] | undefined };
type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const response = await getCategories();
    const category = response.data.find((item) => item.slug === slug);
    if (category) {
      const description = category.description ?? undefined;
      return {
        title: `${category.name} | Bản tin MyFuture`,
        description,
        openGraph: {
          type: 'website',
          title: `${category.name} | Bản tin MyFuture`,
          description,
        },
      };
    }
  } catch (error) {
    if (error instanceof ApiClientError || isNotFoundError(error)) {
      return { title: 'Chuyên mục | Bản tin MyFuture' };
    }
    throw error;
  }
  return { title: 'Chuyên mục | Bản tin MyFuture' };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const rawPage = Array.isArray(query.page) ? query.page[0] : query.page;
  const parsedPage = Number(rawPage ?? '1');
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  let categories;
  try {
    const categoriesResponse = await getCategories();
    categories = categoriesResponse.data;
  } catch (error) {
    if (isNotFoundError(error)) notFound();
    throw error;
  }

  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

  let articlesResponse;
  let popularResponse;
  try {
    [articlesResponse, popularResponse] = await Promise.all([
      getArticles({
        category: category.slug,
        page,
        limit: CATEGORY_PAGE_SIZE,
      }),
      getArticles({
        category: category.slug,
        page: 1,
        limit: CATEGORY_PAGE_SIZE + 1,
        sort: 'popular',
      }),
    ]);
  } catch (error) {
    if (isNotFoundError(error)) notFound();
    throw error;
  }

  const redirectTo = resolvePageRedirect(
    page,
    articlesResponse.meta,
    `/ban-tin/chuyen-muc/${category.slug}`,
  );
  if (redirectTo) redirect(redirectTo);

  const categoryLead =
    page === 1 ? articlesResponse.data[0] : undefined;
  const feedArticles =
    page === 1 ? articlesResponse.data.slice(1) : articlesResponse.data;
  const popularSelection = selectPopularStories(
    popularResponse.data,
    articlesResponse.data,
    categoryLead ? [categoryLead] : [],
  );
  const emptyTitle = categoryLead
    ? `Chưa có thêm bài viết trong ${category.name}`
    : `Chưa có bài viết trong ${category.name}`;

  return (
    <div className={`page-shell ${styles.page}`}>
      <nav className={styles.breadcrumb} aria-label="Đường dẫn">
        <ol>
          <li>
            <Link href="/ban-tin">Bản tin</Link>
          </li>
          <li aria-current="page">{category.name}</li>
        </ol>
      </nav>
      <section className={styles.intro}>
        <p className="eyebrow">CHUYÊN MỤC</p>
        <h1>{category.name}</h1>
        <p className={styles.description}>
          {category.description ?? 'Các bài viết mới nhất trong chuyên mục.'}
        </p>
        <p className={styles.articleCount}>
          {articlesResponse.meta.totalItems} bài viết
        </p>
      </section>
      <NewsTabs categories={categories} activeSlug={category.slug} />
      <div className={styles.contentGrid}>
        <div className={styles.primary}>
          {categoryLead ? (
            <section
              className={styles.categoryLead}
              aria-label="Bài viết nổi bật"
            >
              <NewsCard article={categoryLead} variant="lead" showExcerpt />
            </section>
          ) : null}
          <NewsList
            articles={feedArticles}
            title={page === 1 ? 'Mới trong chuyên mục' : `Trang ${page}`}
            emptyTitle={emptyTitle}
            emptyDescription="Khám phá các chuyên mục khác hoặc quay lại toàn cảnh Bản tin."
          />
          {articlesResponse.data.length > 0 ? (
            <Pagination
              meta={articlesResponse.meta}
              basePath={`/ban-tin/chuyen-muc/${category.slug}`}
            />
          ) : null}
        </div>
        <aside
          className={styles.sidebar}
          aria-label={`Khám phá thêm trong ${category.name}`}
        >
          <PopularStories
            articles={popularSelection.articles}
            title={popularSelection.title}
          />
          <CategoryDirectory categories={categories} compact />
        </aside>
      </div>
    </div>
  );
}
