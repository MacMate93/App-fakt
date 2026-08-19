import { describe, expect, it } from 'vitest';
import { WEEKS, validateAllContent } from './index';
import { week03 } from './weeks/week-03';
import { collectScorables, computeWeekScore, validatePointsBudget } from '../engine/scoring';
import { buildModuleFlow, stepItemIds } from '../engine/moduleFlow';
import { COMPETENCIES } from '../types/content';

describe('course content', () => {
  it('passes referential validation', () => {
    expect(validateAllContent()).toEqual([]);
  });

  it('registers all seven weeks in order', () => {
    expect(WEEKS.map((week) => week.week)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('has unique week ids', () => {
    expect(new Set(WEEKS.map((week) => week.id)).size).toBe(WEEKS.length);
  });
});

describe('week 3', () => {
  it('is worth exactly 100 points', () => {
    expect(computeWeekScore(week03, {}).max).toBe(100);
  });

  it('matches the competency budget', () => {
    expect(validatePointsBudget(week03)).toEqual([]);
    const totals = Object.fromEntries(COMPETENCIES.map((c) => [c, 0])) as Record<string, number>;
    for (const scorable of collectScorables(week03)) totals[scorable.competency] += scorable.points;
    expect(totals).toEqual({ mechanism: 30, data: 25, therapy: 20, evidence: 15, critical: 10 });
  });

  it('implements every MVP question type', () => {
    const types = new Set(
      week03.cases
        .flatMap((kase) => kase.stages)
        .flatMap((stage) => stage.questions)
        .concat(week03.therapyBuilder?.steps.map((step) => step.question) ?? [])
        .map((question) => question.type),
    );
    for (const type of [
      'single_choice',
      'multiple_choice',
      'true_false',
      'ordering',
      'classification',
      'data_interpretation',
      'evidence_rating',
      'decision',
    ]) {
      expect(types).toContain(type);
    }
  });

  it('has five Mechanism or Hype statements', () => {
    expect(week03.mechanismOrHype).toHaveLength(5);
  });

  it('builds a linear flow that covers every scorable item', () => {
    const flow = buildModuleFlow(week03);
    expect(flow[0].kind).toBe('case_intro');
    expect(flow[flow.length - 1].kind).toBe('summary');
    const flowIds = flow.flatMap(stepItemIds).sort();
    const scorableIds = collectScorables(week03).map((s) => s.id).sort();
    expect(flowIds).toEqual(scorableIds);
  });
});
