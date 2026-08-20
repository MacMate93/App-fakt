/*
 * Scoring rules, in one place so that a teacher can retune them without
 * hunting through the UI.
 */
export const XP_BY_ATTEMPT = [100, 70, 40];
/** Fourth and further attempts. */
export const XP_LATE_ATTEMPT = 20;
export const HINT_COST = 20;
export const MIN_XP_PER_SLOT = 10;
export const PERFECT_BONUS = 500;
export const QUIZ_XP = 50;

export function xpForSolve(attempt: number, hintsUsed: number): number {
  const base = XP_BY_ATTEMPT[attempt - 1] ?? XP_LATE_ATTEMPT;
  return Math.max(MIN_XP_PER_SLOT, base - hintsUsed * HINT_COST);
}

export interface StreakTier {
  at: number;
  label: string;
}

export const STREAK_TIERS: StreakTier[] = [
  { at: 3, label: 'Warmed up' },
  { at: 5, label: 'On a roll' },
  { at: 10, label: 'Locked in' },
  { at: 20, label: 'Pathway fluent' },
];

export function streakTier(streak: number): StreakTier | undefined {
  return [...STREAK_TIERS].reverse().find((tier) => streak >= tier.at);
}
