import type { Competency } from './content';
import type { AnswerValue, EvaluationResult } from './answers';
import type { Locale } from './i18n';

export type WeekStatus = 'not_started' | 'in_progress' | 'completed' | 'locked';

export interface CompetencyScore {
  earned: number;
  max: number;
}

export interface WeekProgress {
  weekId: string;
  status: Exclude<WeekStatus, 'locked'>;
  /** Index in the generated module flow — allows resuming after reload. */
  stepIndex: number;
  answers: Record<string, AnswerValue>;
  results: Record<string, EvaluationResult>;
  totalScore: number;
  maxScore: number;
  scoreByCompetency: Record<Competency, CompetencyScore>;
  startedAt?: string;
  completedAt?: string;
}

export interface StudentProfile {
  /** Generated locally; never leaves the device in the MVP. */
  id: string;
  /** Name or student identifier chosen by the learner. */
  displayName: string;
  locale: Locale;
  createdAt: string;
}

export interface CourseProgress {
  schemaVersion: number;
  profile: StudentProfile;
  weeks: Record<string, WeekProgress>;
}

/**
 * Persistence boundary. The MVP ships a localStorage implementation;
 * a backend-backed store can replace it without touching the UI.
 */
export interface ProgressStore {
  load(): Promise<CourseProgress | null>;
  save(progress: CourseProgress): Promise<void>;
  clear(): Promise<void>;
}
