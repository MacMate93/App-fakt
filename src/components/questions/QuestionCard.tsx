import { useState, type ReactNode } from 'react';
import type { Question } from '../../types/content';
import type { AnswerValue, EvaluationResult } from '../../types/answers';
import { useLocale } from '../../state/LocaleProvider';
import { Button } from '../layout/Button';
import { ChartRenderer } from '../charts/ChartRenderer';
import { FeedbackPanel } from '../feedback/FeedbackPanel';
import { QuestionRenderer, isAnswerReady } from './QuestionRenderer';
import styles from './questions.module.css';

interface QuestionCardProps {
  question: Question;
  /** Non-null once answered; the card then shows feedback instead of submit. */
  result: EvaluationResult | null;
  onSubmit: (answer: AnswerValue) => void;
  onContinue: () => void;
  continueLabel?: string;
  header?: ReactNode;
}

/**
 * One question on screen: prompt, optional figure, the type-specific control,
 * a single submit, then feedback and a single way forward.
 *
 * Mount with `key={question.id}` so the draft state resets between questions.
 */
export function QuestionCard({
  question,
  result,
  onSubmit,
  onContinue,
  continueLabel,
  header,
}: QuestionCardProps) {
  const { text, ui } = useLocale();
  const [draft, setDraft] = useState<AnswerValue | null>(null);

  return (
    <div>
      {header}
      <h2 className={styles.prompt}>{text(question.prompt)}</h2>
      {question.chart && question.type !== 'data_interpretation' ? (
        <div className={styles.body}>
          <ChartRenderer spec={question.chart} />
        </div>
      ) : null}

      <QuestionRenderer question={question} draft={draft} onDraft={setDraft} result={result} />

      {result ? (
        <>
          <FeedbackPanel result={result} />
          <div className={styles.body}>
            <div>
              <Button onClick={onContinue}>{continueLabel ?? ui.common.continue}</Button>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.body}>
          <div>
            <Button
              disabled={!isAnswerReady(question, draft)}
              onClick={() => draft && onSubmit(draft)}
            >
              {ui.common.submit}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
