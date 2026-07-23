import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleContent } from '../../../components/news/ArticleContent';
import { NewsImage } from '../../../components/news/NewsImage';
import { RelatedNews } from '../../../components/news/RelatedNews';
import {
  ApiClientError,
  getArticleBySlug,
  isNotFoundError,
} from '../../../lib/api-client';
import { formatDate } from '../../../lib/format-date';

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

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
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
    if (isNotFoundError(error) || (error instanceof ApiClientError && error.status === 404)) {
      notFound();
    }
    throw error;
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { articleSlug } = await params;
  const article = await loadArticle(articleSlug);

  return (
    <div className="page-shell">
      <div className="breadcrumb">
        <Link href="/ban-tin">Bản tin</Link>
        <span>/</span>
        <Link href={`/ban-tin/chuyen-muc/${article.category.slug}`}>{article.category.name}</Link>
        <span>/</span>
        <span>{article.title}</span>
      </div>
      <article>
        <header className="article-header">
          <div className="article-category">
            {article.isFeatured ? 'NỔI BẬT · ' : ''}
            {article.category.name}
          </div>
          <h1>{article.title}</h1>
          <p className="article-excerpt">{article.excerpt}</p>
          <div className="article-meta">
            <time dateTime={String(article.publishedAt)}>
              {formatDate(article.publishedAt)}
            </time>
            <span>Tác giả: {article.author.name}</span>
            {article.viewCount !== undefined && (
              <span>{article.viewCount.toLocaleString('vi-VN')} lượt xem</span>
            )}
            {article.readingTime && <span>{article.readingTime} phút đọc</span>}
            {article.sourceName && article.sourceUrl && (
              <a href={article.sourceUrl} target="_blank" rel="noreferrer">
                Nguồn: {article.sourceName}
              </a>
            )}
          </div>
        </header>
        <div className="article-cover">
          <NewsImage
            src={article.coverImageUrl ?? article.thumbnailUrl}
            alt={article.imageAlt}
            priority
          />
        </div>
        {!article.imageProvenance.isPlaceholder && (
          <p className="article-image-credit">
            Ảnh từ nguồn bài viết: {article.imageProvenance.credit ?? article.sourceName}
          </p>
        )}
        <div className="article-body">
          <ArticleContent contentHtml={article.contentHtml} />
        </div>
        <aside className="article-evidence" aria-labelledby="evidence-heading">
          <p className="eyebrow">MINH BẠCH NGUỒN</p>
          <h2 id="evidence-heading">Nguồn kiểm chứng</h2>
          <ul>
            {article.evidence.map((item) => (
              <li key={`${item.sourceUrl}-${item.claim}`}>
                <strong>{item.claim}</strong>
                <p>{item.evidenceNote}</p>
                <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                  Mở nguồn gốc
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </article>
      <RelatedNews articles={article.relatedArticles} />
      {(article.previousArticle || article.nextArticle) && (
        <nav className="article-nav" aria-label="Điều hướng bài viết">
          {article.previousArticle ? (
            <Link href={`/ban-tin/${article.previousArticle.slug}`}>
              ← {article.previousArticle.title}
            </Link>
          ) : (
            <span />
          )}
          {article.nextArticle ? (
            <Link href={`/ban-tin/${article.nextArticle.slug}`}>
              {article.nextArticle.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
