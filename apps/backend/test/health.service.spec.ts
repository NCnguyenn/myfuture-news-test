import assert from 'node:assert/strict';
import test from 'node:test';
import { HealthService } from '../src/health/health.service';

function createHealthService(postgresUp: boolean, redisUp: boolean) {
  const prisma = {
    $queryRaw: async () => {
      if (!postgresUp) throw new Error('PostgreSQL unavailable');
      return 1;
    },
  };
  const redis = {
    status: 'ready',
    connect: async () => undefined,
    ping: async () => {
      if (!redisUp) throw new Error('Redis unavailable');
      return 'PONG';
    },
  };
  const service = new HealthService(prisma as never);
  Object.defineProperty(service, 'getRedisClient', {
    value: () => redis,
  });
  return service;
}

test('reports error when PostgreSQL is down even if Redis is up', async () => {
  const result = await createHealthService(false, true).checkHealth();
  assert.equal(result.data.status, 'error');
  assert.equal(result.data.checks.postgres, 'down');
  assert.equal(result.data.checks.redis, 'up');
});

test('reports degraded when Redis is down but PostgreSQL is up', async () => {
  const result = await createHealthService(true, false).checkHealth();
  assert.equal(result.data.status, 'degraded');
  assert.equal(result.data.checks.postgres, 'up');
  assert.equal(result.data.checks.redis, 'down');
});
