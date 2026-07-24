import type { ArticleEvidence } from '../../types/news';
import styles from './SourceEvidence.module.css';

type SourceEvidenceProps = {
  evidence: ArticleEvidence[];
};

export function SourceEvidence({ evidence }: SourceEvidenceProps) {
  if (evidence.length === 0) return null;

  return (
    <aside className={styles.evidence} aria-labelledby="evidence-heading">
      <p className="eyebrow">MINH BẠCH NGUỒN</p>
      <h2 id="evidence-heading">Nguồn kiểm chứng</h2>
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
              Mở nguồn gốc ↗
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
