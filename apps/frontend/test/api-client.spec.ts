import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveApiBaseUrl } from '../lib/api-client';

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
