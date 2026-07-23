import assert from 'node:assert/strict';
import test from 'node:test';
import { ContentSanitizerService } from '../src/content/content-sanitizer.service';

test('removes unsafe markup while preserving the article allowlist', () => {
  const service = new ContentSanitizerService();

  const sanitized = service.sanitize(
    '<p onclick="alert(1)">Safe</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a><strong>Bold</strong><custom-tag>Unknown</custom-tag>',
  );

  assert.equal(sanitized, '<p>Safe</p><a>bad</a><strong>Bold</strong>Unknown');
});
