import { Card } from '@/components/layout/Card';
import { ProgressBar } from '@/components/layout/ProgressBar';
import styles from './game.module.css';

export function ProgressHeader({
  title,
  subtitle,
  done,
  total,
  unit = 'positions',
}: {
  title: string;
  subtitle?: string;
  done: number;
  total: number;
  unit?: string;
}) {
  return (
    <Card padded={false}>
      <div className={styles.progressHeader}>
        <div className={styles.progressLine}>
          <span className={styles.progressTitle}>{title}</span>
          <span className={styles.progressCount}>
            {done} / {total} {unit} completed
          </span>
        </div>
        <ProgressBar
          value={total === 0 ? 0 : done / total}
          label={`${done} of ${total} ${unit} completed`}
          tone={done === total ? 'correct' : 'accent'}
        />
        {subtitle ? <span className={styles.progressCount}>{subtitle}</span> : null}
      </div>
    </Card>
  );
}
