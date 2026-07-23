'use client';

import { useState } from 'react';
import styles from './NewsImage.module.css';

const FALLBACK_IMAGE = '/images/news/placeholder-default.svg';

type NewsImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function NewsImage({ src, alt, className, priority = false }: NewsImageProps) {
  const [imageSource, setImageSource] = useState(src || FALLBACK_IMAGE);
  return (
    <img
      src={imageSource}
      alt={alt}
      className={`${styles.image} ${className ?? ''}`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={(event) => {
        event.currentTarget.onerror = null;
        setImageSource(FALLBACK_IMAGE);
      }}
    />
  );
}
