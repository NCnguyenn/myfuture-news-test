'use client';

import { useEffect } from 'react';

type ScrollToTopOnArticleChangeProps = {
  articleSlug: string;
};

export function ScrollToTopOnArticleChange({
  articleSlug,
}: ScrollToTopOnArticleChangeProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [articleSlug]);

  return null;
}
