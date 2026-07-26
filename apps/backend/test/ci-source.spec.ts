import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(__dirname, '..', '..', '..');

test('CI runs every recruiter quality gate', () => {
  const source = readFileSync(
    path.join(root, '.github/workflows/ci.yml'),
    'utf8',
  );
  for (const command of [
    'npm ci',
    'npm run lint',
    'npm run db:validate',
    'npm run db:generate',
    'npm run test:web',
    'npm run test:api',
    'npm run typecheck',
    'npm run build',
  ]) {
    assert.match(
      source,
      new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    );
  }

  assert.match(
    source,
    /matrix:\s*[\s\S]*?node-version:\s*\[20,\s*22\]/,
  );
  assert.match(source, /node-version:\s*\$\{\{\s*matrix\.node-version\s*\}\}/);
});

test('Nest entrypoint imports NestJS directly for Vercel detection', () => {
  const source = readFileSync(
    path.join(root, 'apps/backend/src/main.ts'),
    'utf8',
  );

  assert.match(source, /import\s+\{\s*NestFactory\s*\}\s+from\s+'@nestjs\/core';/);
  assert.match(source, /import\s+\{\s*FastifyAdapter\s*,\s*NestFastifyApplication\s*\}\s+from\s+'@nestjs\/platform-fastify';/);
  assert.match(source, /import\s+\{\s*getRuntimeEnv\s*\}\s+from\s+'\.\/config\/runtime-env';/);
  assert.match(source, /import\s+\{\s*configureApp\s*\}\s+from\s+'\.\/app\.factory';/);
  assert.doesNotMatch(source, /createApp/);
});

test('database verifier loads the root environment before creating Prisma', () => {
  const source = readFileSync(
    path.join(root, 'scripts/verify-seed.ts'),
    'utf8',
  );

  assert.match(source, /import\s+'dotenv\/config';/);
  assert.ok(
    source.indexOf("import 'dotenv/config';") <
      source.indexOf('new PrismaClient()'),
  );
});
