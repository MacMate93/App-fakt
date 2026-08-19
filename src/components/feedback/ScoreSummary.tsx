import { COMPETENCIES } from '../../types/content';
import type { WeekScore } from '../../engine/scoring';
import { buildFeedback } from '../../engine/feedback';
import { useLocale } from '../../state/LocaleProvider';
import { ProgressBar } from '../layout/ProgressBar';
import styles from './feedback.module.css';

/** Total score, per-competency breakdown and non-punitive textual feedback. */
export function ScoreSummary({ score }: { score: WeekScore }) {
  const { ui } = useLocale();
  const feedback = buildFeedback(score);

  return (
    <div>
      <div>
        <div className={styles.totalLabel}>{ui.summary.totalScore}</div>
        <div className={styles.total}>
          <span className={styles.totalValue}>{score.total}</span>
          <span className={styles.totalMax}>/ {score.max}</span>
        </div>
      </div>

      <div className={styles.breakdown}>
        {COMPETENCIES.filter((competency) => score.byCompetency[competency].max > 0).map(
          (competency) => {
            const entry = score.byCompetency[competency];
            return (
              <div key={competency} className={styles.row}>
                <span className={styles.rowLabel}>{ui.competency[competency]}</span>
                <span className={styles.rowValue}>
                  {entry.earned} / {entry.max}
                </span>
                <div className={styles.rowBar}>
                  <ProgressBar
                    value={entry.earned}
                    max={entry.max}
                    label={ui.competency[competency]}
                  />
                </div>
              </div>
            );
          },
        )}
      </div>

      <div className={styles.lists}>
        {feedback.strong.length > 0 ? (
          <div>
            <div className={[styles.listTitle, styles.listTitleStrong].join(' ')}>
              {ui.summary.strong}
            </div>
            <ul className={styles.list}>
              {feedback.strong.map((competency) => (
                <li key={competency}>{ui.competency[competency]}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {feedback.review.length > 0 ? (
          <div>
            <div className={[styles.listTitle, styles.listTitleReview].join(' ')}>
              {ui.summary.review}
            </div>
            <ul className={styles.list}>
              {feedback.review.map((competency) => (
                <li key={competency}>{ui.competency[competency]}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {feedback.strong.length === 0 && feedback.review.length === 0 ? (
          <p className={styles.balanced}>{ui.summary.balanced}</p>
        ) : null}
      </div>
    </div>
  );
}
