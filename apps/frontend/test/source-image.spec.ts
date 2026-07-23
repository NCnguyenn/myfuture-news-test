import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extensionForContentType,
  extractOgImage,
} from '../lib/source-image';

test('extracts an absolute og:image URL', () => {
  const html =
    '<meta property="og:image" content="https://cdn.example.com/a.jpg">';

  assert.equal(
    extractOgImage(html, 'https://example.com/article'),
    'https://cdn.example.com/a.jpg',
  );
});

test('resolves a relative og:image URL against the source page', () => {
  const html = '<meta content="/images/a.webp" property="og:image">';

  assert.equal(
    extractOgImage(html, 'https://example.com/news/article'),
    'https://example.com/images/a.webp',
  );
});

test('rejects non-http image URLs and unsupported response types', () => {
  assert.equal(
    extractOgImage(
      '<meta property="og:image" content="data:image/png;base64,abc">',
      'https://example.com/article',
    ),
    null,
  );
  assert.equal(extensionForContentType('image/jpeg; charset=binary'), 'jpg');
  assert.equal(extensionForContentType('text/html'), null);
});
