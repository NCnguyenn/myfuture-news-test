import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..', '..', '..');

test('canonical submission data lives under data/news', () => {
  assert.equal(existsSync(path.join(root, 'data/news/articles.json')), true);
  assert.equal(existsSync(path.join(root, 'data/news/images.json')), true);
  assert.equal(existsSync(path.join(root, 'docs', 'research')), false);
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
    'scripts/lib/official-news-data.ts',
    'apps/frontend/lib/researched-news.ts',
    'apps/frontend/data/researched-images.ts',
  ];
  for (const file of files) {
    const source = readFileSync(path.join(root, file), 'utf8');
    assert.match(source, /data[\\/]news/);
    assert.doesNotMatch(source, /docs[\\/]research/);
  }
});
