import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  EXPECTED_ARTICLE_COUNTS,
  EXPECTED_FEATURED_ARTICLES,
  EXPECTED_PUBLISHED_ARTICLES,
} from '../../../scripts/lib/news-dataset-contract';

const root = path.resolve(__dirname, '..', '..', '..');
const publicRoot = path.resolve(root, 'apps/frontend/public');
const imageManifest = JSON.parse(
  readFileSync(path.join(root, 'data/news/images.json'), 'utf8'),
) as Record<
  string,
  {
    localPath: string;
    originalImageUrl: string | null;
    sourcePageUrl: string;
    credit: string | null;
  }
>;
const placeholderBytes = readFileSync(
  path.join(publicRoot, 'images/news/placeholder-default.svg'),
);
const articleManifest = JSON.parse(
  readFileSync(path.join(root, 'data/news/articles.json'), 'utf8'),
) as {
  categories: Array<{
    articles: Array<{
      slug: string;
      title: string;
      excerpt: string;
      bodyMarkdown: string;
      datePublished: string;
      author: Record<string, unknown>;
      sources: Array<
        {
          canonicalUrl: string;
          sourcePublishedAt: string;
        } & Record<string, unknown>
      >;
      evidence: Array<{
        sourceUrl: string;
        shortQuote?: string | null;
      }>;
      imagePlan: {
        cover: {
          alt: string;
          sourceUrl: string | null;
          credit: string | null;
        } & Record<string, unknown>;
        inlineImages: unknown[];
      };
      verification: { bodyWordCount: number } & Record<string, unknown>;
    }>;
  }>;
};

const NEW_ARTICLE_SLUGS = new Set([
  'nguon-cung-so-cap-tang-40-hap-thu-giam-62-nua-dau-2026',
  'biet-thu-lien-ke-ha-noi-thanh-khoan-giam-74-quy-2-2026',
  'gia-can-ho-neo-cao-nguoi-mua-chon-loc-2026',
  'bac-ninh-do-thi-da-cuc-bon-hanh-lang-phat-trien-2075',
  'quy-hoach-duong-bo-2050-bo-sung-nam-tuyen-cao-toc',
  'hung-yen-truc-bac-nam-89km-thanh-pho-truc-thuoc-trung-uong',
  'luat-phat-trien-do-thi-khu-kinh-te-dac-biet-2026',
  'sua-luat-kinh-doanh-bat-dong-san-tranh-chong-cheo-thu-tuc',
  'lai-suat-vay-nha-o-xa-hoi-nguoi-duoi-35-tuoi-6-5-2026',
  'lai-suat-cho-vay-binh-quan-thang-6-2026-len-10-5',
  'fdi-bat-dong-san-5-1-ty-usd-nua-dau-2026',
  'bo-xay-dung-ra-soat-130571-can-phong-nha-o-cho-thue',
]);

type CanonicalArticle = {
  slug: string;
  categorySlug: string;
  sourceUrl: string;
  authorName: string;
  evidence: unknown[];
  coverImageUrl: string;
  imageIsPlaceholder: boolean;
  originalImageUrl: string | null;
  imageSourcePageUrl: string;
  isFeatured: boolean;
  publishedAt: string;
};

function loadCanonicalArticles(): CanonicalArticle[] {
  const script = `
    import loader from './scripts/lib/official-news-data.ts';
    const articles = loader.loadOfficialArticles().map((article) => ({
      slug: article.slug,
      categorySlug: article.categorySlug,
      sourceUrl: article.sourceUrl,
      authorName: article.authorName,
      evidence: article.evidence,
      coverImageUrl: article.coverImageUrl,
      imageIsPlaceholder: article.imageIsPlaceholder,
      originalImageUrl: article.originalImageUrl,
      imageSourcePageUrl: article.imageSourcePageUrl,
      isFeatured: article.isFeatured,
      publishedAt: article.publishedAt.toISOString(),
    }));
    process.stdout.write(JSON.stringify(articles));
  `;
  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', '--eval', script],
    { cwd: root, encoding: 'utf8' },
  );
  assert.equal(
    result.status,
    0,
    `Canonical loader failed:\n${result.stderr || result.stdout}`,
  );
  return JSON.parse(result.stdout) as CanonicalArticle[];
}

