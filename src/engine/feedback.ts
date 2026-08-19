import { COMPETENCIES, type Competency } from '../types/content';
import { percentage, type WeekScore } from './scoring';

/**
 * Deterministic, non-punitive feedback: the engine returns competency keys and
 * percentages, the UI supplies the localized wording.
 */

export const STRONG_THRESHOLD = 85;
export const REVIEW_THRESHOLD = 70;

export interface CompetencyFeedback {
  strong: Competency[];
  review: Competency[];
  percentages: Record<Competency, number>;
}

export function buildFeedback(score: WeekScore): CompetencyFeedback {
  const percentages = {} as Record<Competency, number>;
  const strong: Competency[] = [];
  const review: Competency[] = [];

  for (const competency of COMPETENCIES) {
    const value = percentage(score.byCompetency[competency]);
    percentages[competency] = value;
    if (score.byCompetency[competency].max === 0) continue;
    if (value >= STRONG_THRESHOLD) strong.push(competency);
    else if (value < REVIEW_THRESHOLD) review.push(competency);
  }

  return { strong, review, percentages };
}

/** Aggregate competency percentages across several completed weeks. */
export function aggregateCompetencies(scores: WeekScore[]): Record<Competency, number> {
  const totals = {} as Record<Competency, number>;
  for (const competency of COMPETENCIES) {
    const earned = scores.reduce((sum, s) => sum + s.byCompetency[competency].earned, 0);
    const max = scores.reduce((sum, s) => sum + s.byCompetency[competency].max, 0);
    totals[competency] = max === 0 ? 0 : Math.round((earned / max) * 100);
  }
  return totals;
}
