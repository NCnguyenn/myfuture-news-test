import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const usage =
  'Usage: node scripts/run-node-tests.mjs --test-dir <directory> [--import <module>] [--require <module>] [--test-name-pattern <pattern>]';

function exitWithUsage(message) {
  console.error(`${message}\n${usage}`);
  process.exit(1);
}

let values;

try {
  ({ values } = parseArgs({
    options: {
      'test-dir': { type: 'string' },
      import: { type: 'string', multiple: true },
      require: { type: 'string', multiple: true },
      'test-name-pattern': { type: 'string' },
    },
    strict: true,
  }));
} catch (error) {
  exitWithUsage(error.message);
}

if (!values['test-dir']?.trim()) {
  exitWithUsage('Missing required --test-dir argument.');
}

for (const option of ['import', 'require']) {
  if (values[option]?.some((moduleName) => !moduleName.trim())) {
    exitWithUsage(`--${option} requires a non-empty module name.`);
  }
}

if (values['test-name-pattern'] !== undefined && !values['test-name-pattern'].trim()) {
  exitWithUsage('--test-name-pattern requires a non-empty test name pattern.');
}

const testDirectory = resolve(values['test-dir']);
const testFiles = [];

async function discoverTests(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      await discoverTests(entryPath);
    } else if (entry.isFile() && entry.name.endsWith('.spec.ts')) {
      testFiles.push(entryPath);
    }
  }
}

try {
  await discoverTests(testDirectory);
} catch (error) {
  console.error(`Unable to discover tests under "${testDirectory}": ${error.message}`);
  process.exit(1);
}

testFiles.sort();

if (testFiles.length === 0) {
  console.error(`No *.spec.ts tests found under "${testDirectory}".`);
  process.exit(1);
}

const loaderArguments = [];

for (const moduleName of values.import ?? []) {
  loaderArguments.push('--import', moduleName);
}

for (const moduleName of values.require ?? []) {
  loaderArguments.push('--require', moduleName);
}

if (values['test-name-pattern']) {
  loaderArguments.push('--test-name-pattern', values['test-name-pattern']);
}

const result = spawnSync(
  process.execPath,
  [...loaderArguments, '--test', ...testFiles],
  { stdio: 'inherit' },
);

if (result.error) {
  console.error(`Unable to start the Node.js test runner: ${result.error.message}`);
  process.exit(1);
}

if (result.status === null) {
  console.error(`Node.js test runner terminated by signal ${result.signal ?? 'unknown'}.`);
  process.exit(1);
}

process.exit(result.status);
