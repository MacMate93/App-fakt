/*
 * The session reducer — all game rules, no React.
 *
 * Learning mode checks every placement immediately and lets the student retry;
 * exam mode accepts placements silently and evaluates once, at submission.
 */
import type { PlayablePathway } from '@/types/pathway';
import type { SessionConfig, SessionState, SlotResult } from '@/types/session';
import { generateSession } from './generateSession';
import { correctFeedback, incorrectFeedback } from './feedback';
import { HINT_TIERS } from './hints';
import { indexPathway, type PathwayIndex } from './pathwayModel';
import { PERFECT_BONUS, xpForSolve } from './scoring';
import { isPerfectRun } from './summary';

export type SessionAction =
  | { type: 'select-slot'; slotId: string | null }
  | { type: 'place'; slotId: string; tokenId: string }
  | { type: 'clear'; slotId: string }
  | { type: 'hint'; slotId: string }
  | { type: 'dismiss-feedback' }
  | { type: 'submit' }
  | { type: 'answer-quiz'; itemId: string; optionId: string }
  | { type: 'skip-quiz' };

const emptyResult = (): SlotResult => ({
  attempts: 0,
  hintsUsed: 0,
  solved: false,
  xp: 0,
  wrongTokenIds: [],
});

export function createSessionState(
  pathway: PlayablePathway,
  config: SessionConfig,
  now = Date.now(),
): SessionState {
  const generated = generateSession(pathway, config);
  return {
    config,
    slots: generated.slots,
    tokens: generated.tokens,
    placements: {},
    results: {},
    hintsShown: {},
    activeSlotId: generated.slots[0]?.id ?? null,
    feedback: null,
    streak: 0,
    bestStreak: 0,
    xp: 0,
    phase: 'playing',
    quizAnswers: {},
    startedAt: now,
    finishedAt: null,
  };
}

/** How many copies of a token are still available in the tray. */
export function tokenAvailability(state: SessionState): Record<string, number> {
  const placedCount: Record<string, number> = {};
  for (const tokenId of Object.values(state.placements)) {
    if (tokenId) placedCount[tokenId] = (placedCount[tokenId] ?? 0) + 1;
  }

  const availability: Record<string, number> = {};
  for (const token of state.tokens) {
    const placed = placedCount[token.id] ?? 0;
    if (token.count === 0) {
      // A distractor: always exactly one in the tray, unless it is sitting in a slot.
      availability[token.id] = Math.max(0, 1 - placed);
      continue;
    }
    const open = state.slots.filter(
      (slot) =>
        slot.answerTokenIds.includes(token.id) &&
        !state.results[slot.id]?.solved &&
        !state.placements[slot.id],
    ).length;
    availability[token.id] = Math.max(0, Math.min(token.count - placed, open));
  }
  return availability;
}

export const isSolved = (state: SessionState, slotId: string): boolean =>
  Boolean(state.results[slotId]?.solved);

export const allSlotsAnswered = (state: SessionState): boolean =>
  state.slots.every((slot) =>
    state.config.gameMode === 'exam'
      ? Boolean(state.placements[slot.id])
      : isSolved(state, slot.id),
  );

export function createSessionReducer(pathway: PlayablePathway) {
  const index = indexPathway(pathway);
  return (state: SessionState, action: SessionAction): SessionState =>
    reduce(index, state, action);
}

function reduce(
  index: PathwayIndex,
  state: SessionState,
  action: SessionAction,
): SessionState {
  switch (action.type) {
    case 'select-slot':
      return { ...state, activeSlotId: action.slotId };

    case 'dismiss-feedback':
      return { ...state, feedback: null };

    case 'clear': {
      if (isSolved(state, action.slotId)) return state;
      const placements = { ...state.placements };
      delete placements[action.slotId];
      return { ...state, placements, feedback: null };
    }

    case 'hint': {
      const shown = state.hintsShown[action.slotId] ?? 0;
      if (state.config.gameMode === 'exam' || shown >= HINT_TIERS) return state;
      return {
        ...state,
        activeSlotId: action.slotId,
        hintsShown: { ...state.hintsShown, [action.slotId]: shown + 1 },
      };
    }

    case 'place':
      return place(index, state, action.slotId, action.tokenId);

    case 'submit':
      return submitExam(index, state);

    case 'answer-quiz': {
      const quizAnswers = { ...state.quizAnswers, [action.itemId]: action.optionId };
      const total = index.pathway.summaryQuiz?.length ?? 0;
      const answered = Object.keys(quizAnswers).length;
      return {
        ...state,
        quizAnswers,
        phase: answered >= total ? 'complete' : state.phase,
      };
    }

    case 'skip-quiz':
      return { ...state, phase: 'complete' };
  }
}

