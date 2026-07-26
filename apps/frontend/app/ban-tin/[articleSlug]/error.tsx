'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ErrorPanel } from '../../../components/news/NewsStates';
import styles from '../error.module.css';

type ArticleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ArticleError({ error, reset }: ArticleErrorProps) {
  useEffect(() => {
    console.error('News article route error', error);
  }, [error]);

  return (
    <div className={`page-shell ${styles.routeState}`}>
      <ErrorPanel
        title="Không thể tải bài viết"
        description="Bài viết đang gặp sự cố tạm thời. Bạn có thể thử lại hoặc quay về trang tổng quan."
      >
        <button type="button" onClick={() => reset()}>
          Thử tải lại
        </button>
        <Link href="/ban-tin">Về trang tổng quan</Link>
      </ErrorPanel>
    </div>
  );
}
