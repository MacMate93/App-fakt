import { useEffect, useMemo } from 'react';
import type { OrderingQuestion } from '../../types/content';
import { useLocale } from '../../state/LocaleProvider';
import { stableShuffle, type QuestionViewProps } from './types';
import styles from './questions.module.css';

/**
 * Arrow-based reordering rather than drag and drop: it works on touch screens,
 * with a keyboard and with assistive technology without extra machinery.
 */
export function OrderingView({ question, draft, onDraft, result }: QuestionViewProps<OrderingQuestion>) {
  const { text, ui } = useLocale();

  // Items are presented in a stable pseudo-random order so that the authoring
  // order in the content file never gives the answer away.
  const initialOrder = useMemo(
    () => stableShuffle(question.items.map((item) => item.id), question.id),
    [question.id, question.items],
  );
  const order = draft?.kind === 'order' ? draft.order : initialOrder;

  // Seed the draft on mount so the learner can submit the presented order as-is
  // if they believe it is already correct.
  useEffect(() => {
    if (!draft && !result) onDraft({ kind: 'order', order: initialOrder });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrder]);
  const locked = Boolean(result);
  const byId = new Map(question.items.map((item) => [item.id, item]));

  const move = (index: number, delta: number) => {
    const next = [...order];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onDraft({ kind: 'order', order: next });
  };

  return (
    <div className={styles.body}>
      <p className={styles.hint}>{ui.question.orderingHint}</p>
      <ol className={styles.orderList}>
        {order.map((itemId, index) => {
          const item = byId.get(itemId);
          const state = result?.optionStates?.[itemId];
          return (
            <li
              key={itemId}
              className={[
                styles.orderItem,
                state === 'correct' ? styles.optionCorrect : state === 'wrong' ? styles.optionWrong : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles.orderIndex}>{index + 1}</span>
              <span className={styles.orderText}>{item ? text(item.text) : itemId}</span>
              {!locked ? (
                <span className={styles.orderButtons}>
                  <button
                    type="button"
                    className={styles.arrow}
                    aria-label={ui.question.moveUp}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className={styles.arrow}
                    aria-label={ui.question.moveDown}
                    disabled={index === order.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    ▼
                  </button>
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      {locked && result?.status !== 'correct' ? (
        <div>
          <p className={styles.hint}>{ui.question.correctAnswer}</p>
          <ol className={styles.orderList}>
            {question.correctOrder.map((itemId, index) => (
              <li key={itemId} className={styles.orderItem}>
                <span className={styles.orderIndex}>{index + 1}</span>
                <span className={styles.orderText}>
                  {byId.get(itemId) ? text(byId.get(itemId)!.text) : itemId}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
