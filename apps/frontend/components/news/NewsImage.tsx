'use client';

import Image from 'next/image';
import { useState } from 'react';
import styles from './NewsImage.module.css';

const FALLBACK_NEWS_IMAGE = '/images/news/placeholder-default.svg';

type NewsImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function NewsImage({
  src,
  alt,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
}: NewsImageProps) {
  const [imageSource, setImageSource] = useState(src || FALLBACK_NEWS_IMAGE);

  return (
    <span className={styles.frame}>
      <Image
        src={imageSource}
        alt={alt}
        fill
        className={`${styles.image} ${className ?? ''}`}
        priority={priority}
        sizes={sizes}
        decoding="async"
        onError={(event) => {
          event.currentTarget.onerror = null;
          setImageSource(FALLBACK_NEWS_IMAGE);
        }}
      />
    </span>
  );
}
