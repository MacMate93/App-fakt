/*
 * Turns a finished session into the numbers and the "mastered / needs review"
 * lists shown on the completion screen.
 */
import type { SessionState, Slot } from '@/types/session';
import type { PathwayIndex } from './pathwayModel';
import { PERFECT_BONUS, QUIZ_XP } from './scoring';

/** More than a handful of review items stops being a study list. */
const REVIEW_LIMIT = 6;

export interface ReviewItem {
  label: string;
  reason: string;
}

export interface RunSummary {
  totalSlots: number;
  solved: number;
  attempts: number;
  firstTry: number;
  hintsUsed: number;
  /** Solved positions per attempt spent, 0–1. */
  accuracy: number;
  slotXp: number;
  quizXp: number;
  bonus: number;
  xp: number;
  durationMs: number;
  bestStreak: number;
  mastered: string[];
  needsReview: ReviewItem[];
  quizCorrect: number;
  quizTotal: number;
}

export function isPerfectRun(state: SessionState): boolean {
  if (state.slots.length === 0) return false;
  return state.slots.every((slot) => {
    const result = state.results[slot.id];
    return result?.solved && result.attempts === 1 && result.hintsUsed === 0;
  });
}

export function summariseRun(index: PathwayIndex, state: SessionState): RunSummary {
  const results = state.slots.map((slot) => state.results[slot.id]);
  const attempts = results.reduce((sum, result) => sum + (result?.attempts ?? 0), 0);
  const solved = results.filter((result) => result?.solved).length;
  const firstTry = results.filter((result) => result?.solved && result.attempts === 1).length;
  const hintsUsed = results.reduce((sum, result) => sum + (result?.hintsUsed ?? 0), 0);
  const slotXp = results.reduce((sum, result) => sum + (result?.xp ?? 0), 0);

  const quiz = index.pathway.summaryQuiz ?? [];
  const quizCorrect = quiz.filter((item) => state.quizAnswers[item.id] === item.answerId).length;
  const quizXp = quizCorrect * QUIZ_XP;
  const bonus = isPerfectRun(state) ? PERFECT_BONUS : 0;

  const mastered: string[] = [];
  const needsReview: ReviewItem[] = [];

  for (const concept of index.pathway.keyConcepts ?? []) {
    const conceptSlots = state.slots.filter((slot) =>
      concept.reactionIds.includes(slot.anchor.reactionId),
    );
    if (conceptSlots.length === 0) continue;
    const clean = conceptSlots.every((slot) => {
      const result = state.results[slot.id];
      return result?.solved && result.attempts === 1;
    });
    if (clean) mastered.push(concept.label);
    else needsReview.push({ label: concept.label, reason: conceptSlotsReason(state, concept.reactionIds) });
  }

  // Name what actually cost the student attempts, in the terms it was asked:
  // an enzyme task names the enzyme, an energy task names the step.
  for (const slot of state.slots) {
    const result = state.results[slot.id];
    if (!result || (result.solved && result.attempts === 1)) continue;
    const item = reviewItemFor(index, slot);
    if (item && !needsReview.some((existing) => existing.label === item.label)) {
      needsReview.push(item);
    }
    if (needsReview.length >= REVIEW_LIMIT) break;
  }

  return {
    totalSlots: state.slots.length,
    solved,
    attempts,
    firstTry,
    hintsUsed,
    accuracy: attempts === 0 ? 0 : solved / attempts,
    slotXp,
    quizXp,
    bonus,
    xp: slotXp + quizXp + bonus,
    durationMs: (state.finishedAt ?? Date.now()) - state.startedAt,
    bestStreak: state.bestStreak,
    mastered,
    needsReview,
    quizCorrect,
    quizTotal: quiz.length,
  };
}

function reviewItemFor(index: PathwayIndex, slot: Slot): ReviewItem | null {
  const reaction = index.reactions.get(slot.anchor.reactionId);
  if (!reaction) return null;
  const step = `Step ${reaction.step}: ${reaction.reactionType.toLowerCase()}`;

  if (slot.kind === 'enzyme') {
    const enzyme = index.enzymes.get(reaction.enzymeId);
    if (!enzyme) return null;
    const label =
      enzyme.abbr && enzyme.abbr !== enzyme.name ? `${enzyme.name} (${enzyme.abbr})` : enzyme.name;
    return { label, reason: step };
  }

  if (slot.kind === 'metabolite') {
    const id = slot.answerTokenIds[0]?.split(':')[1] ?? '';
    const metabolite = index.metabolites.get(id);
    return metabolite ? { label: metabolite.name, reason: step } : null;
  }

  return {
    label: slot.kind === 'energy' ? `Energetics of step ${reaction.step}` : `Cofactor of step ${reaction.step}`,
    reason: `${reaction.substrates.map((sid) => index.metabolites.get(sid)?.name ?? sid).join(' + ')} → ${reaction.products.map((pid) => index.metabolites.get(pid)?.name ?? pid).join(' + ')}`,
  };
}

function conceptSlotsReason(state: SessionState, reactionIds: string[]): string {
  const missed = state.slots.filter((slot) => {
    const result = state.results[slot.id];
    return reactionIds.includes(slot.anchor.reactionId) && result && !result.solved;
  }).length;
  return missed > 0 ? `${missed} position left unsolved` : 'Needed more than one attempt';
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
