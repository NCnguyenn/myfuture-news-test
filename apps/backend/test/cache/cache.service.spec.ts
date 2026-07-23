import assert from 'node:assert/strict';
import test from 'node:test';
import { CacheService } from '../../src/cache/cache.service';

function createRedisDouble(overrides: Record<string, unknown> = {}) {
  const calls: Array<unknown[]> = [];
  const redis = {
    status: 'ready',
    on: () => redis,
    connect: async () => undefined,
    disconnect: () => undefined,
    get: async () => null,
    set: async (...args: unknown[]) => {
      calls.push(args);
      return 'OK';
    },
    ...overrides,
  };
  return { redis, calls };
}

test('gets JSON and sets JSON with the requested TTL', async () => {
  const { redis, calls } = createRedisDouble({
    get: async () => JSON.stringify({ data: ['cached'] }),
  });
  const service = new CacheService(redis as never);

  assert.deepEqual(await service.getJson('news:test'), { data: ['cached'] });
  assert.equal(await service.setJson('news:test', { data: ['fresh'] }, 300), true);
  assert.deepEqual(calls, [['news:test', JSON.stringify({ data: ['fresh'] }), 'EX', 300]]);
});

test('fails soft when Redis get and set throw', async () => {
  const { redis } = createRedisDouble({
    get: async () => {
      throw new Error('Redis unavailable');
    },
    set: async () => {
      throw new Error('Redis unavailable');
    },
  });
  const service = new CacheService(redis as never);

  assert.equal(await service.getJson('news:test'), null);
  assert.equal(await service.setJson('news:test', { ok: true }, 300), false);
});
