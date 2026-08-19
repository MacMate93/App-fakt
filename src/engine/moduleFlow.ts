import type { Case, HypeStatement, Stage, TherapyBuilder, Week } from '../types/content';
import type { EvaluationResult } from '../types/answers';

/**
 * Turns any week definition into a linear list of screens. This is what makes
 * a single WeekPlayer able to run every week: adding content never adds routes.
 */
export type ModuleStep =
  | { kind: 'case_intro'; id: string; case: Case }
  | {
      kind: 'stage';
      id: string;
      case: Case;
      stage: Stage;
      stageIndex: number;
      stageCount: number;
    }
  | { kind: 'hype'; id: string; statements: HypeStatement[] }
  | { kind: 'therapy'; id: string; builder: TherapyBuilder }
  | { kind: 'summary'; id: string };

export function buildModuleFlow(week: Week): ModuleStep[] {
  const steps: ModuleStep[] = [];

  for (const kase of week.cases) {
    steps.push({ kind: 'case_intro', id: `${kase.id}:intro`, case: kase });
    kase.stages.forEach((stage, index) => {
      steps.push({
        kind: 'stage',
        id: `${kase.id}:${stage.id}`,
        case: kase,
        stage,
        stageIndex: index,
        stageCount: kase.stages.length,
      });
    });
  }

  if (week.mechanismOrHype.length > 0) {
    steps.push({ kind: 'hype', id: `${week.id}:hype`, statements: week.mechanismOrHype });
  }
  if (week.therapyBuilder) {
    steps.push({ kind: 'therapy', id: `${week.id}:therapy`, builder: week.therapyBuilder });
  }
  steps.push({ kind: 'summary', id: `${week.id}:summary` });

  return steps;
}

/** Ids of every scorable item on a step, in presentation order. */
export function stepItemIds(step: ModuleStep): string[] {
  switch (step.kind) {
    case 'stage':
      return step.stage.questions.map((q) => q.id);
    case 'hype':
      return step.statements.map((s) => s.id);
    case 'therapy':
      return step.builder.steps.map((s) => s.question.id);
    case 'case_intro':
    case 'summary':
      return [];
  }
}

/**
 * Sub-position inside a step is derived from the stored results rather than
 * held in separate state, so a reload resumes exactly where the learner was.
 */
export function firstUnansweredIndex(
  step: ModuleStep,
  results: Record<string, EvaluationResult>,
): number {
  const ids = stepItemIds(step);
  const index = ids.findIndex((id) => !results[id]);
  return index === -1 ? ids.length : index;
}

export function isStepComplete(
  step: ModuleStep,
  results: Record<string, EvaluationResult>,
): boolean {
  return stepItemIds(step).every((id) => Boolean(results[id]));
}
