import assert from 'node:assert/strict';
import test from 'node:test';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ArticlesQueryDto } from '../src/articles/articles-query.dto';

test('trims a valid article search query', async () => {
  const query = plainToInstance(ArticlesQueryDto, {
    q: '  bất động sản  ',
  });

  assert.equal(query.q, 'bất động sản');
  assert.equal((await validate(query)).length, 0);
});

test('treats an empty search query as absent', async () => {
  const query = plainToInstance(ArticlesQueryDto, { q: '   ' });

  assert.equal(query.q, undefined);
  assert.equal((await validate(query)).length, 0);
});

test('rejects search queries outside the 2 to 100 character range', async () => {
  const shortQuery = plainToInstance(ArticlesQueryDto, { q: 'a' });
  const longQuery = plainToInstance(ArticlesQueryDto, { q: 'a'.repeat(101) });

  assert.ok((await validate(shortQuery)).some((error) => error.property === 'q'));
  assert.ok((await validate(longQuery)).some((error) => error.property === 'q'));
});

test('rejects search queries without at least two letters or numbers', async () => {
  const punctuationOnly = plainToInstance(ArticlesQueryDto, { q: '--' });

  assert.ok(
    (await validate(punctuationOnly)).some((error) => error.property === 'q'),
  );
});
