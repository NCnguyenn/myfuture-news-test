import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
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

test('root npm test runs both application test suites', () => {
  const packageJson = JSON.parse(
    readFileSync(path.join(root, 'package.json'), 'utf8'),
  ) as { scripts?: Record<string, string> };

  assert.equal(
    packageJson.scripts?.test,
    'npm run test:web && npm run test:api',
  );
});

test('frontend lint enables the official Next.js rules', () => {
  const packageJson = JSON.parse(
    readFileSync(path.join(root, 'package.json'), 'utf8'),
  ) as { devDependencies?: Record<string, string> };
  const eslintSource = readFileSync(
    path.join(root, 'eslint.config.mjs'),
    'utf8',
  );

  assert.ok(packageJson.devDependencies?.['@next/eslint-plugin-next']);
  assert.match(eslintSource, /@next\/eslint-plugin-next/);
  assert.match(eslintSource, /'@next\/next'/);
  assert.match(eslintSource, /core-web-vitals/);

  const eslintResult = spawnSync(
    process.execPath,
    [
      path.join(root, 'node_modules/eslint/bin/eslint.js'),
      '--stdin',
      '--stdin-filename',
      'apps/frontend/lint-contract.tsx',
    ],
    {
      cwd: root,
      encoding: 'utf8',
      input: '<a href="/ban-tin">Bản tin</a>',
    },
  );

  assert.match(
    eslintResult.stdout,
    /@next\/next\/no-html-link-for-pages/,
    'official Next.js rules must detect internal HTML links in the App Router',
  );
});

test('frontend lint resolves the App Router from the frontend workspace', () => {
  const eslintResult = spawnSync(
    process.execPath,
    [
      path.join(root, 'node_modules/eslint/bin/eslint.js'),
      '--stdin',
      '--stdin-filename',
      'lint-contract.tsx',
    ],
    {
      cwd: path.join(root, 'apps/frontend'),
      encoding: 'utf8',
      input: '<a href="/ban-tin">Bản tin</a>',
    },
  );

  assert.match(
    eslintResult.stdout,
    /@next\/next\/no-html-link-for-pages/,
    'official Next.js rules must resolve App Router routes from workspace commands',
  );
});

test('Next build detects the official plugin in the flat config', () => {
  const eslintResult = spawnSync(
    process.execPath,
    [
      path.join(root, 'node_modules/eslint/bin/eslint.js'),
      '--print-config',
      'eslint.config.mjs',
    ],
    {
      cwd: root,
      encoding: 'utf8',
    },
  );
  const config = JSON.parse(eslintResult.stdout) as { plugins?: string[] };

  assert.ok(
    config.plugins?.includes('@next/next'),
    'the Next.js build must see the official plugin when it inspects the config file',
  );
});

test('frontend build does not bypass ESLint failures', () => {
  const nextConfigSource = readFileSync(
    path.join(root, 'apps/frontend/next.config.ts'),
    'utf8',
  );

  assert.doesNotMatch(nextConfigSource, /ignoreDuringBuilds\s*:\s*true/);
});
