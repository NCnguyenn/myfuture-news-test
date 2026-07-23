function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(["'])([\s\S]*?)\2/g)) {
    result[match[1].toLowerCase()] = match[3];
  }

  return result;
}

export function extractOgImage(
  html: string,
  pageUrl: string,
): string | null {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const values = attributes(tag);
    if ((values.property ?? values.name)?.toLowerCase() !== 'og:image') {
      continue;
    }
    if (!values.content) {
      continue;
    }

    try {
      const url = new URL(values.content, pageUrl);
      return /^https?:$/.test(url.protocol) ? url.toString() : null;
    } catch {
      return null;
    }
  }

  return null;
}

export function extensionForContentType(
  contentType: string,
): 'jpg' | 'png' | 'webp' | null {
  const normalized = contentType.split(';', 1)[0].trim().toLowerCase();
  if (normalized === 'image/jpeg') {
    return 'jpg';
  }
  if (normalized === 'image/png') {
    return 'png';
  }
  if (normalized === 'image/webp') {
    return 'webp';
  }
  return null;
}
