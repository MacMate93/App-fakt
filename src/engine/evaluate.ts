import type {
  ClassificationQuestion,
  DataInterpretationQuestion,
  DecisionQuestion,
  EvidenceRatingQuestion,
  HypeStatement,
  MultipleChoiceQuestion,
  OrderingQuestion,
  Question,
  SingleChoiceQuestion,
  TrueFalseQuestion,
} from '../types/content';
import type { AnswerStatus, AnswerValue, EvaluationResult, OptionState } from '../types/answers';
import type { LocalizedText } from '../types/i18n';

/**
 * Deterministic answer evaluation. No network, no randomness, no AI:
 * the same answer always produces the same score and the same feedback.
 */

/** Points are whole numbers so that totals read cleanly (e.g. "27/30"). */
function award(fraction: number, maxPoints: number): number {
  const clamped = Math.min(1, Math.max(0, fraction));
  return Math.min(maxPoints, Math.round(clamped * maxPoints));
}

function statusFor(fraction: number): AnswerStatus {
  if (fraction >= 1) return 'correct';
  if (fraction > 0) return 'partial';
  return 'incorrect';
}

function pickFeedback(question: Question, status: AnswerStatus): LocalizedText {
  if (status === 'correct') return question.feedback.correct;
  if (status === 'partial') return question.feedback.partial ?? question.feedback.incorrect;
  return question.feedback.incorrect;
}

/** Mark every option so the UI can show what was right, wrong or missed. */
function markChoices(
  optionIds: string[],
  correctIds: string[],
  selectedIds: string[],
): Record<string, OptionState> {
  const correct = new Set(correctIds);
  const selected = new Set(selectedIds);
  const states: Record<string, OptionState> = {};
  for (const id of optionIds) {
    if (correct.has(id) && selected.has(id)) states[id] = 'correct';
    else if (correct.has(id)) states[id] = 'missed';
    else if (selected.has(id)) states[id] = 'wrong';
    else states[id] = 'neutral';
  }
  return states;
}

/** Length of the longest subsequence that is already in the correct relative order. */
function longestIncreasingSubsequence(sequence: number[]): number {
  const tails: number[] = [];
  for (const value of sequence) {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < value) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = value;
  }
  return tails.length;
}

/* ---------------------------- per-type scoring --------------------------- */

function scoreSelection(
  selected: string[],
  correct: string[],
  allOrNothing: boolean,
): number {
  const correctSet = new Set(correct);
  const hits = selected.filter((id) => correctSet.has(id)).length;
  const falsePositives = selected.length - hits;
  if (allOrNothing) {
    return hits === correct.length && falsePositives === 0 ? 1 : 0;
  }
  // Partial credit: hits minus false positives, so guessing everything scores zero.
  return correct.length === 0 ? 0 : (hits - falsePositives) / correct.length;
}

function evaluateSingleChoice(q: SingleChoiceQuestion, optionId: string) {
  const fraction = optionId === q.correctOptionId ? 1 : 0;
  return {
    fraction,
    optionStates: markChoices(
      q.options.map((o) => o.id),
      [q.correctOptionId],
      [optionId],
    ),
  };
}

function evaluateMultipleChoice(q: MultipleChoiceQuestion, optionIds: string[]) {
  return {
    fraction: scoreSelection(optionIds, q.correctOptionIds, q.scoring === 'all_or_nothing'),
    optionStates: markChoices(
      q.options.map((o) => o.id),
      q.correctOptionIds,
      optionIds,
    ),
  };
}

function evaluateTrueFalse(q: TrueFalseQuestion, value: boolean) {
  return { fraction: value === q.correctAnswer ? 1 : 0, optionStates: undefined };
}

function evaluateOrdering(q: OrderingQuestion, order: string[]) {
  const target = new Map(q.correctOrder.map((id, index) => [id, index]));
  const positions = order.map((id) => target.get(id) ?? -1);
  const exact = positions.every((pos, index) => pos === index);
  if (exact) return { fraction: 1, optionStates: undefined };

  const n = q.correctOrder.length;
  const lis = longestIncreasingSubsequence(positions);
  // A fully reversed sequence scores 0; one displaced item still scores well.
  const fraction = n > 1 ? (lis - 1) / (n - 1) : 0;

  const optionStates: Record<string, OptionState> = {};
  order.forEach((id, index) => {
    optionStates[id] = target.get(id) === index ? 'correct' : 'wrong';
  });
  return { fraction: Math.min(fraction, 0.99), optionStates };
}

