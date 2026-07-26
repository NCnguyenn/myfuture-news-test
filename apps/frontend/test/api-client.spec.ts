import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ApiClientError,
  buildArticlesPath,
  createNewsApiReader,
  resolveApiBaseUrl,
} from '../lib/api-client';

type NewsRead = (path: string) => Promise<unknown>;
type CacheFactory = (
  reader: NewsRead,
  keyParts?: string[],
  options?: { revalidate?: number | false; tags?: string[] },
) => NewsRead;

function createMemoryCache(): CacheFactory {
  return (reader) => {
    const values = new Map<string, unknown>();
    return async (path) => {
      if (values.has(path)) return values.get(path);
      const value = await reader(path);
      values.set(path, value);
      return value;
    };
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

test('uses the configured API URL without trailing slashes', () => {
  assert.equal(
    resolveApiBaseUrl({
      NODE_ENV: 'production',
      API_BASE_URL: 'https://api.example.test/api///',
    }),
    'https://api.example.test/api',
  );
});

test('rejects a missing production API URL', () => {
  assert.throws(
    () => resolveApiBaseUrl({ NODE_ENV: 'production' }),
    /API_BASE_URL is required in production/,
  );
});

test('keeps the local API default outside production', () => {
  assert.equal(
    resolveApiBaseUrl({ NODE_ENV: 'development' }),
    'http://localhost:4000/api',
  );
});

test('keeps distinct request paths in distinct cache entries', async () => {
  const requestedUrls: string[] = [];
  const fetchImpl: typeof fetch = async (input) => {
    const url = String(input);
    requestedUrls.push(url);
    return jsonResponse({ url });
  };
  const read = createNewsApiReader({
    cache: createMemoryCache(),
    fetchImpl,
    resolveBaseUrl: () => 'https://api.example.test/api',
  });

  const categories = await read<{ url: string }>('/categories');
  const articles = await read<{ url: string }>('/articles?page=2');

  assert.equal(categories.url, 'https://api.example.test/api/categories');
  assert.equal(articles.url, 'https://api.example.test/api/articles?page=2');
  assert.deepEqual(requestedUrls, [
    'https://api.example.test/api/categories',
    'https://api.example.test/api/articles?page=2',
  ]);
});

test('reuses a cached successful read', async () => {
  let fetchCalls = 0;
  const fetchImpl: typeof fetch = async () => {
    fetchCalls += 1;
    return jsonResponse({ fetchCalls });
  };
  const read = createNewsApiReader({
    cache: createMemoryCache(),
    fetchImpl,
    resolveBaseUrl: () => 'https://api.example.test/api',
  });

  const first = await read<{ fetchCalls: number }>('/categories');
  const second = await read<{ fetchCalls: number }>('/categories');

  assert.deepEqual(first, { fetchCalls: 1 });
  assert.deepEqual(second, { fetchCalls: 1 });
  assert.equal(fetchCalls, 1);
});

test('retries a failed read because failures are not cached', async () => {
  let fetchCalls = 0;
  const fetchImpl: typeof fetch = async () => {
    fetchCalls += 1;
    return fetchCalls === 1
      ? jsonResponse({ message: 'temporarily unavailable' }, 503)
      : jsonResponse({ data: 'recovered' });
  };
  const read = createNewsApiReader({
    cache: createMemoryCache(),
    fetchImpl,
    resolveBaseUrl: () => 'https://api.example.test/api',
  });

  await assert.rejects(
    read('/articles'),
    /temporarily unavailable/,
  );
  assert.deepEqual(await read('/articles'), { data: 'recovered' });
  assert.equal(fetchCalls, 2);
});

test('supplies the 8,000ms abort signal to fetch', async () => {
  const controller = new AbortController();
  const timeoutDelays: number[] = [];
  let receivedSignal: AbortSignal | null | undefined;
  const fetchImpl: typeof fetch = async (_input, init) => {
    receivedSignal = init?.signal;
    return jsonResponse({ data: [] });
  };
  const read = createNewsApiReader({
    cache: createMemoryCache(),
    fetchImpl,
    resolveBaseUrl: () => 'https://api.example.test/api',
    timeoutSignal: (delay) => {
      timeoutDelays.push(delay);
      return controller.signal;
    },
  });

  await read('/categories');

  assert.deepEqual(timeoutDelays, [8_000]);
  assert.equal(receivedSignal, controller.signal);
});

test('serializes a Vietnamese article search query', () => {
  assert.match(
    buildArticlesPath({ q: 'bất động sản', page: 1, limit: 6 }),
    /q=b%E1%BA%A5t\+%C4%91%E1%BB%99ng\+s%E1%BA%A3n/,
  );
});

test('combines a caller abort signal with the upstream timeout', async () => {
  const caller = new AbortController();
  const timeout = new AbortController();
  let receivedSignal: AbortSignal | null | undefined;
  const fetchImpl: typeof fetch = async (_input, init) => {
    receivedSignal = init?.signal;
    return jsonResponse({ data: [] });
  };
  const read = createNewsApiReader({
    cache: createMemoryCache(),
    fetchImpl,
    resolveBaseUrl: () => 'https://api.example.test/api',
    timeoutSignal: () => timeout.signal,
  });

  await read('/articles?q=ha-noi', { signal: caller.signal });
  assert.equal(receivedSignal?.aborted, false);

  caller.abort();
  assert.equal(receivedSignal?.aborted, true);
});

test('preserves non-2xx status, message, and code in ApiClientError', async () => {
  const fetchImpl: typeof fetch = async () =>
    jsonResponse(
      {
        message: 'Article payload is invalid',
        code: 'ARTICLE_INVALID',
      },
      422,
    );
  const read = createNewsApiReader({
    cache: createMemoryCache(),
    fetchImpl,
    resolveBaseUrl: () => 'https://api.example.test/api',
  });

  await assert.rejects(
    read('/articles/bad-slug'),
    (error) => {
      assert.ok(error instanceof ApiClientError);
      assert.equal(error.status, 422);
      assert.equal(error.message, 'Article payload is invalid');
      assert.equal(error.code, 'ARTICLE_INVALID');
      return true;
    },
  );
});
