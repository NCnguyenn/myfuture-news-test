import assert from 'node:assert/strict';
import test from 'node:test';
import { ContentSanitizerService } from '../src/content/content-sanitizer.service';

test('removes unsafe markup while preserving the article allowlist', () => {
  const service = new ContentSanitizerService();

  const sanitized = service.sanitize(
    '<p onclick="alert(1)">Safe</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a><strong>Bold</strong><custom-tag>Unknown</custom-tag>',
  );

  assert.equal(
    sanitized,
    '<p>Safe</p><a rel="noopener noreferrer">bad</a><strong>Bold</strong>Unknown',
  );
});

test('forces noopener noreferrer on allowed anchor tags', () => {
  const service = new ContentSanitizerService();
  const sanitized = service.sanitize(
    '<a href="https://example.com" target="_blank">source</a>',
  );
  assert.match(sanitized, /href="https:\/\/example\.com"/);
  assert.match(sanitized, /rel="noopener noreferrer"/);
  assert.match(sanitized, /target="_blank"/);
});

test('keeps article markup while excluding foreign-content and raw-text tags', () => {
  const service = new ContentSanitizerService();
  const allowedArticleMarkup =
    '<p>Intro <strong>bold</strong> and <em>emphasis</em>.</p><h2>Heading</h2><ul><li>Item</li></ul><blockquote>Quote</blockquote><figure><img src="https://cdn.example/article.jpg" alt="Article image" loading="lazy" /><figcaption>Caption</figcaption></figure>';

  assert.equal(service.sanitize(allowedArticleMarkup), allowedArticleMarkup);

  for (const disallowedTag of ['svg', 'math', 'textarea', 'xmp']) {
    const sanitized = service.sanitize(
      `<${disallowedTag} onload="alert(1)"><img src="https://cdn.example/article.jpg" onerror="alert(1)" /><a href="javascript:alert(1)" onclick="alert(1)">link</a></${disallowedTag}>`,
    );

    assert.doesNotMatch(sanitized, new RegExp(`<${disallowedTag}`, 'i'));
    assert.doesNotMatch(sanitized, /onload|onerror|onclick|javascript:/i);
  }
});

test('rejects paired foreign-content and raw-text parser-boundary payloads', () => {
  const service = new ContentSanitizerService();
  const sanitized = service.sanitize(
    '<p>Allowed <strong>article markup</strong></p><svg><textarea></svg><script>alert(1)</script><img src="https://cdn.example/unsafe.jpg" onerror="alert(1)" /><a href="javascript:alert(1)" onclick="alert(1)">unsafe link</a></textarea></svg><math><xmp></math><script>alert(2)</script><img src="https://cdn.example/unsafe.jpg" onerror="alert(2)" /><a href="javascript:alert(2)" onclick="alert(2)">unsafe link</a></xmp></math>',
  );

  assert.match(sanitized, /<p>Allowed <strong>article markup<\/strong><\/p>/);
  assert.doesNotMatch(sanitized, /<(?:svg|math|textarea|xmp|script)\b/i);
  assert.doesNotMatch(sanitized, /onerror|onclick|javascript:/i);
});
