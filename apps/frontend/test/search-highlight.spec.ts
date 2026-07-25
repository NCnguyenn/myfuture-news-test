import assert from 'node:assert/strict';
import test from 'node:test';
import { splitSearchHighlight } from '../lib/search-highlight';

test('highlights accented Vietnamese words for an unaccented query', () => {
  assert.deepEqual(
    splitSearchHighlight('Thị trường bất động sản Hà Nội', 'bat dong san'),
    [
      { text: 'Thị trường ', highlighted: false },
      { text: 'bất động sản', highlighted: true },
      { text: ' Hà Nội', highlighted: false },
    ],
  );
});

test('returns one safe plain-text segment when there is no match', () => {
  assert.deepEqual(
    splitSearchHighlight('<script>alert(1)</script>', 'nhà ở'),
    [{ text: '<script>alert(1)</script>', highlighted: false }],
  );
});
