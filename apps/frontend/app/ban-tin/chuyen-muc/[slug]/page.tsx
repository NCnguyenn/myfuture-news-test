import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NewsCard } from '../../../../components/news/NewsCard';
import { NewsList } from '../../../../components/news/NewsList';
import { NewsTabs } from '../../../../components/news/NewsTabs';
import { Pagination } from '../../../../components/news/Pagination';
import {
  ApiClientError,
  getArticles,
  getCategories,
  isNotFoundError,
} from '../../../../lib/api-client';
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
  try {
    articlesResponse = await getArticles({
      category: slug,
      page,
      limit: 10,
    });
  } catch (error) {
    if (isNotFoundError(error)) notFound();
    throw error;
  }

  const categoryLead =
    page === 1 ? articlesResponse.data[0] : undefined;
  const feedArticles =
    page === 1 ? articlesResponse.data.slice(1) : articlesResponse.data;

  return (
    <div className="page-shell">
      <div className="breadcrumb">
        <Link href="/ban-tin">Bản tin</Link>
        <span>/</span>
        <span>{category.name}</span>
      </div>
      <section className={styles.intro}>
        <p className="eyebrow">CHUYÊN MỤC</p>
        <h1>{category.name}</h1>
        <p>
          {category.description ?? 'Các bài viết mới nhất trong chuyên mục.'}
        </p>
      </section>
      <NewsTabs categories={categories} activeSlug={category.slug} />
      {categoryLead ? (
        <section className={styles.categoryLead} aria-label="Bài viết nổi bật">
          <NewsCard article={categoryLead} variant="featured" showExcerpt />
        </section>
      ) : null}
      <NewsList
        articles={feedArticles}
        title={page === 1 ? 'Mới trong chuyên mục' : `Trang ${page}`}
      />
      {articlesResponse.data.length > 0 ? (
        <Pagination
          meta={articlesResponse.meta}
          basePath={`/ban-tin/chuyen-muc/${slug}`}
        />
      ) : null}
    </div>
  );
}
