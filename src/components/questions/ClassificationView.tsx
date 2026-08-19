import type { ClassificationQuestion } from '../../types/content';
import { useLocale } from '../../state/LocaleProvider';
import type { QuestionViewProps } from './types';
import styles from './questions.module.css';

/** Assign every item to a category (Biomarker / Mechanism / Therapeutic target). */
export function ClassificationView({
  question,
  draft,
  onDraft,
  result,
}: QuestionViewProps<ClassificationQuestion>) {
  const { text, ui } = useLocale();
  const assignment = draft?.kind === 'assignment' ? draft.assignment : {};
  const locked = Boolean(result);

  const assign = (itemId: string, categoryId: string) => {
    onDraft({ kind: 'assignment', assignment: { ...assignment, [itemId]: categoryId } });
  };

  return (
    <div className={styles.body}>
      <p className={styles.hint}>{ui.question.classificationHint}</p>
      <div className={styles.categoryKey}>
        {question.categories.map((category) => (
          <span key={category.id}>
            <strong>{text(category.label)}</strong>
            {category.description ? ` — ${text(category.description)}` : ''}
          </span>
        ))}
      </div>
      <div className={styles.classItems}>
        {question.items.map((item) => {
          const chosen = assignment[item.id];
          const state = result?.optionStates?.[item.id];
          return (
            <div key={item.id} className={styles.classItem}>
              <div className={styles.classText}>{text(item.text)}</div>
              <div className={styles.classChoices}>
                {question.categories.map((category) => {
                  const isChosen = chosen === category.id;
                  const isCorrect = category.id === item.correctCategoryId;
                  const chipClass = !locked
                    ? isChosen
                      ? styles.chipOn
                      : ''
                    : isCorrect
                      ? styles.chipCorrect
                      : isChosen
                        ? styles.chipWrong
                        : '';
                  return (
                    <button
                      key={category.id}
                      type="button"
                      className={[styles.chip, chipClass].filter(Boolean).join(' ')}
                      disabled={locked}
                      aria-pressed={isChosen}
                      onClick={() => assign(item.id, category.id)}
                    >
                      {text(category.label)}
                    </button>
                  );
                })}
              </div>
              {locked && state === 'wrong' && item.rationale ? (
                <div className={styles.rationale}>{text(item.rationale)}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
