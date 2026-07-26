import sanitizeHtml from 'sanitize-html';

export type SearchMatchedField = 'title' | 'excerpt' | 'category' | 'body';

export type SearchableArticle = {
  title: string;
  excerpt: string;
  contentHtml: string;
  category: { name: string };
};

export type ArticleSearchMatch = {
  score: number;
  searchSnippet: string;
  matchedFields: SearchMatchedField[];
};

export function normalizeVietnameseSearch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('vi-VN')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function plainText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
}

function containsAllTokens(value: string, tokens: string[]): boolean {
  return tokens.every((token) => value.includes(token));
}

function makeSnippet(text: string, tokens: string[]): string {
  const words = text.split(/\s+/);
  const matchIndex = words.findIndex((word) => {
    const normalized = normalizeVietnameseSearch(word);
    return tokens.some((token) => normalized.includes(token));
  });
  const start = Math.max(0, matchIndex < 0 ? 0 : matchIndex - 8);
  const end = Math.min(words.length, start + 24);
  const snippet = words.slice(start, end).join(' ');

  return `${start > 0 ? '…' : ''}${snippet}${end < words.length ? '…' : ''}`;
}

export function rankArticleSearch(
  article: SearchableArticle,
  query: string,
): ArticleSearchMatch | null {
  const normalizedQuery = normalizeVietnameseSearch(query);
  if (!normalizedQuery) return null;

  const tokens = normalizedQuery.split(' ');
  const bodyText = plainText(article.contentHtml);
  const fields = {
    title: normalizeVietnameseSearch(article.title),
    excerpt: normalizeVietnameseSearch(article.excerpt),
    category: normalizeVietnameseSearch(article.category.name),
    body: normalizeVietnameseSearch(bodyText),
  };
  const matchedFields = (
    Object.entries(fields) as Array<[SearchMatchedField, string]>
  )
    .filter(([, value]) => containsAllTokens(value, tokens))
    .map(([field]) => field);

  if (matchedFields.length === 0) return null;

  let score = 0;
  if (fields.title.includes(normalizedQuery)) score += 120;
  if (containsAllTokens(fields.title, tokens)) score += 60;
  score += tokens.filter((token) => fields.title.includes(token)).length * 20;
  if (containsAllTokens(fields.excerpt, tokens)) score += 35;
  if (containsAllTokens(fields.category, tokens)) score += 25;
  if (containsAllTokens(fields.body, tokens)) score += 10;

  const snippetSource = matchedFields.includes('excerpt')
    ? article.excerpt
    : matchedFields.includes('body')
      ? bodyText
      : article.excerpt;

  return {
    score,
    searchSnippet: makeSnippet(snippetSource, tokens),
    matchedFields,
  };
}
