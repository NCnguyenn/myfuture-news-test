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
  assert.equal(result.databaseUrl, productionEnv.DATABASE_URL);
  assert.equal(result.directUrl, productionEnv.DIRECT_URL);
  assert.equal(result.redisUrl, productionEnv.REDIS_URL);
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

test('sanitizes malformed URL errors without retaining the input', () => {
  const syntheticSecret = 'synthetic-runtime-secret';
  let caught: unknown;

  try {
    getRuntimeEnv({
      ...productionEnv,
      DATABASE_URL: `postgresql://user:${syntheticSecret}@[`,
    });
  } catch (error: unknown) {
    caught = error;
  }

  assert.ok(caught instanceof Error);
  const exposedErrorText = [
    caught.message,
    caught.stack ?? '',
    JSON.stringify(caught),
  ].join('\n');
  assert.equal(exposedErrorText.includes(syntheticSecret), false);
  assert.equal(caught.message, 'DATABASE_URL must be a valid URL');
  assert.equal(
    Object.prototype.hasOwnProperty.call(caught, 'cause'),
    false,
  );
});

test('normalizes a trailing slash from WEB_ORIGIN', () => {
  const result = getRuntimeEnv({
    ...productionEnv,
    WEB_ORIGIN: 'https://web.example.test/',
  });
  assert.equal(result.webOrigin, 'https://web.example.test');
});

for (const [label, webOrigin] of [
  ['path', 'https://web.example.test/api'],
  ['query', 'https://web.example.test/?mode=production'],
  ['fragment', 'https://web.example.test/#health'],
  ['credentials', 'https://user@web.example.test'],
] as const) {
  test(`rejects WEB_ORIGIN with ${label}`, () => {
    assert.throws(
      () => getRuntimeEnv({ ...productionEnv, WEB_ORIGIN: webOrigin }),
      /WEB_ORIGIN must be an origin/,
    );
  });
}

test('rejects unsupported URL protocols', () => {
  for (const [name, value] of [
    ['WEB_ORIGIN', 'ftp://web.example.test'],
    ['DATABASE_URL', 'mysql://db.example.test/news'],
    ['DIRECT_URL', 'https://db.example.test/news'],
    ['REDIS_URL', 'https://redis.example.test'],
  ] as const) {
    assert.throws(
      () => getRuntimeEnv({ ...productionEnv, [name]: value }),
      new RegExp(`${name} has an unsupported protocol`),
    );
  }
});

test('prefers PORT over API_PORT', () => {
  const result = getRuntimeEnv({
    ...productionEnv,
    PORT: '3100',
    API_PORT: '4100',
  });
  assert.equal(result.port, 3100);
});

test('uses API_PORT when PORT is absent', () => {
  const result = getRuntimeEnv({ ...productionEnv, API_PORT: '4100' });
  assert.equal(result.port, 4100);
});

test('rejects ports outside the supported integer range', () => {
  for (const port of ['0', '65536', '1.5', 'not-a-number']) {
    assert.throws(
      () => getRuntimeEnv({ ...productionEnv, PORT: port }),
      /PORT must be an integer between 1 and 65535/,
    );
  }
});
