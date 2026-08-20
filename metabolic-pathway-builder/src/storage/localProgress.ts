/*
 * localStorage-backed progress. The ProgressStore interface is the seam where a
 * server-backed store (and with it the teacher dashboard) can be dropped in.
 */
import type { ProgressState, ProgressStore, RunRecord } from '@/types/progress';

const KEY = 'mpb.progress.v1';
const HISTORY_LIMIT = 50;

export const emptyProgress = (): ProgressState => ({
  totalXp: 0,
  bestStreak: 0,
  pathways: {},
  history: [],
});

export const localProgressStore: ProgressStore = {
  load() {
    if (typeof localStorage === 'undefined') return emptyProgress();
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return emptyProgress();
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      return { ...emptyProgress(), ...parsed };
    } catch {
      return emptyProgress();
    }
  },
  save(state) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* Private mode or a full quota: progress is a convenience, never a blocker. */
    }
  },
  clear() {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(KEY);
  },
};

export function applyRun(state: ProgressState, run: RunRecord, bestStreak: number): ProgressState {
  const pathway = state.pathways[run.pathwayId] ?? { best: {}, runs: 0, lastPlayedAt: null };
  const previous = pathway.best[run.difficulty];
  const best =
    !previous || run.accuracy > previous.accuracy || run.xp > previous.xp
      ? { xp: Math.max(previous?.xp ?? 0, run.xp), accuracy: Math.max(previous?.accuracy ?? 0, run.accuracy) }
      : previous;

  return {
    totalXp: state.totalXp + run.xp,
    bestStreak: Math.max(state.bestStreak, bestStreak),
    pathways: {
      ...state.pathways,
      [run.pathwayId]: {
        best: { ...pathway.best, [run.difficulty]: best },
        runs: pathway.runs + 1,
        lastPlayedAt: run.completedAt,
      },
    },
    history: [run, ...state.history].slice(0, HISTORY_LIMIT),
  };
}

/** Mastery of a pathway: the mean of the best accuracy reached per difficulty. */
export function masteryOf(state: ProgressState, pathwayId: string): number {
  const pathway = state.pathways[pathwayId];
  if (!pathway) return 0;
  const difficulties = ['beginner', 'intermediate', 'expert'] as const;
  const sum = difficulties.reduce((total, key) => total + (pathway.best[key]?.accuracy ?? 0), 0);
  return sum / difficulties.length;
}
