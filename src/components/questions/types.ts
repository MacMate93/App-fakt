import type { Question } from '../../types/content';
import type { AnswerValue, EvaluationResult } from '../../types/answers';

/** Every question component follows the same controlled-input contract. */
export interface QuestionViewProps<Q extends Question = Question> {
  question: Q;
  /** The answer being composed; null until the learner touches the control. */
  draft: AnswerValue | null;
  onDraft: (value: AnswerValue | null) => void;
  /** Non-null after submission: the view becomes read-only and shows marking. */
  result: EvaluationResult | null;
}

/** Deterministic shuffle so ordering items are not presented in the answer order. */
export function stableShuffle<T>(items: T[], seed: string): T[] {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const random = () => {
    hash = (hash + 0x6d2b79f5) | 0;
    let t = Math.imul(hash ^ (hash >>> 15), 1 | hash);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
