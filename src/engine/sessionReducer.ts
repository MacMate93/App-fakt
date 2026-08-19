import type { AnswerValue, EvaluationResult } from '../types/answers';

/** State of one week being played. Kept serialisable for persistence. */
export interface SessionState {
  weekId: string;
  stepIndex: number;
  answers: Record<string, AnswerValue>;
  results: Record<string, EvaluationResult>;
  status: 'in_progress' | 'completed';
}

export type SessionAction =
  | { type: 'answer'; questionId: string; answer: AnswerValue; result: EvaluationResult }
  | { type: 'next'; stepCount: number }
  | { type: 'complete' }
  | { type: 'restart' };

export function createSession(weekId: string): SessionState {
  return { weekId, stepIndex: 0, answers: {}, results: {}, status: 'in_progress' };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'answer':
      // Answers are final: the score is recorded once, as a clinical decision is.
      if (state.results[action.questionId]) return state;
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
        results: { ...state.results, [action.questionId]: action.result },
      };
    case 'next':
      return {
        ...state,
        stepIndex: Math.min(state.stepIndex + 1, action.stepCount - 1),
      };
    case 'complete':
      return { ...state, status: 'completed' };
    case 'restart':
      return createSession(state.weekId);
  }
}
