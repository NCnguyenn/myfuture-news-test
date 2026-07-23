import assert from 'node:assert/strict';
import test from 'node:test';
import { markdownToSafeHtml } from '../lib/markdown-to-html';

test('renders headings and paragraphs used by researched articles', () => {
  assert.equal(
    markdownToSafeHtml('## Tiêu đề\n\nĐoạn thứ nhất.\n\n### Chi tiết'),
    '<h2>Tiêu đề</h2>\n<p>Đoạn thứ nhất.</p>\n<h3>Chi tiết</h3>',
  );
});

test('escapes raw HTML before rendering', () => {
  const html = markdownToSafeHtml('<script>alert(1)</script>');
  assert.equal(html, '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
  assert.doesNotMatch(html, /<script>/);
});

test('allows http links and neutralizes dangerous protocols', () => {
  assert.equal(
    markdownToSafeHtml('[Nguồn](https://example.com)'),
    '<p><a href="https://example.com" target="_blank" rel="noreferrer">Nguồn</a></p>',
  );
  assert.equal(
    markdownToSafeHtml('[Không an toàn](javascript:alert(1))'),
    '<p>Không an toàn</p>',
  );
});

test('renders consecutive list items as semantic lists', () => {
  assert.equal(
    markdownToSafeHtml('- Mục một\n- Mục hai\n\n1. Bước một\n2. Bước hai'),
    '<ul><li>Mục một</li><li>Mục hai</li></ul>\n<ol><li>Bước một</li><li>Bước hai</li></ol>',
  );
});
