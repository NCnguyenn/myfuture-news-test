import {
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import {
  extensionForContentType,
  extractOgImage,
} from '../apps/frontend/lib/source-image';

type RawArticle = {
  slug: string;
  sources: Array<{
    sourceName: string;
    canonicalUrl: string;
  }>;
};

type RawManifest = {
  categories: Array<{
    articles: RawArticle[];
  }>;
};

type OutputRecord = {
  localPath: string;
  originalImageUrl: string | null;
  sourcePageUrl: string;
  credit: string | null;
  isPlaceholder: boolean;
};

const workspaceRoot = path.resolve(import.meta.dirname, '..');
const sourceManifestPath = path.join(
  workspaceRoot,
  'md',
  'content-research',
  'manifest-codex-2026-07-23.json',
);
const outputDirectory = path.join(
  workspaceRoot,
  'apps',
  'frontend',
  'public',
  'images',
  'news',
  'researched',
);
const outputManifestPath = path.join(outputDirectory, 'manifest.json');
const requestHeaders = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36',
  accept:
    'text/html,application/xhtml+xml,image/avif,image/webp,image/*,*/*',
};

function fallback(
  sourcePageUrl: string,
  sourceName: string,
): OutputRecord {
  return {
    localPath: '/images/news/placeholder-default.svg',
    originalImageUrl: null,
    sourcePageUrl,
    credit: sourceName,
    isPlaceholder: true,
  };
}

async function syncArticle(
  article: RawArticle,
): Promise<[string, OutputRecord]> {
  const source = article.sources[0];
  const sourcePageUrl = source.canonicalUrl;

  try {
    const pageResponse = await fetch(sourcePageUrl, {
      headers: requestHeaders,
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
    });
    if (!pageResponse.ok) {
      throw new Error(`source page HTTP ${pageResponse.status}`);
    }

    const html = await pageResponse.text();
    const originalImageUrl = extractOgImage(html, pageResponse.url);
    if (!originalImageUrl) {
      throw new Error('og:image not found');
    }

    const imageResponse = await fetch(originalImageUrl, {
      headers: requestHeaders,
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
    });
    if (!imageResponse.ok) {
      throw new Error(`image HTTP ${imageResponse.status}`);
    }

    const extension = extensionForContentType(
      imageResponse.headers.get('content-type') ?? '',
    );
    if (!extension) {
      throw new Error('unsupported image content type');
    }

    const filename = `${article.slug}.${extension}`;
    const bytes = Buffer.from(await imageResponse.arrayBuffer());
    if (bytes.length === 0) {
      throw new Error('empty image response');
    }
    writeFileSync(path.join(outputDirectory, filename), bytes);

    const record: OutputRecord = {
      localPath: `/images/news/researched/${filename}`,
      originalImageUrl,
      sourcePageUrl,
      credit: source.sourceName,
      isPlaceholder: false,
    };
    process.stdout.write(`downloaded ${article.slug}\n`);
    return [article.slug, record];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stdout.write(`placeholder ${article.slug}: ${message}\n`);
    return [article.slug, fallback(sourcePageUrl, source.sourceName)];
  }
}

async function main(): Promise<void> {
  const manifest = JSON.parse(
    readFileSync(sourceManifestPath, 'utf8'),
  ) as RawManifest;
  const articles = manifest.categories.flatMap(
    (category) => category.articles,
  );
  if (articles.length !== 30) {
    throw new Error(`Expected 30 articles, received ${articles.length}`);
  }

  mkdirSync(outputDirectory, { recursive: true });
  const results = new Array<[string, OutputRecord]>(articles.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < articles.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await syncArticle(articles[currentIndex]);
    }
  }

  await Promise.all(Array.from({ length: 4 }, () => worker()));

  const records = Object.fromEntries(results);
  writeFileSync(
    outputManifestPath,
    `${JSON.stringify(records, null, 2)}\n`,
    'utf8',
  );
  const downloaded = Object.values(records).filter(
    (record) => !record.isPlaceholder,
  ).length;
  process.stdout.write(
    `image sync complete: ${downloaded} downloaded, ${articles.length - downloaded} placeholders\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
