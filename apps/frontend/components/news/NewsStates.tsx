import Link from 'next/link';
import styles from './NewsStates.module.css';

type EmptyStateProps = {
  title?: string;
  description?: string;
};

export function EmptyState({
  title = 'Chưa có bài viết phù hợp',
  description = 'Thử xem chuyên mục khác hoặc quay lại toàn cảnh bản tin.',
}: EmptyStateProps) {
  return (
    <div className={`${styles.state} ${styles.empty}`} role="status">
      <span className={styles.marker} aria-hidden="true">M</span>
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
      <span className={styles.marker} aria-hidden="true">!</span>
      <h1 className={styles.stateTitle}>{title}</h1>
      <p className={styles.stateDescription}>{description}</p>
      {children ? <div className={styles.actions}>{children}</div> : null}
    </div>
  );
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <span className={`${styles.skeleton} ${className}`} aria-hidden="true" />
  );
}

function SkeletonIntro() {
  return (
    <>
      <section className={styles.skeletonIntro} aria-hidden="true">
        <SkeletonBlock className={styles.skeletonEyebrow} />
        <SkeletonBlock className={styles.skeletonTitle} />
        <SkeletonBlock className={styles.skeletonText} />
      </section>
      <div className={styles.skeletonTabs} aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <SkeletonBlock key={index} className={styles.skeletonTab} />
        ))}
      </div>
    </>
  );
}

function SkeletonRow() {
  return (
    <div className={styles.skeletonRow} aria-hidden="true">
      <SkeletonBlock className={styles.skeletonThumb} />
      <div className={styles.skeletonRowBody}>
        <SkeletonBlock className={styles.skeletonLine} />
        <SkeletonBlock className={styles.skeletonLineWide} />
        <SkeletonBlock className={styles.skeletonLineShort} />
      </div>
    </div>
  );
}

function SkeletonFeed({ rows = 4 }: { rows?: number }) {
  return (
    <section className={styles.skeletonList} aria-hidden="true">
      <SkeletonBlock className={styles.skeletonHeading} />
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonRow key={index} />
      ))}
    </section>
  );
}

export function OverviewLoadingSkeleton() {
  return (
    <div
      className={`page-shell ${styles.loadingRoot}`}
      aria-busy="true"
      aria-label="Đang tải trang tổng quan Bản tin"
    >
      <SkeletonIntro />
      <section className={styles.skeletonFeatured} aria-hidden="true">
        <div className={styles.skeletonLead}>
          <SkeletonBlock className={styles.skeletonFeatureImage} />
          <div className={styles.skeletonFeatureBody}>
            <SkeletonBlock className={styles.skeletonLine} />
            <SkeletonBlock className={styles.skeletonLineWide} />
            <SkeletonBlock className={styles.skeletonLineShort} />
          </div>
        </div>
        <div className={styles.skeletonSide}>
          {Array.from({ length: 2 }, (_, index) => (
            <div className={styles.skeletonSupport} key={index}>
              <SkeletonBlock className={styles.skeletonSupportImage} />
              <div className={styles.skeletonSupportBody}>
                <SkeletonBlock className={styles.skeletonLine} />
                <SkeletonBlock className={styles.skeletonLineWide} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className={styles.skeletonContentGrid} aria-hidden="true">
        <SkeletonFeed />
        <div className={styles.skeletonSidebar}>
          <SkeletonBlock className={styles.skeletonHeading} />
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBlock className={styles.skeletonSidebarLine} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CategoryLoadingSkeleton() {
  return (
    <div
      className={`page-shell ${styles.loadingRoot}`}
      aria-busy="true"
      aria-label="Đang tải chuyên mục"
    >
      <SkeletonIntro />
      <div className={styles.skeletonCategoryGrid} aria-hidden="true">
        <SkeletonFeed rows={5} />
        <div className={styles.skeletonSidebar}>
          <SkeletonBlock className={styles.skeletonHeading} />
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBlock className={styles.skeletonSidebarLine} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ArticleLoadingSkeleton() {
  return (
    <div
      className={`page-shell ${styles.loadingRoot}`}
      aria-busy="true"
      aria-label="Đang tải bài viết"
    >
      <div className={styles.skeletonTabs} aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <SkeletonBlock key={index} className={styles.skeletonTab} />
        ))}
      </div>
      <section className={styles.skeletonArticleHeader} aria-hidden="true">
        <SkeletonBlock className={styles.skeletonEyebrow} />
        <SkeletonBlock className={styles.skeletonArticleTitle} />
        <SkeletonBlock className={styles.skeletonText} />
        <SkeletonBlock className={styles.skeletonMeta} />
      </section>
      <SkeletonBlock className={styles.skeletonCover} />
      <div className={styles.skeletonArticleGrid} aria-hidden="true">
        <div className={styles.skeletonReading}>
          {Array.from({ length: 8 }, (_, index) => (
            <SkeletonBlock
              className={
                index % 3 === 2
                  ? styles.skeletonLineShort
                  : styles.skeletonLineWide
              }
              key={index}
            />
          ))}
        </div>
        <div className={styles.skeletonSidebar}>
          <SkeletonBlock className={styles.skeletonHeading} />
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBlock className={styles.skeletonSidebarLine} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
