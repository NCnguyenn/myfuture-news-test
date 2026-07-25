import type { ArticleEvidence } from '../../types/news';
import styles from './SourceEvidence.module.css';

type SourceEvidenceProps = {
  evidence: ArticleEvidence[];
};

export function SourceEvidence({ evidence }: SourceEvidenceProps) {
  if (evidence.length === 0) return null;

  return (
    <aside className={styles.evidence} aria-labelledby="evidence-heading">
      <p className="eyebrow">ĐỐI CHIẾU THÔNG TIN</p>
      <h2 id="evidence-heading">Nguồn tham khảo</h2>
      <p className={styles.intro}>
        Các liên kết dưới đây dẫn tới nguồn gốc dùng để kiểm chứng nội dung
        bài viết.
      </p>
      <ul>
        {evidence.map((item) => (
          <li key={`${item.sourceUrl}-${item.claim}`}>
            <strong>{item.claim}</strong>
            <p>{item.evidenceNote}</p>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Xem nguồn gốc <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
