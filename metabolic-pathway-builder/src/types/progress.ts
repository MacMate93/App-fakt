import type { Difficulty, GameMode } from './session';

export interface RunRecord {
  pathwayId: string;
  difficulty: Difficulty;
  gameMode: GameMode;
  xp: number;
  accuracy: number;
  hintsUsed: number;
  durationMs: number;
  completedAt: number;
}

export interface PathwayProgress {
  /** Best accuracy (0–1) reached per difficulty. */
  best: Partial<Record<Difficulty, { xp: number; accuracy: number }>>;
  runs: number;
  lastPlayedAt: number | null;
}

export interface ProgressState {
  totalXp: number;
  bestStreak: number;
  pathways: Record<string, PathwayProgress>;
  history: RunRecord[];
}

/**
 * Persistence boundary. localStorage today; a fetch-backed implementation can
 * be swapped in for the teacher dashboard without touching the UI.
 */
export interface ProgressStore {
  load(): ProgressState;
  save(state: ProgressState): void;
  clear(): void;
}
