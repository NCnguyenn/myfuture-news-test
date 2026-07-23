import type { ImageProvenance } from '../types/news';

const FALLBACK_IMAGE = '/images/news/placeholder-default.svg';

type ImageRecord = Omit<ImageProvenance, 'localPath'> & {
  localPath: string;
};

let records: Record<string, ImageRecord> = {};

try {
  records = require('../public/images/news/researched/manifest.json') as Record<
    string,
    ImageRecord
  >;
} catch {
  records = {};
}

export function getResearchedImage(
  slug: string,
  sourcePageUrl: string,
): ImageProvenance {
  return (
    records[slug] ?? {
      localPath: FALLBACK_IMAGE,
      originalImageUrl: null,
      sourcePageUrl,
      credit: null,
      isPlaceholder: true,
    }
  );
}
