import type { Feedback } from '@/types/session';
import { Button } from '@/components/layout/Button';
import styles from './game.module.css';

export function FeedbackPanel({
  feedback,
  onDismiss,
}: {
  feedback: Feedback | null;
  onDismiss: () => void;
}) {
  if (!feedback) return null;
  const tone = feedback.tone === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect;

  return (
    <div className={[styles.feedback, tone].join(' ')} role="status" aria-live="polite">
      <div className={styles.feedbackTitle}>
        <span>{feedback.tone === 'correct' ? '✓' : '!'}</span>
        {feedback.title}
      </div>
      <p className={styles.feedbackBody}>{feedback.body}</p>
      <div>
        <Button variant="ghost" size="small" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
