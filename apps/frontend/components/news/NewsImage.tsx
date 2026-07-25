'use client';

import Image from 'next/image';
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
    <Image
      src={imageSource}
      alt={alt}
      width={1200}
      height={675}
      className={`${styles.image} ${className ?? ''}`}
      priority={priority}
      decoding="async"
      onError={(event) => {
        event.currentTarget.onerror = null;
        setImageSource(FALLBACK_IMAGE);
      }}
    />
  );
}
