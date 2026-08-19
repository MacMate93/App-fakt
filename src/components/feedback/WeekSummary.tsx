import type { Week } from '../../types/content';
import type { WeekScore } from '../../engine/scoring';
import { useLocale } from '../../state/LocaleProvider';
import { Button } from '../layout/Button';
import { Card, CardHeader } from '../layout/Card';
import { TranslationalPathway } from '../modules/TranslationalPathway';
import { ScoreSummary } from './ScoreSummary';
import styles from './feedback.module.css';

/** Closing screen: what you scored, what to review, and what you built. */
export function WeekSummary({
  week,
  score,
  onFinish,
}: {
  week: Week;
  score: WeekScore;
  onFinish: () => void;
}) {
  const { text, ui } = useLocale();

  return (
    <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
      <Card>
        <CardHeader title={ui.summary.title} hint={text(week.title)} />
        <ScoreSummary score={score} />
      </Card>

      {week.summaryPathway.length > 0 ? (
        <Card>
          <CardHeader title={ui.summary.pathwayTitle} hint={ui.summary.pathwayHint} />
          <TranslationalPathway
            nodes={week.summaryPathway.map((node) => ({ label: text(node) }))}
          />
        </Card>
      ) : null}

      {week.takeHomeMessages.length > 0 ? (
        <Card>
          <CardHeader title={ui.summary.takeHome} />
          <ul className={styles.list}>
            {week.takeHomeMessages.map((message, index) => (
              <li key={index}>{text(message)}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div>
        <Button onClick={onFinish}>{ui.summary.backToDashboard}</Button>
      </div>
    </div>
  );
}
