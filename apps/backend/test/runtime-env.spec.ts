import assert from 'node:assert/strict';
import test from 'node:test';
import { getRuntimeEnv } from '../src/config/runtime-env';

const productionEnv = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://user:pass@db.example.test/news',
  DIRECT_URL: 'postgresql://user:pass@db.example.test/news',
  REDIS_URL: 'rediss://default:pass@redis.example.test:6379',
  WEB_ORIGIN: 'https://web.example.test',
};

test('validates production URLs and Vercel PORT', () => {
  const result = getRuntimeEnv({ ...productionEnv, PORT: '3000' });
  assert.equal(result.port, 3000);
  assert.equal(result.webOrigin, 'https://web.example.test');
});

test('rejects a missing production variable', () => {
  const { REDIS_URL: _removed, ...env } = productionEnv;
  assert.throws(() => getRuntimeEnv(env), /REDIS_URL is required/);
});

test('uses safe local defaults in development', () => {
  const result = getRuntimeEnv({ NODE_ENV: 'development' });
  assert.equal(result.port, 4000);
  assert.equal(result.webOrigin, 'http://localhost:3000');
});
