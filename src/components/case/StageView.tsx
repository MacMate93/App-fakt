import type { Stage } from '../../types/content';
import type { AnswerValue, EvaluationResult } from '../../types/answers';
import { useLocale } from '../../state/LocaleProvider';
import { Card } from '../layout/Card';
import { ChartRenderer } from '../charts/ChartRenderer';
import { QuestionCard } from '../questions/QuestionCard';
import { FindingsTable } from './FindingsTable';
import styles from './case.module.css';

interface StageViewProps {
  stage: Stage;
  stageIndex: number;
  stageCount: number;
  results: Record<string, EvaluationResult>;
  /** Index of the question currently on screen. */
  questionIndex: number;
  onSubmit: (questionId: string, answer: AnswerValue) => void;
  onContinue: () => void;
}

/**
 * One stage of a case. Only ever shows a single question, so the screen stays
 * readable and every decision gets its own feedback.
 */
export function StageView({
  stage,
  stageIndex,
  stageCount,
  results,
  questionIndex,
  onSubmit,
  onContinue,
}: StageViewProps) {
  const { text, ui } = useLocale();
  const question = stage.questions[Math.min(questionIndex, stage.questions.length - 1)];

  return (
    <Card>
      <header className={styles.stageHeader}>
        <div className={styles.stageEyebrow}>
          <span>
            {ui.player.stage} {stageIndex + 1} / {stageCount}
          </span>
        </div>
        <h1 className={styles.stageTitle}>{text(stage.title)}</h1>
        <p className={styles.stageGoal}>{text(stage.goal)}</p>
      </header>

      {stage.brief ? (
        <div className={styles.brief}>
          <span className={styles.briefLabel}>{ui.player.newInformation}</span>
          {text(stage.brief)}
        </div>
      ) : null}

      {stage.newFindings ? <FindingsTable findings={stage.newFindings} title={ui.player.observed} /> : null}
      {stage.chart ? <ChartRenderer spec={stage.chart} /> : null}

      <QuestionCard
        key={question.id}
        question={question}
        result={results[question.id] ?? null}
        onSubmit={(answer) => onSubmit(question.id, answer)}
        onContinue={onContinue}
        header={
          stage.questions.length > 1 ? (
            <div className={styles.questionMeta}>
              {ui.player.question} {questionIndex + 1} / {stage.questions.length}
            </div>
          ) : null
        }
      />
    </Card>
  );
}
