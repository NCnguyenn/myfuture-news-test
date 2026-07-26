import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const workspaceRoot = resolve(import.meta.dirname, '..', '..', '..');
const wrapperPath = resolve(workspaceRoot, 'scripts', 'run-node-tests.mjs');

function runWrapper(arguments_: string[]) {
  return spawnSync(process.execPath, [wrapperPath, ...arguments_], {
    cwd: workspaceRoot,
    encoding: 'utf8',
  });
}

test('forwards a non-empty test name pattern before discovered test files', async () => {
  const testDirectory = await mkdtemp(resolve(tmpdir(), 'run-node-tests-'));

  try {
    await writeFile(
      resolve(testDirectory, 'pattern.spec.ts'),
      [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        "test('included wrapper pattern', () => assert.ok(true));",
        "test('excluded wrapper pattern', () => { throw new Error('must be skipped'); });",
      ].join('\n'),
    );

    const result = runWrapper([
      '--test-dir',
      testDirectory,
      '--import',
      'tsx',
      '--test-name-pattern',
      'included wrapper pattern',
    ]);

    assert.equal(result.status, 0, result.stderr);
    assert.doesNotMatch(result.stderr, /must be skipped/);
  } finally {
    await rm(testDirectory, { recursive: true, force: true });
  }
});

test('rejects an empty test name pattern', () => {
  const result = runWrapper([
    '--test-dir',
    resolve(workspaceRoot, 'apps', 'frontend', 'test'),
    '--test-name-pattern=',
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /--test-name-pattern requires a non-empty test name pattern/);
});
