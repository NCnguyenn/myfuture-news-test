import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..', '..', '..');

test('canonical submission data lives under data/news', () => {
  const researchDirectory = path.join(root, 'docs', 'research');
  const researchFiles = ['2026-07-25-editorial-expansion-sources.md'];

  assert.equal(existsSync(path.join(root, 'data/news/articles.json')), true);
  assert.equal(existsSync(path.join(root, 'data/news/images.json')), true);
  assert.equal(existsSync(path.join(researchDirectory, researchFiles[0])), true);
  assert.deepEqual(
    readdirSync(researchDirectory, { recursive: true }).sort(),
    researchFiles,
  );
  assert.equal(
    existsSync(
      path.join(
        root,
        'apps/frontend/public/images/news/researched/manifest.json',
      ),
    ),
    false,
  );
});

test('seed and preview loaders use canonical data paths', () => {
  const files = [
    {
      path: 'scripts/lib/official-news-data.ts',
      canonicalPath: 'data/news/articles.json',
    },
    {
      path: 'apps/frontend/lib/researched-news.ts',
      canonicalPath: 'data/news/articles.json',
    },
    {
      path: 'apps/frontend/data/researched-images.ts',
      canonicalPath: 'data/news/images.json',
    },
  ];
  for (const file of files) {
    const source = readFileSync(path.join(root, file.path), 'utf8');
    assert.match(source, new RegExp(file.canonicalPath.replace('.', '\\.'), ''));
    assert.doesNotMatch(source, /docs[\\/]research/);
  }
});
