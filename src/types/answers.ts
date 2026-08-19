import type { Competency, HypeVerdict } from './content';
import type { LocalizedText } from './i18n';

/** Discriminated union covering every question type's answer shape. */
export type AnswerValue =
  | { kind: 'option'; optionId: string }
  | { kind: 'options'; optionIds: string[] }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'order'; order: string[] }
  | { kind: 'assignment'; assignment: Record<string, string> } // itemId -> categoryId
  | { kind: 'level'; level: number }
  | { kind: 'verdict'; verdict: HypeVerdict };

export type AnswerStatus = 'correct' | 'partial' | 'incorrect';

/** How a single option/item should be marked in the UI after answering. */
export type OptionState = 'correct' | 'missed' | 'partial' | 'wrong' | 'neutral';

export interface EvaluationResult {
  questionId: string;
  competency: Competency;
  status: AnswerStatus;
  awardedPoints: number;
  maxPoints: number;
  feedback: LocalizedText;
  explanation?: LocalizedText;
  /** optionId / itemId -> visual state. */
  optionStates?: Record<string, OptionState>;
  /** ISO timestamp, used by the (later) instructor analytics. */
  answeredAt: string;
}
