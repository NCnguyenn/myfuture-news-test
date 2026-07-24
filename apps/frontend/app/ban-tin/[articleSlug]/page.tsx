import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleContent } from '../../../components/news/ArticleContent';
import { ArticleHeader } from '../../../components/news/ArticleHeader';
import { NewsImage } from '../../../components/news/NewsImage';
import { NewsTabs } from '../../../components/news/NewsTabs';
import { RelatedNews } from '../../../components/news/RelatedNews';
import { SourceEvidence } from '../../../components/news/SourceEvidence';
import {
  ApiClientError,
  getArticleBySlug,
  getCategories,
  isNotFoundError,
} from '../../../lib/api-client';
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
  const [article, categoriesResponse] = await Promise.all([
    loadArticle(articleSlug),
    getCategories(),
  ]);

  return (
    <div className="page-shell">
      <NewsTabs
        categories={categoriesResponse.data}
        activeSlug={article.category.slug}
      />
      <div className={`${styles.breadcrumb} breadcrumb`}>
        <Link href="/ban-tin">Bản tin</Link>
        <span>/</span>
        <Link href={`/ban-tin/chuyen-muc/${article.category.slug}`}>
          {article.category.name}
        </Link>
        <span>/</span>
        <span>{article.title}</span>
      </div>
      <article>
        <ArticleHeader article={article} />
        <figure className={styles.cover}>
          <div className={styles.coverImage}>
            <NewsImage
              src={article.coverImageUrl ?? article.thumbnailUrl}
              alt={article.imageAlt}
              priority
            />
          </div>
          {!article.imageProvenance.isPlaceholder ? (
            <figcaption className={styles.credit}>
              Ảnh từ nguồn bài viết:{' '}
              {article.imageProvenance.credit ?? article.sourceName}
            </figcaption>
          ) : null}
        </figure>
        <div className={styles.readingColumn}>
          <ArticleContent contentHtml={article.contentHtml} />
          <SourceEvidence evidence={article.evidence} />
        </div>
      </article>
      <div className={styles.related}>
        <RelatedNews articles={article.relatedArticles} />
      </div>
      {article.previousArticle || article.nextArticle ? (
        <nav className={styles.articleNav} aria-label="Điều hướng bài viết">
          {article.previousArticle ? (
            <Link href={`/ban-tin/${article.previousArticle.slug}`}>
              <small>Đọc bài trước</small>
              <span>← {article.previousArticle.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {article.nextArticle ? (
            <Link href={`/ban-tin/${article.nextArticle.slug}`}>
              <small>Đọc bài tiếp</small>
              <span>{article.nextArticle.title} →</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
