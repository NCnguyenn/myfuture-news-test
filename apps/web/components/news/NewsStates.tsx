import Link from 'next/link';
import styles from './NewsStates.module.css';

type EmptyStateProps = {
  title?: string;
  description?: string;
};

export function EmptyState({
  title = 'Chưa có bài viết phù hợp',
  description = 'Thử xem các danh mục khác hoặc quay lại toàn cảnh bản tin.',
}: EmptyStateProps) {
  return (
    <div className={`${styles.state} ${styles.empty}`} role="status">
      <p className={styles.stateTitle}>{title}</p>
      <p className={styles.stateDescription}>{description}</p>
      <Link className={styles.stateLink} href="/ban-tin">
        Quay lại Bản tin
      </Link>
    </div>
  );
}

type ErrorPanelProps = {
  title?: string;
  description?: string;
  children?: React.ReactNode;
};

export function ErrorPanel({
  title = 'Không thể tải bản tin',
  description = 'Dịch vụ đang gặp sự cố tạm thời. Bạn có thể thử lại hoặc quay về trang tổng quan.',
  children,
}: ErrorPanelProps) {
  return (
    <div className={`${styles.state} ${styles.error}`} role="alert">
      <p className={styles.stateTitle}>{title}</p>
      <p className={styles.stateDescription}>{description}</p>
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <span className={`${styles.skeleton} ${className}`} aria-hidden="true" />;
}

export function LoadingSkeleton() {
  return (
    <div className="page-shell" aria-busy="true" aria-label="Đang tải bản tin">
      <section className="page-intro">
        <SkeletonBlock className={styles.skeletonEyebrow} />
        <SkeletonBlock className={styles.skeletonTitle} />
        <SkeletonBlock className={styles.skeletonText} />
      </section>
      <div className={styles.skeletonTabs}>
        {Array.from({ length: 7 }, (_, index) => <SkeletonBlock key={index} className={styles.skeletonTab} />)}
      </div>
      <section className={styles.skeletonFeatured} aria-hidden="true">
        <SkeletonBlock className={styles.skeletonFeatureImage} />
        <div className={styles.skeletonFeatureBody}>
          <SkeletonBlock className={styles.skeletonLine} />
          <SkeletonBlock className={styles.skeletonLineWide} />
          <SkeletonBlock className={styles.skeletonLine} />
        </div>
      </section>
      <section className={styles.skeletonList} aria-hidden="true">
        <SkeletonBlock className={styles.skeletonHeading} />
        {Array.from({ length: 4 }, (_, index) => (
          <div className={styles.skeletonRow} key={index}>
            <SkeletonBlock className={styles.skeletonThumb} />
            <div className={styles.skeletonRowBody}>
              <SkeletonBlock className={styles.skeletonLine} />
              <SkeletonBlock className={styles.skeletonLineWide} />
              <SkeletonBlock className={styles.skeletonLineShort} />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
