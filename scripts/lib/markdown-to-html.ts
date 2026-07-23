function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderInline(value: string): string {
  const escaped = escapeHtml(value);
  const withoutUnsafeLinks = escaped.replace(
    /\[([^\]]+)]\(((?!https?:\/\/)(?:[^()]|\([^()]*\))*)\)/gi,
    '$1',
  );

  return withoutUnsafeLinks.replace(
    /\[([^\]]+)]\((https?:\/\/[^)\s]+)\)/gi,
    (_match, label: string, href: string) =>
      `<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`,
  );
}

export function markdownToSafeHtml(markdown: string): string {
  const blocks = markdown.replace(/\r\n/g, '\n').trim().split(/\n{2,}/);

  return blocks
    .filter(Boolean)
    .map((block) => {
      const value = block.trim();
      const lines = value.split('\n');
      if (value.startsWith('### ')) {
        return `<h3>${renderInline(value.slice(4))}</h3>`;
      }
      if (value.startsWith('## ')) {
        return `<h2>${renderInline(value.slice(3))}</h2>`;
      }
      if (lines.every((line) => /^-\s+/.test(line))) {
        return `<ul>${lines
          .map((line) => `<li>${renderInline(line.replace(/^-\s+/, ''))}</li>`)
          .join('')}</ul>`;
      }
      if (lines.every((line) => /^\d+\.\s+/.test(line))) {
        return `<ol>${lines
          .map((line) => `<li>${renderInline(line.replace(/^\d+\.\s+/, ''))}</li>`)
          .join('')}</ol>`;
      }
      return `<p>${lines.map(renderInline).join('<br />')}</p>`;
    })
    .join('\n');
}

/** Estimate reading time in minutes (words / 220, minimum 1). */
export function estimateReadingTimeMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
