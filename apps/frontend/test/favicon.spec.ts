import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const workspaceRoot = path.resolve(import.meta.dirname, '..', '..', '..');

test('favicon contract: exposes a local App Router icon in the approved brand colors', () => {
  const iconPath = path.join(workspaceRoot, 'apps/frontend/app/icon.svg');

  assert.ok(existsSync(iconPath), 'Missing App Router icon asset at app/icon.svg');

  const icon = readFileSync(iconPath, 'utf8');
  assert.match(icon, /<svg\b[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(icon, /#9f1d2d/i);
  assert.match(icon, /#b88a44/i);
  assert.doesNotMatch(icon, /(?:href|xlink:href)=["']https?:\/\//i);
});
