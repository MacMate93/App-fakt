import { COMPETENCIES, type Competency } from '../../types/content';
import { useLocale } from '../../state/LocaleProvider';
import { Card, CardHeader } from '../layout/Card';
import { ProgressBar } from '../layout/ProgressBar';
import styles from './course.module.css';

/** Competency profile aggregated over every module the learner has answered. */
export function ProgressDashboard({
  percentages,
  hasData,
}: {
  percentages: Record<Competency, number>;
  hasData: boolean;
}) {
  const { ui } = useLocale();

  return (
    <Card>
      <CardHeader title={ui.dashboard.competencyTitle} />
      {hasData ? (
        <>
          <div className={styles.meters}>
            {COMPETENCIES.map((competency) => (
              <div key={competency} className={styles.meter}>
                <span className={styles.meterLabel}>{ui.competency[competency]}</span>
                <span className={styles.meterValue}>{percentages[competency]}%</span>
                <div className={styles.meterBar}>
                  <ProgressBar value={percentages[competency]} max={100} />
                </div>
              </div>
            ))}
          </div>
          <p className={styles.empty} style={{ marginTop: 'var(--space-4)' }}>
            {ui.dashboard.competencyHint}
          </p>
        </>
      ) : (
        <p className={styles.empty}>{ui.dashboard.noData}</p>
      )}
    </Card>
  );
}
