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
});
