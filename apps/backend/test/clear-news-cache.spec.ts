import assert from 'node:assert/strict';
import test from 'node:test';
import { clearNewsCache } from '../../../scripts/lib/clear-news-cache';

test('clearNewsCache skips when REDIS_URL is missing', async () => {
  const result = await clearNewsCache(undefined);
  assert.equal(result.skipped, true);
  assert.equal(result.deleted, 0);
  assert.match(result.reason ?? '', /REDIS_URL/);
});

test('clearNewsCache skips when REDIS_URL is blank', async () => {
  const result = await clearNewsCache('   ');
  assert.equal(result.skipped, true);
  assert.equal(result.deleted, 0);
});