function evaluateClassification(q: ClassificationQuestion, assignment: Record<string, string>) {
  const optionStates: Record<string, OptionState> = {};
  let hits = 0;
  for (const item of q.items) {
    const ok = assignment[item.id] === item.correctCategoryId;
    if (ok) hits += 1;
    optionStates[item.id] = ok ? 'correct' : 'wrong';
  }
  return { fraction: q.items.length === 0 ? 0 : hits / q.items.length, optionStates };
}

function evaluateDataInterpretation(q: DataInterpretationQuestion, selected: string[]) {
  return {
    fraction: scoreSelection(selected, q.correctOptionIds, q.select === 'single'),
    optionStates: markChoices(
      q.options.map((o) => o.id),
      q.correctOptionIds,
      selected,
    ),
  };
}

function evaluateEvidenceRating(q: EvidenceRatingQuestion, level: number) {
  const distance = Math.abs(level - q.correctLevel);
  const tolerance = q.tolerance ?? 1;
  // Judging evidence strength is not a binary skill: being one rung off
  // is a different mistake from confusing plausibility with proof.
  const fraction = distance === 0 ? 1 : distance <= tolerance ? 0.5 : 0;
  return { fraction, optionStates: undefined };
}

function evaluateDecision(q: DecisionQuestion, optionId: string) {
  const chosen = q.options.find((o) => o.id === optionId);
  const fraction = chosen?.quality === 'optimal' ? 1 : chosen?.quality === 'acceptable' ? 0.6 : 0;
  const optionStates: Record<string, OptionState> = {};
  for (const option of q.options) {
    if (option.quality === 'optimal') {
      optionStates[option.id] = option.id === optionId ? 'correct' : 'missed';
    } else if (option.id === optionId) {
      optionStates[option.id] = option.quality === 'acceptable' ? 'partial' : 'wrong';
    } else {
      optionStates[option.id] = 'neutral';
    }
  }
  return { fraction, optionStates };
}

/* ------------------------------- dispatcher ------------------------------ */

class AnswerShapeError extends Error {}

function expect<T extends AnswerValue['kind']>(
  answer: AnswerValue,
  kind: T,
): Extract<AnswerValue, { kind: T }> {
  if (answer.kind !== kind) {
    throw new AnswerShapeError(`Expected answer of kind "${kind}", received "${answer.kind}".`);
  }
  return answer as Extract<AnswerValue, { kind: T }>;
}

export function evaluate(question: Question, answer: AnswerValue): EvaluationResult {
  let outcome: { fraction: number; optionStates?: Record<string, OptionState> };

  switch (question.type) {
    case 'single_choice':
      outcome = evaluateSingleChoice(question, expect(answer, 'option').optionId);
      break;
    case 'multiple_choice':
      outcome = evaluateMultipleChoice(question, expect(answer, 'options').optionIds);
      break;
    case 'true_false':
      outcome = evaluateTrueFalse(question, expect(answer, 'boolean').value);
      break;
    case 'ordering':
      outcome = evaluateOrdering(question, expect(answer, 'order').order);
      break;
    case 'classification':
      outcome = evaluateClassification(question, expect(answer, 'assignment').assignment);
      break;
    case 'data_interpretation':
      outcome = evaluateDataInterpretation(
        question,
        answer.kind === 'option' ? [answer.optionId] : expect(answer, 'options').optionIds,
      );
      break;
    case 'evidence_rating':
      outcome = evaluateEvidenceRating(question, expect(answer, 'level').level);
      break;
    case 'decision':
      outcome = evaluateDecision(question, expect(answer, 'option').optionId);
      break;
  }

  const status = statusFor(outcome.fraction);
  return {
    questionId: question.id,
    competency: question.competency,
    status,
    awardedPoints: award(outcome.fraction, question.points),
    maxPoints: question.points,
    feedback: pickFeedback(question, status),
    explanation: question.explanation,
    optionStates: outcome.optionStates,
    answeredAt: new Date().toISOString(),
  };
}

/** Mechanism or Hype? statements score against the `critical` competency. */
export function evaluateHype(statement: HypeStatement, answer: AnswerValue): EvaluationResult {
  const verdict = expect(answer, 'verdict').verdict;
  const correct = verdict === statement.verdict;
  return {
    questionId: statement.id,
    competency: 'critical',
    status: correct ? 'correct' : 'incorrect',
    awardedPoints: correct ? statement.points : 0,
    maxPoints: statement.points,
    feedback: statement.explanation,
    optionStates: {
      [statement.verdict]: 'correct',
      ...(correct ? {} : { [verdict]: 'wrong' as OptionState }),
    },
    answeredAt: new Date().toISOString(),
  };
}
