import {
  COMPETENCIES,
  type Competency,
  type PointsBudget,
  type Question,
  type Week,
} from '../types/content';
import type { EvaluationResult } from '../types/answers';
import type { CompetencyScore } from '../types/progress';

/** A single scorable item, regardless of which module it lives in. */
export interface Scorable {
  id: string;
  competency: Competency;
  points: number;
}

/** Every question of a week: case stages, Mechanism or Hype, Therapy Builder. */
export function collectQuestions(week: Week): Question[] {
  const questions: Question[] = [];
  for (const kase of week.cases) {
    for (const stage of kase.stages) questions.push(...stage.questions);
  }
  for (const step of week.therapyBuilder?.steps ?? []) questions.push(step.question);
  return questions;
}

export function collectScorables(week: Week): Scorable[] {
  const scorables: Scorable[] = collectQuestions(week).map((q) => ({
    id: q.id,
    competency: q.competency,
    points: q.points,
  }));
  for (const statement of week.mechanismOrHype) {
    scorables.push({ id: statement.id, competency: 'critical', points: statement.points });
  }
  return scorables;
}

export function emptyCompetencyScores(): Record<Competency, CompetencyScore> {
  return COMPETENCIES.reduce(
    (acc, competency) => {
      acc[competency] = { earned: 0, max: 0 };
      return acc;
    },
    {} as Record<Competency, CompetencyScore>,
  );
}

export interface WeekScore {
  total: number;
  max: number;
  byCompetency: Record<Competency, CompetencyScore>;
  answered: number;
  totalQuestions: number;
}

/**
 * The maximum always comes from the week definition, never from the answers,
 * so an unfinished module reports "12 / 100" rather than "12 / 12".
 */
export function computeWeekScore(
  week: Week,
  results: Record<string, EvaluationResult>,
): WeekScore {
  const scorables = collectScorables(week);
  const byCompetency = emptyCompetencyScores();

  for (const scorable of scorables) {
    byCompetency[scorable.competency].max += scorable.points;
  }
  let total = 0;
  let answered = 0;
  for (const scorable of scorables) {
    const result = results[scorable.id];
    if (!result) continue;
    answered += 1;
    total += result.awardedPoints;
    byCompetency[scorable.competency].earned += result.awardedPoints;
  }

  return {
    total,
    max: scorables.reduce((sum, s) => sum + s.points, 0),
    byCompetency,
    answered,
    totalQuestions: scorables.length,
  };
}

export function percentage(score: CompetencyScore): number {
  return score.max === 0 ? 0 : Math.round((score.earned / score.max) * 100);
}

/** Content-authoring guard: the per-competency points must match the budget. */
export function validatePointsBudget(week: Week): string[] {
  const errors: string[] = [];
  const totals = COMPETENCIES.reduce(
    (acc, competency) => {
      acc[competency] = 0;
      return acc;
    },
    {} as PointsBudget,
  );
  for (const scorable of collectScorables(week)) {
    totals[scorable.competency] += scorable.points;
  }
  for (const competency of COMPETENCIES) {
    const expected = week.pointsBudget[competency];
    if (totals[competency] !== expected) {
      errors.push(
        `${week.id}: competency "${competency}" carries ${totals[competency]} points, expected ${expected}.`,
      );
    }
  }
  return errors;
}
