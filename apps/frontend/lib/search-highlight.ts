export type HighlightSegment = {
  text: string;
  highlighted: boolean;
};

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('vi-VN')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitSearchHighlight(
  text: string,
  query: string,
): HighlightSegment[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [{ text, highlighted: false }];

  const tokens = normalizedQuery.split(' ');
  const parts = text.split(/(\s+)/);
  const selected = parts.map((part) =>
    tokens.some((token) => normalize(part).includes(token)),
  );
  const first = selected.findIndex(Boolean);
  const last = selected.findLastIndex(Boolean);

  if (first < 0) return [{ text, highlighted: false }];

  return [
    ...(first > 0
      ? [{ text: parts.slice(0, first).join(''), highlighted: false }]
      : []),
    {
      text: parts.slice(first, last + 1).join(''),
      highlighted: true,
    },
    ...(last + 1 < parts.length
      ? [{ text: parts.slice(last + 1).join(''), highlighted: false }]
      : []),
  ];
}
