import type { Finding } from '../../types/content';
import { useLocale } from '../../state/LocaleProvider';
import styles from './case.module.css';

const ARROW = { up: '↑', down: '↓', unchanged: '→' };
const ARROW_CLASS = { up: styles.arrowUp, down: styles.arrowDown, unchanged: styles.arrowFlat };

/** Structured observation list — reused by cases and by the Therapy Builder. */
export function FindingsTable({ findings, title }: { findings: Finding[]; title?: string }) {
  const { text } = useLocale();
  if (findings.length === 0) return null;

  return (
    <div className={styles.findings}>
      {title ? <div className={styles.findingsTitle}>{title}</div> : null}
      <ul className={styles.findingList}>
        {findings.map((finding, index) => (
          <li key={index} className={styles.finding}>
            <span className={[styles.arrow, ARROW_CLASS[finding.direction]].join(' ')} aria-hidden="true">
              {ARROW[finding.direction]}
            </span>
            <span className={styles.findingLabel}>{text(finding.label)}</span>
            {finding.value ? <span className={styles.findingValue}>{finding.value}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
