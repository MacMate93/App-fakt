/*
 * The wrap-up questions of a pathway (net ATP yield and friends). They live in
 * the data file, so every pathway can bring its own.
 */
import type { QuizItem } from '@/types/pathway';
import { Card } from '@/components/layout/Card';
import { QUIZ_XP } from '@/engine/scoring';
import styles from '@/routes/routes.module.css';

export function SummaryQuiz({
  items,
  answers,
  onAnswer,
}: {
  items: QuizItem[];
  answers: Record<string, string>;
  onAnswer: (itemId: string, optionId: string) => void;
}) {
  return (
    <Card>
      <h2>Before you finish</h2>
      <p className={styles.pathwaySummary}>
        Four questions about the pathway as a whole — {QUIZ_XP} XP each.
      </p>
      {items.map((item) => {
        const answer = answers[item.id];
        return (
          <div className={styles.quizItem} key={item.id}>
            <p style={{ fontWeight: 600 }}>{item.question}</p>
            <div className={styles.quizOptions}>
              {item.options.map((option) => {
                const chosen = answer === option.id;
                const isAnswer = option.id === item.answerId;
                const classes = [
                  styles.quizOption,
                  answer && isAnswer ? styles.quizOptionCorrect : '',
                  chosen && !isAnswer ? styles.quizOptionWrong : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={classes}
                    disabled={Boolean(answer)}
                    onClick={() => onAnswer(item.id, option.id)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {answer ? <p className={styles.detailText}>{item.explanation}</p> : null}
          </div>
        );
      })}
    </Card>
  );
}
