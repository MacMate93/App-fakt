import type { TherapyBuilder as TherapyBuilderData, TherapyStepKind } from '../../types/content';
import type { AnswerValue, EvaluationResult } from '../../types/answers';
import { useLocale } from '../../state/LocaleProvider';
import { Button } from '../layout/Button';
import { Card } from '../layout/Card';
import { FindingsTable } from '../case/FindingsTable';
import { QuestionCard } from '../questions/QuestionCard';
import { TranslationalPathway, type PathwayNode } from './TranslationalPathway';
import styles from './modules.module.css';

interface TherapyBuilderProps {
  builder: TherapyBuilderData;
  results: Record<string, EvaluationResult>;
  answers: Record<string, AnswerValue>;
  /** Index of the builder step on screen; equals step count when finished. */
  index: number;
  onSubmit: (questionId: string, answer: AnswerValue) => void;
  onNext: () => void;
  onFinish: () => void;
}

/** Nodes of the closing diagram, built from what the learner actually chose. */
const SUMMARY_KINDS: TherapyStepKind[] = [
  'problem',
  'pathway',
  'intervention',
  'biomarker',
  'evidence',
];

/**
 * Guides one molecular problem through six steps to an evidence judgement, then
 * shows the chain the learner built. Every step reuses the question engine.
 */
export function TherapyBuilder({
  builder,
  results,
  answers,
  index,
  onSubmit,
  onNext,
  onFinish,
}: TherapyBuilderProps) {
  const { text, ui } = useLocale();
  const finished = index >= builder.steps.length;
  const step = builder.steps[Math.min(index, builder.steps.length - 1)];

  const nodeLabel = (kind: TherapyStepKind): string => {
    const builderStep = builder.steps.find((s) => s.kind === kind);
    if (!builderStep) return ui.therapy.notAnswered;
    const answer = answers[builderStep.question.id];
    const question = builderStep.question;

    if (answer?.kind === 'level') {
      return `${ui.ladder.level} ${answer.level} — ${ui.ladder.levels[answer.level as 1 | 2 | 3 | 4 | 5]}`;
    }
    if ((answer?.kind === 'option' || answer?.kind === 'options') && 'options' in question) {
      const ids = answer.kind === 'option' ? [answer.optionId] : answer.optionIds;
      const labels = ids
        .map((id) => question.options.find((option) => option.id === id))
        .filter(Boolean)
        .map((option) => text(option!.summaryLabel ?? option!.text));
      if (labels.length > 0) return labels.join(' · ');
    }
    if (builderStep.summaryLabel) return text(builderStep.summaryLabel);
    return ui.therapy.notAnswered;
  };

  if (finished) {
    const nodes: PathwayNode[] = SUMMARY_KINDS.map((kind) => ({
      kind: ui.therapy.nodes[kind as keyof typeof ui.therapy.nodes],
      label: nodeLabel(kind),
      accent: kind === 'intervention',
    }));

    return (
      <Card>
        <h1 className={styles.hypeTitle}>{ui.therapy.summaryTitle}</h1>
        <p className={styles.hypeIntro}>{text(builder.title)}</p>
        <TranslationalPathway nodes={nodes} />
        <div style={{ marginTop: 'var(--space-6)' }}>
          <Button onClick={onFinish}>{ui.common.continue}</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className={styles.hypeHeader}>
        <h1 className={styles.hypeTitle}>{ui.therapy.title}</h1>
        <span className={styles.rungTag}>
          {ui.therapy.step} {index + 1} / {builder.steps.length}
        </span>
      </div>

      <div className={styles.steps}>
        {builder.steps.map((builderStep, stepIndex) => (
          <span
            key={builderStep.id}
            className={[
              styles.stepChip,
              stepIndex === index
                ? styles.stepChipActive
                : results[builderStep.question.id]
                  ? styles.stepChipDone
                  : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {results[builderStep.question.id] ? '✓ ' : ''}
            {ui.therapy.steps[builderStep.kind]}
          </span>
        ))}
      </div>

      {index === 0 ? <p className={styles.problemBox}>{text(builder.problem)}</p> : null}
      {index === 0 && builder.findings ? (
        <FindingsTable findings={builder.findings} title={ui.player.observed} />
      ) : null}

      <QuestionCard
        key={step.question.id}
        question={step.question}
        result={results[step.question.id] ?? null}
        onSubmit={(answer) => onSubmit(step.question.id, answer)}
        onContinue={onNext}
      />
    </Card>
  );
}
