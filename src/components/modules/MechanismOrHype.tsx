import { useState } from 'react';
import { HYPE_VERDICTS, type HypeStatement, type HypeVerdict } from '../../types/content';
import type { AnswerValue, EvaluationResult } from '../../types/answers';
import { useLocale } from '../../state/LocaleProvider';
import { Button } from '../layout/Button';
import { Card } from '../layout/Card';
import { FeedbackPanel } from '../feedback/FeedbackPanel';
import styles from './modules.module.css';

interface MechanismOrHypeProps {
  statements: HypeStatement[];
  results: Record<string, EvaluationResult>;
  index: number;
  onSubmit: (statementId: string, answer: AnswerValue) => void;
  onContinue: () => void;
}

/**
 * Reusable critical-appraisal component. Statements score towards the
 * `critical` competency and are content, so any week can supply its own set.
 */
export function MechanismOrHype({
  statements,
  results,
  index,
  onSubmit,
  onContinue,
}: MechanismOrHypeProps) {
  const { text, ui } = useLocale();
  const statement = statements[Math.min(index, statements.length - 1)];
  const result = results[statement.id] ?? null;
  // The draft is tied to a statement id so advancing clears the selection
  // without the caller having to remount the component.
  const [selection, setSelection] = useState<{ id: string; verdict: HypeVerdict | null }>({
    id: statement.id,
    verdict: null,
  });
  const draft = selection.id === statement.id ? selection.verdict : null;
  const setDraft = (verdict: HypeVerdict) => setSelection({ id: statement.id, verdict });

  return (
    <Card>
      <div className={styles.hypeHeader}>
        <h1 className={styles.hypeTitle}>{ui.hype.title}</h1>
        <span className={styles.rungTag}>
          {ui.hype.statement} {index + 1} / {statements.length}
        </span>
      </div>
      <p className={styles.hypeIntro}>{ui.hype.intro}</p>

      <p className={styles.hypeStatement}>“{text(statement.statement)}”</p>

      <div className={styles.verdicts}>
        {HYPE_VERDICTS.map((verdict) => {
          const state = result?.optionStates?.[verdict];
          const className = [
            styles.rung,
            result
              ? state === 'correct'
                ? styles.rungCorrect
                : state === 'wrong'
                  ? styles.rungWrong
                  : ''
              : draft === verdict
                ? styles.rungSelected
                : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={verdict}
              type="button"
              className={className}
              disabled={Boolean(result)}
              aria-pressed={draft === verdict}
              onClick={() => setDraft(verdict)}
            >
              <span className={styles.rungLabel}>{ui.hype[verdict]}</span>
            </button>
          );
        })}
      </div>

      {result ? (
        <>
          <FeedbackPanel result={result} />
          <div style={{ marginTop: 'var(--space-5)' }}>
            <Button onClick={onContinue}>{ui.common.continue}</Button>
          </div>
        </>
      ) : (
        <div style={{ marginTop: 'var(--space-5)' }}>
          <Button
            disabled={!draft}
            onClick={() => draft && onSubmit(statement.id, { kind: 'verdict', verdict: draft })}
          >
            {ui.common.submit}
          </Button>
        </div>
      )}
    </Card>
  );
}
