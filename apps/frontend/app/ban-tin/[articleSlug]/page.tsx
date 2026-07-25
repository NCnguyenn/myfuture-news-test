import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleContent } from '../../../components/news/ArticleContent';
import { ArticleHeader } from '../../../components/news/ArticleHeader';
import { CategoryDirectory } from '../../../components/news/CategoryDirectory';
import { NewsImage } from '../../../components/news/NewsImage';
import { NewsTabs } from '../../../components/news/NewsTabs';
import { PopularStories } from '../../../components/news/PopularStories';
import { RelatedNews } from '../../../components/news/RelatedNews';
import { SourceEvidence } from '../../../components/news/SourceEvidence';
import {
  ApiClientError,
  getArticleBySlug,
  getArticles,
  getCategories,
  isNotFoundError,
} from '../../../lib/api-client';
import { selectPopularStories } from '../../../lib/news-overview';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

type ArticlePageProps = { params: Promise<{ articleSlug: string }> };

async function loadArticle(slug: string) {
  try {
    const response = await getArticleBySlug(slug);
    return response.data;
  } catch (error) {
    if (isNotFoundError(error)) notFound();
    throw error;
  }
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { articleSlug } = await params;
  try {
    const response = await getArticleBySlug(articleSlug);
    const article = response.data;
    return {
      title: `${article.title} | MyFuture News`,
      description: article.excerpt,
      openGraph: {
        type: 'article',
        title: article.title,
        description: article.excerpt,
      },
    };
  } catch (error) {
    if (
      isNotFoundError(error) ||
      (error instanceof ApiClientError && error.status === 404)
    ) {
      notFound();
    }
    throw error;
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { articleSlug } = await params;
  const [article, categoriesResponse, popularResponse] = await Promise.all([
    loadArticle(articleSlug),
    getCategories(),
    getArticles({
      page: 1,
      limit: 6,
      sort: 'popular',
    }),
  ]);
  const popularSelection = selectPopularStories(
    popularResponse.data,
    article.relatedArticles,
    [article],
  );
  const imageCredit =
    article.imageProvenance.credit ??
    article.sourceName ??
    'MyFuture News';

  return (
    <div className={`page-shell ${styles.page}`}>
      <NewsTabs
        categories={categoriesResponse.data}
        activeSlug={article.category.slug}
      />
      <nav
        className={`${styles.breadcrumb} breadcrumb`}
        aria-label="Đường dẫn"
      >
        <Link href="/ban-tin">Bản tin</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/ban-tin/chuyen-muc/${article.category.slug}`}>
          {article.category.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{article.title}</span>
      </nav>
      <article className={styles.articleGrid}>
        <div className={styles.primary}>
          <ArticleHeader article={article} />
          <figure className={styles.cover}>
            <div className={styles.coverImage}>
              <NewsImage
                src={article.coverImageUrl ?? article.thumbnailUrl}
                alt={article.imageAlt}
                priority
                sizes="(max-width: 1199px) 100vw, 820px"
              />
            </div>
            <figcaption className={styles.credit}>
              <span>
                {article.imageProvenance.isPlaceholder
                  ? 'Ảnh minh họa'
                  : article.imageAlt}
              </span>
              <span>
                Nguồn ảnh:{' '}
                {article.imageProvenance.sourcePageUrl ? (
                  <a
                    href={article.imageProvenance.sourcePageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {imageCredit}
                  </a>
                ) : (
                  imageCredit
                )}
              </span>
            </figcaption>
          </figure>
          <div className={styles.readingColumn}>
            <ArticleContent contentHtml={article.contentHtml} />
            <SourceEvidence evidence={article.evidence} />
            {article.previousArticle || article.nextArticle ? (
              <nav
                className={styles.articleNav}
                aria-label="Điều hướng bài viết"
              >
                {article.previousArticle ? (
                  <Link href={`/ban-tin/${article.previousArticle.slug}`}>
                    <small>Bài trước</small>
                    <span>← {article.previousArticle.title}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {article.nextArticle ? (
                  <Link href={`/ban-tin/${article.nextArticle.slug}`}>
                    <small>Bài tiếp theo</small>
                    <span>{article.nextArticle.title} →</span>
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            ) : null}
          </div>
        </div>
        <aside
          className={styles.sidebar}
          aria-label="Khám phá thêm bài viết và chuyên mục"
        >
          <PopularStories
            articles={popularSelection.articles}
            title={popularSelection.title}
          />
          <CategoryDirectory
            compact
            categories={categoriesResponse.data}
          />
        </aside>
      </article>
      <div className={styles.related}>
        <RelatedNews articles={article.relatedArticles} />
      </div>
    </div>
  );
}
