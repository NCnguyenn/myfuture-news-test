import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NewsList } from '../../../../components/news/NewsList';
import { NewsTabs } from '../../../../components/news/NewsTabs';
import { Pagination } from '../../../../components/news/Pagination';
import { getArticles, getCategories, isNotFoundError } from '../../../../lib/api-client';

export const dynamic = 'force-dynamic';

type SearchParams = { [key: string]: string | string[] | undefined };
type CategoryPageProps = { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> };

async function findCategory(slug: string) {
  const response = await getCategories();
  return { category: response.data.find((item) => item.slug === slug), categories: response.data };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { category } = await findCategory(slug);
    if (category) {
      const description = category.description ?? undefined;
      return {
        title: `${category.name} | Bản tin MyFuture`,
        description,
        openGraph: { type: 'website', title: `${category.name} | Bản tin MyFuture`, description },
      };
    }
  } catch {
    return { title: 'Chuyên mục | Bản tin MyFuture' };
  }
  return { title: 'Chuyên mục | Bản tin MyFuture' };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const rawPage = Array.isArray(query.page) ? query.page[0] : query.page;
  const parsedPage = Number(rawPage ?? '1');
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const { category, categories } = await findCategory(slug);
  if (!category) notFound();

  let articlesResponse;
  try {
    articlesResponse = await getArticles({ category: slug, page, limit: 10 });
  } catch (error) {
    if (isNotFoundError(error)) notFound();
    throw error;
  }

  return (
    <div className="page-shell">
      <div className="breadcrumb"><Link href="/ban-tin">Bản tin</Link><span>/</span><span>{category.name}</span></div>
      <section className="page-intro">
        <p className="eyebrow">CHUYÊN MỤC</p>
        <h1>{category.name}</h1>
        <p>{category.description ?? 'Các bài viết mới nhất trong chuyên mục.'}</p>
      </section>
      <NewsTabs categories={categories} activeSlug={category.slug} />
      <NewsList articles={articlesResponse.data} title="Bài viết trong chuyên mục" />
      {articlesResponse.data.length > 0 && <Pagination meta={articlesResponse.meta} basePath={`/ban-tin/chuyen-muc/${slug}`} />}
    </div>
  );
}
