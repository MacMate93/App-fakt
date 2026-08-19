import { Link } from 'react-router-dom';
import type { Week } from '../../types/content';
import type { WeekProgress } from '../../types/progress';
import { useLocale } from '../../state/LocaleProvider';
import { Badge, type BadgeTone } from '../layout/Badge';
import styles from './course.module.css';

const STATUS_TONE: Record<string, BadgeTone> = {
  not_started: 'neutral',
  in_progress: 'accent',
  completed: 'correct',
  locked: 'neutral',
};

/** One module on the dashboard: status, score and a way in. */
export function WeekCard({ week, progress }: { week: Week; progress?: WeekProgress }) {
  const { text, ui } = useLocale();
  const status = !week.available ? 'locked' : (progress?.status ?? 'not_started');

  const body = (
    <>
      <div className={styles.cardTop}>
        <span className={styles.weekLabel}>
          {ui.weekCard.week} {week.week}
        </span>
        <Badge tone={STATUS_TONE[status]}>{ui.status[status]}</Badge>
      </div>
      <div>
        <div className={styles.cardTitle}>{text(week.title)}</div>
        <div className={styles.cardSubtitle}>{text(week.subtitle)}</div>
      </div>
      <div className={styles.cardFooter}>
        <span>
          {week.estimatedMinutes} {ui.common.minutes}
        </span>
        {status === 'locked' ? (
          <span>{ui.weekCard.lockedNote}</span>
        ) : progress && progress.status !== 'not_started' ? (
          <span className={styles.score}>
            {progress.totalScore} / {progress.maxScore}
          </span>
        ) : null}
      </div>
    </>
  );

  if (!week.available) {
    return <article className={[styles.card, styles.cardLocked].join(' ')}>{body}</article>;
  }

  return (
    <Link className={styles.card} to={`/week/${week.id}`}>
      {body}
    </Link>
  );
}
