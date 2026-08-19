import type { TrueFalseQuestion } from '../../types/content';
import { useLocale } from '../../state/LocaleProvider';
import { Button } from '../layout/Button';
import type { QuestionViewProps } from './types';
import styles from './questions.module.css';

/** Fast conceptual check. */
export function TrueFalseView({ question, draft, onDraft, result }: QuestionViewProps<TrueFalseQuestion>) {
  const { text, ui } = useLocale();
  const value = draft?.kind === 'boolean' ? draft.value : null;
  const locked = Boolean(result);

  const toneFor = (option: boolean) => {
    if (!locked) return value === option ? 'primary' : 'secondary';
    if (option === question.correctAnswer) return 'primary';
    return 'secondary';
  };

  return (
    <div className={styles.body}>
      <p className={styles.statement}>{text(question.statement)}</p>
      <div className={styles.binary}>
        {[true, false].map((option) => (
          <Button
            key={String(option)}
            variant={toneFor(option)}
            disabled={locked}
            aria-pressed={value === option}
            onClick={() => onDraft({ kind: 'boolean', value: option })}
          >
            {option ? ui.question.true : ui.question.false}
          </Button>
        ))}
      </div>
    </div>
  );
}