function place(
  index: PathwayIndex,
  state: SessionState,
  slotId: string,
  tokenId: string,
): SessionState {
  const slot = state.slots.find((candidate) => candidate.id === slotId);
  if (!slot || state.phase !== 'playing' || isSolved(state, slotId)) return state;

  const token = state.tokens.find((candidate) => candidate.id === tokenId);
  if (!token || token.kind !== slot.kind) return state;

  if (state.config.gameMode === 'exam') {
    return {
      ...state,
      placements: { ...state.placements, [slotId]: tokenId },
      activeSlotId: nextOpenSlot(state, slotId),
    };
  }

  const previous = state.results[slotId] ?? emptyResult();
  const attempts = previous.attempts + 1;
  const hintsUsed = state.hintsShown[slotId] ?? 0;
  const correct = slot.answerTokenIds.includes(tokenId);

  if (!correct) {
    const results = {
      ...state.results,
      [slotId]: {
        ...previous,
        attempts,
        hintsUsed,
        wrongTokenIds: [...previous.wrongTokenIds, tokenId],
      },
    };
    return {
      ...state,
      results,
      streak: 0,
      activeSlotId: slotId,
      feedback: incorrectFeedback(index, slot, tokenId),
    };
  }

  const xp = xpForSolve(attempts, hintsUsed);
  const results = {
    ...state.results,
    [slotId]: { ...previous, attempts, hintsUsed, solved: true, xp },
  };
  const streak = state.streak + 1;
  const next: SessionState = {
    ...state,
    placements: { ...state.placements, [slotId]: tokenId },
    results,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    xp: state.xp + xp,
    feedback: correctFeedback(index, slot),
    activeSlotId: nextOpenSlot({ ...state, results }, slotId),
  };

  return allSlotsAnswered(next) ? finishPlaying(index, next) : next;
}

function submitExam(index: PathwayIndex, state: SessionState): SessionState {
  if (state.phase !== 'playing') return state;
  const results: Record<string, SlotResult> = {};
  let xp = 0;
  for (const slot of state.slots) {
    const placed = state.placements[slot.id];
    const solved = Boolean(placed && slot.answerTokenIds.includes(placed));
    const gained = solved ? xpForSolve(1, 0) : 0;
    xp += gained;
    results[slot.id] = {
      attempts: 1,
      hintsUsed: 0,
      solved,
      xp: gained,
      wrongTokenIds: !solved && placed ? [placed] : [],
    };
  }
  return finishPlaying(index, { ...state, results, xp });
}

function finishPlaying(index: PathwayIndex, state: SessionState): SessionState {
  const bonus = isPerfectRun(state) ? PERFECT_BONUS : 0;
  const hasQuiz = (index.pathway.summaryQuiz?.length ?? 0) > 0;
  return {
    ...state,
    xp: state.xp + bonus,
    finishedAt: Date.now(),
    activeSlotId: null,
    phase: hasQuiz ? 'quiz' : 'complete',
  };
}

function nextOpenSlot(state: SessionState, currentSlotId: string): string | null {
  const order = state.slots.map((slot) => slot.id);
  const start = order.indexOf(currentSlotId);
  for (let step = 1; step <= order.length; step += 1) {
    const candidate = order[(start + step) % order.length];
    if (!candidate) continue;
    const open =
      state.config.gameMode === 'exam'
        ? !state.placements[candidate]
        : !state.results[candidate]?.solved;
    if (open) return candidate;
  }
  return null;
}
