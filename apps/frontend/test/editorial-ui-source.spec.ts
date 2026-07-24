import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

test('uses the approved MyFuture red visual system', () => {
  const css = read('apps/frontend/app/globals.css');
  assert.match(css, /--brand:\s*#[0-9a-f]{6}/i);
  assert.doesNotMatch(css, /--brand:\s*#087f82/i);
  assert.match(css, /--content-max:\s*1200px/);
});

test('renders exactly one overview link plus API category links', () => {
  const source = read('apps/frontend/components/news/NewsTabs.tsx');
  assert.match(source, />Toàn cảnh</);
  assert.match(source, /categories\.map/);
  assert.match(source, /aria-current/);
});

test('does not add unsupported header controls', () => {
  const source = read('apps/frontend/components/layout/Header.tsx');
  assert.doesNotMatch(source, /Đăng nhập|Tìm kiếm|MyFuture Pro/);
});
