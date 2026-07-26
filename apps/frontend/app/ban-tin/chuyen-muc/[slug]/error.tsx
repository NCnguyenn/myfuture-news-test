'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ErrorPanel } from '../../../../components/news/NewsStates';
import styles from '../../error.module.css';

type CategoryErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CategoryError({ error, reset }: CategoryErrorProps) {
  useEffect(() => {
    console.error('News category route error', error);
  }, [error]);

  return (
    <div className={`page-shell ${styles.routeState}`}>
      <ErrorPanel
        title="Không thể tải chuyên mục"
        description="Chuyên mục đang gặp sự cố tạm thời. Bạn có thể thử lại hoặc quay về trang tổng quan."
      >
        <button type="button" onClick={() => reset()}>
          Thử tải lại
        </button>
        <Link href="/ban-tin">Về trang tổng quan</Link>
      </ErrorPanel>
    </div>
  );
}
