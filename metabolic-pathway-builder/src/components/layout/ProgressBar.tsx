import styles from './ui.module.css';

export function ProgressBar({
  value,
  label,
  tone,
}: {
  /** 0–1. */
  value: number;
  label?: string;
  tone?: 'accent' | 'correct';
}) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      className={styles.progress}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={label}
    >
      <div
        className={styles.progressFill}
        data-tone={tone === 'correct' ? 'correct' : undefined}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
