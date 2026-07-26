import assert from 'node:assert/strict';
import test from 'node:test';
import { visibleServerMarkup } from '../../../scripts/lib/production-smoke-html';

test('production smoke ignores not-found copy serialized inside RSC scripts', () => {
  const html = [
    '<main>',
    '<h1>Kết quả tìm kiếm</h1>',
    '<p>Tìm thấy 36 bài viết cho “hung yen”.</p>',
    '</main>',
    '<script>self.__next_f.push(["Không tìm thấy nội dung"])</script>',
  ].join('');

  const visible = visibleServerMarkup(html);

  assert.match(visible, /Kết quả tìm kiếm/);
  assert.doesNotMatch(visible, /Không tìm thấy nội dung/);
});

test('production smoke retains a visible not-found page', () => {
  const html =
    '<main><h1>Không tìm thấy nội dung</h1><p>Quay lại Bản tin</p></main>';

  assert.match(visibleServerMarkup(html), /Không tìm thấy nội dung/);
});