test('loads the exact recruiter-ready 42-article dataset', () => {
  const articles = loadCanonicalArticles();
  assert.equal(articles.length, EXPECTED_PUBLISHED_ARTICLES);
  assert.equal(
    articles.filter((article) => article.isFeatured).length,
    EXPECTED_FEATURED_ARTICLES,
  );

  for (const [categorySlug, expected] of Object.entries(
    EXPECTED_ARTICLE_COUNTS,
  )) {
    assert.equal(
      articles.filter((article) => article.categorySlug === categorySlug)
        .length,
      expected,
    );
  }

  assert.deepEqual(
    new Set(articles.map((article) => article.slug)),
    new Set(Object.keys(imageManifest)),
  );
  assert.deepEqual(
    articles.map((article) => article.slug),
    [...articles]
      .sort(
        (left, right) =>
          Date.parse(right.publishedAt) - Date.parse(left.publishedAt) ||
          left.slug.localeCompare(right.slug, 'vi'),
      )
      .map((article) => article.slug),
  );

  for (const article of articles) {
    assert.ok(article.sourceUrl.startsWith('https://'));
    assert.ok(article.authorName.trim());
    assert.ok(article.evidence.length > 0);
    assert.ok(article.coverImageUrl.startsWith('/images/news/'));

    const localPath = path.resolve(
      publicRoot,
      article.coverImageUrl.replace(/^[/\\]+/, ''),
    );
    const relativePath = path.relative(publicRoot, localPath);
    assert.ok(
      relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath),
      `Image path escapes the frontend public directory: ${article.slug}`,
    );
    assert.ok(
      existsSync(localPath),
      `Missing local image for ${article.slug}: ${localPath}`,
    );

    if (NEW_ARTICLE_SLUGS.has(article.slug)) {
      assert.equal(article.imageIsPlaceholder, false);
      assert.ok(article.originalImageUrl?.startsWith('https://'));
      assert.ok(article.imageSourcePageUrl.startsWith('https://'));
      const imageBytes = readFileSync(localPath);
      assert.deepEqual([...imageBytes.subarray(0, 3)], [0xff, 0xd8, 0xff]);
      assert.notDeepEqual(imageBytes, placeholderBytes);
    }
  }

  assert.deepEqual(
    new Set(
      articles
        .filter((article) => NEW_ARTICLE_SLUGS.has(article.slug))
        .map((article) => article.slug),
    ),
    NEW_ARTICLE_SLUGS,
  );

  const rawArticles = articleManifest.categories.flatMap(
    (category) => category.articles,
  );
  const referenceArticle = rawArticles[0];
  const schemaKeys = Object.keys(referenceArticle).sort();
  for (const article of rawArticles.filter((item) =>
    NEW_ARTICLE_SLUGS.has(item.slug),
  )) {
    assert.deepEqual(Object.keys(article).sort(), schemaKeys);
    assert.deepEqual(
      Object.keys(article.author).sort(),
      Object.keys(referenceArticle.author).sort(),
    );
    assert.deepEqual(
      Object.keys(article.sources[0]).sort(),
      Object.keys(referenceArticle.sources[0]).sort(),
    );
    assert.deepEqual(
      Object.keys(article.evidence[0]).sort(),
      Object.keys(referenceArticle.evidence[0]).sort(),
    );
    assert.deepEqual(
      Object.keys(article.imagePlan).sort(),
      Object.keys(referenceArticle.imagePlan).sort(),
    );
    assert.deepEqual(
      Object.keys(article.imagePlan.cover).sort(),
      Object.keys(referenceArticle.imagePlan.cover).sort(),
    );
    assert.deepEqual(
      Object.keys(article.verification).sort(),
      Object.keys(referenceArticle.verification).sort(),
    );
    assert.ok(article.title.trim());
    assert.ok(article.excerpt.trim());
    assert.ok(article.imagePlan.cover.alt.trim());
    assert.ok(Object.keys(article.author).length > 0);
    assert.ok(article.sources.length > 0);
    assert.ok(article.evidence.length > 0);
    const image = imageManifest[article.slug];
    assert.equal(image.originalImageUrl, article.imagePlan.cover.sourceUrl);
    assert.equal(image.sourcePageUrl, article.sources[0].canonicalUrl);
    assert.equal(image.credit, article.imagePlan.cover.credit);
    assert.equal(
      article.sources[0].sourcePublishedAt,
      article.datePublished,
    );

    const bodyWordCount = article.bodyMarkdown
      .replace(/^#{1,6}\s+/gm, '')
      .trim()
      .split(/\s+/u)
      .filter(Boolean).length;
    assert.ok(
      bodyWordCount >= 500 && bodyWordCount <= 800,
      `${article.slug} must contain 500–800 words, got ${bodyWordCount}`,
    );
    assert.equal(article.verification.bodyWordCount, bodyWordCount);
    assert.doesNotMatch(
      `${article.title}\n${article.excerpt}\n${article.bodyMarkdown}`,
      /\b(?:TODO|TBD|lorem ipsum|placeholder)\b/i,
    );

    for (const evidence of article.evidence) {
      assert.ok(evidence.sourceUrl.startsWith('https://'));
      if (evidence.shortQuote) {
        assert.ok(evidence.shortQuote.trim().split(/\s+/u).length <= 25);
      }
    }
  }
});
