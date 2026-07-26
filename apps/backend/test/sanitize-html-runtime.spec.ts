import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import test from 'node:test';

test('loads sanitize-html without Node experimental require-module support', () => {
  const result = spawnSync(
    process.execPath,
    ['--no-experimental-require-module', '-e', "require('sanitize-html')"],
    {
      cwd: resolve(__dirname, '..'),
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0, result.stderr);
});
