import type { EvaluationResult } from '../../types/answers';
import { useLocale } from '../../state/LocaleProvider';
import styles from './feedback.module.css';

const PANEL_CLASS = {
  correct: styles.panelCorrect,
  partial: styles.panelPartial,
  incorrect: styles.panelIncorrect,
};

const VERDICT_CLASS = {
  correct: styles.verdictCorrect,
  partial: styles.verdictPartial,
  incorrect: styles.verdictIncorrect,
};

/**
 * Feedback is teaching material, not a score justification: the verdict is one
 * line, the explanation carries the reasoning.
 */
export function FeedbackPanel({ result }: { result: EvaluationResult }) {
  const { text, ui } = useLocale();

  return (
    <div className={[styles.panel, PANEL_CLASS[result.status]].join(' ')} role="status">
      <div className={styles.header}>
        <span className={[styles.verdict, VERDICT_CLASS[result.status]].join(' ')}>
          {ui.feedback[result.status]}
        </span>
        <span className={styles.points}>
          {result.awardedPoints} / {result.maxPoints} {ui.common.points}
        </span>
      </div>
      <p className={styles.text}>{text(result.feedback)}</p>
      {result.explanation ? (
        <div className={styles.explanation}>
          <span className={styles.explanationLabel}>{ui.feedback.why}</span>
          {text(result.explanation)}
        </div>
      ) : null}
    </div>
  );
}
