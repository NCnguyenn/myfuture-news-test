'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ErrorPanel } from '../../components/news/NewsStates';
import styles from './error.module.css';

type NewsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function NewsError({ error, reset }: NewsErrorProps) {
  useEffect(() => {
    console.error('News route error', error);
  }, [error]);

  return (
    <div className={`page-shell ${styles.routeState}`}>
      <ErrorPanel>
        <button type="button" onClick={() => reset()}>
          Thử tải lại
        </button>
        <Link href="/ban-tin">Về trang tổng quan</Link>
      </ErrorPanel>
    </div>
  );
}
