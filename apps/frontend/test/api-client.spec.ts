import assert from 'node:assert/strict';
import test from 'node:test';
import { getArticles } from '../lib/api-client';

test('serializes a Vietnamese article search query', async () => {
  let requestedUrl = '';
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request) => {
    requestedUrl = String(input);
    return new Response(
      JSON.stringify({
        data: [],
        meta: {
          page: 1,
          limit: 6,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  }) as typeof fetch;

  try {
    await getArticles({ q: 'bất động sản', page: 1, limit: 6 });
    assert.match(
      requestedUrl,
      /q=b%E1%BA%A5t\+%C4%91%E1%BB%99ng\+s%E1%BA%A3n/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('forwards an abort signal to the upstream article request', async () => {
  let receivedSignal: AbortSignal | null | undefined;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (
    _input: string | URL | Request,
    init?: RequestInit,
  ) => {
    receivedSignal = init?.signal;
    return new Response(
      JSON.stringify({
        data: [],
        meta: {
          page: 1,
          limit: 6,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  }) as typeof fetch;
  const controller = new AbortController();

  try {
    await getArticles({ q: 'nhà ở' }, { signal: controller.signal });
    assert.equal(receivedSignal, controller.signal);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
