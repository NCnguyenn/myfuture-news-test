import assert from 'node:assert/strict';

type Category = { id: string; name: string; slug: string };
type Article = {
  slug: string;
  title: string;
  thumbnailUrl: string;
  coverImageUrl?: string | null;
  category: { slug: string };
};
type ListResponse = {
  data: Article[];
  meta: { totalItems: number };
};

const REQUEST_TIMEOUT_MS = 15_000;

function requiredOrigin(name: 'WEB_BASE_URL' | 'API_BASE_URL'): string {
  const value = process.env[name]?.trim().replace(/\/+$/, '');
  if (!value) throw new Error(`${name} is required`);
  const url = new URL(value);
  assert.equal(url.protocol, 'https:', `${name} must use HTTPS`);
  return value;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  return fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

async function expectOk(url: string): Promise<Response> {
  const response = await fetchWithTimeout(url);
  assert.equal(response.ok, true, `${url} returned unexpected ${response.status}`);
  return response;
}

async function json<T>(url: string): Promise<T> {
  return (await (await expectOk(url)).json()) as T;
}

async function expectExpectedMissingApi(url: string): Promise<void> {
  const response = await fetchWithTimeout(url);
  assert.equal(
    response.status,
    404,
    `${url} should be the expected missing-resource 404; received ${response.status}`,
  );
}

async function expectPublicHtml(web: string, path: string): Promise<string> {
  const response = await expectOk(`${web}${path}`);
  const contentType = response.headers.get('content-type') ?? '';
  assert.match(contentType, /text\/html/i, `${path} must return HTML`);

  const finalUrl = new URL(response.url);
  assert.equal(finalUrl.origin, new URL(web).origin, `${path} left the public origin`);
  assert.doesNotMatch(
    finalUrl.pathname,
    /(?:^|\/)(?:login|dang-nhap)(?:\/|$)/i,
    `${path} must be publicly accessible without login`,
  );
  return response.text();
}

async function expectStaticImage(
  web: string,
  thumbnailUrl: string,
): Promise<void> {
  const webOrigin = new URL(web).origin;
  const imageUrl = new URL(thumbnailUrl, web);
  assert.equal(imageUrl.origin, webOrigin, 'article thumbnail must be a public static image');
  assert.match(
    imageUrl.pathname,
    /^\/images\/news\//,
    'article thumbnail must use the static news image path',
  );

  const staticImage = await expectOk(imageUrl.toString());
  assert.match(
    staticImage.headers.get('content-type') ?? '',
    /^image\//i,
    'static article image must return an image',
  );

}

async function expectOptimizerFromNewsHtml(web: string, html: string): Promise<void> {
  const match = html.match(/\bsrc=["']([^"']*\/_next\/image\?[^"']+)["']/i);
  assert.ok(match, '/ban-tin HTML must render a Next Image optimizer URL');

  const optimizerUrl = new URL(match[1].replace(/&amp;/g, '&'), web);
  assert.equal(optimizerUrl.origin, new URL(web).origin, 'Next Image URL must use the public origin');
  assert.equal(optimizerUrl.pathname, '/_next/image', 'news HTML must use the Next Image optimizer');
  const optimizedImage = await expectOk(optimizerUrl.toString());
  assert.match(
    optimizedImage.headers.get('content-type') ?? '',
    /^image\//i,
    'Next Image optimizer must return an image',
  );
  assert.ok(
    (await optimizedImage.arrayBuffer()).byteLength > 0,
    'Next Image optimizer returned an empty image',
  );
}

async function main() {
  const web = requiredOrigin('WEB_BASE_URL');
  const api = requiredOrigin('API_BASE_URL');

  const health = await json<{
    data: {
      status: string;
      checks: { postgres: string; redis: string };
    };
  }>(`${api}/health`);
  assert.equal(health.data.status, 'ok');
  assert.equal(health.data.checks.postgres, 'up');
  assert.equal(health.data.checks.redis, 'up');

  const categories = await json<{ data: Category[] }>(`${api}/categories`);
  assert.equal(categories.data.length, 6);

  const articles = await json<ListResponse>(
    `${api}/articles?page=1&limit=50`,
  );
  assert.equal(articles.meta.totalItems, 30);
  assert.equal(articles.data.length, 30);

  const aggregatePageTwo = await json<ListResponse>(
    `${api}/articles?page=2&limit=4`,
  );
  assert.equal(aggregatePageTwo.meta.totalItems, 30);
  assert.equal(aggregatePageTwo.data.length, 4);

  const article = articles.data[0];
  assert.ok(article, 'aggregate article list must contain an article');
  const detail = await json<{ data: Article }>(
    `${api}/articles/${encodeURIComponent(article.slug)}`,
  );
  assert.equal(detail.data.slug, article.slug);

  await expectExpectedMissingApi(`${api}/articles?category=missing-category`);
  await expectExpectedMissingApi(`${api}/articles/missing-article`);

  await expectPublicHtml(web, '/');
  const newsHtml = await expectPublicHtml(web, '/ban-tin');
  await expectPublicHtml(web, '/ban-tin?page=2');
  await expectPublicHtml(web, '/ban-tin.html');

  for (const category of categories.data) {
    const categoryArticles = await json<ListResponse>(
      `${api}/articles?category=${encodeURIComponent(category.slug)}&page=1&limit=4`,
    );
    assert.equal(categoryArticles.meta.totalItems, 5);
    assert.equal(
      categoryArticles.data.every(
        (categoryArticle) => categoryArticle.category.slug === category.slug,
      ),
      true,
    );
    const categoryPageTwo = await json<ListResponse>(
      `${api}/articles?category=${encodeURIComponent(category.slug)}&page=2&limit=4`,
    );
    assert.equal(categoryPageTwo.meta.totalItems, 5);
    assert.equal(categoryPageTwo.data.length, 1);
    assert.equal(
      categoryPageTwo.data.every(
        (categoryArticle) => categoryArticle.category.slug === category.slug,
      ),
      true,
    );
    await expectPublicHtml(web, `/ban-tin/chuyen-muc/${category.slug}`);
    await expectPublicHtml(web, `/ban-tin/chuyen-muc/${category.slug}?page=2`);
  }

  await expectPublicHtml(web, `/ban-tin/${article.slug}`);
  await expectStaticImage(web, detail.data.thumbnailUrl);
  await expectOptimizerFromNewsHtml(web, newsHtml);

  console.log(
    JSON.stringify({
      status: 'ok',
      categories: categories.data.length,
      articles: articles.meta.totalItems,
      category: article.category.slug,
      article: article.slug,
    }),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
