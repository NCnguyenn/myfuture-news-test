import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import type { FastifyInstance } from 'fastify';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.factory';
import { CacheService } from '../src/cache/cache.service';
import { PrismaService } from '../src/prisma/prisma.service';

let app: NestFastifyApplication;
let fastify: FastifyInstance;

const categories = Array.from({ length: 6 }, (_, index) => ({
  id: `category-${index + 1}`,
  name: `Category ${index + 1}`,
  slug: `category-${index + 1}`,
  description: null,
  _count: { articles: 5 },
}));

before(async () => {
  const prisma = {
    category: {
      findMany: async () => categories,
      findUnique: async ({ where }: { where: { slug: string } }) =>
        categories.find((item) => item.slug === where.slug) ?? null,
    },
    article: {
      count: async () => 0,
      findMany: async () => [],
      findFirst: async () => null,
    },
  };
  const cache = {
    getJson: async () => null,
    setJson: async () => true,
  };

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .overrideProvider(CacheService)
    .useValue(cache)
    .compile();

  app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );
  configureApp(app, 'http://localhost:3000');
  await app.init();
  fastify = app.getHttpAdapter().getInstance() as FastifyInstance;
  await fastify.ready();
});

after(async () => {
  await app.close();
});

test('GET /api/categories returns six categories', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/api/categories',
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.length, 6);
});

test('invalid pagination returns the normalized 400 envelope', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/api/articles?page=0',
  });
  assert.equal(response.statusCode, 400);
  assert.equal(response.json().code, 'INVALID_REQUEST');
});

test('unknown category returns CATEGORY_NOT_FOUND', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/api/articles?category=missing-category',
  });
  assert.equal(response.statusCode, 404);
  assert.equal(response.json().code, 'CATEGORY_NOT_FOUND');
});

test('unknown article returns ARTICLE_NOT_FOUND', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/api/articles/missing-article',
  });
  assert.equal(response.statusCode, 404);
  assert.equal(response.json().code, 'ARTICLE_NOT_FOUND');
});
