import { describe, expect, it } from 'vitest';
import { glycolysis } from '@/data';
import type { PlayablePathway } from '@/types/pathway';
import type { SessionConfig, SessionState } from '@/types/session';
import {
  createSessionReducer,
  createSessionState,
  tokenAvailability,
} from './sessionReducer';
import { HINT_COST, PERFECT_BONUS } from './scoring';
import { indexPathway } from './pathwayModel';
import { summariseRun } from './summary';

const pathway = glycolysis as PlayablePathway;
const index = indexPathway(pathway);
const reduce = createSessionReducer(pathway);

const config = (overrides: Partial<SessionConfig> = {}): SessionConfig => ({
  pathwayId: pathway.id,
  mode: 'missing-enzyme',
  difficulty: 'beginner',
  gameMode: 'learning',
  seed: 11,
  ...overrides,
});

const start = (overrides: Partial<SessionConfig> = {}): SessionState =>
  createSessionState(pathway, config(overrides));

const correctFor = (state: SessionState, slotIndex: number): string =>
  state.slots[slotIndex].answerTokenIds[0];

const wrongFor = (state: SessionState, slotIndex: number): string => {
  const slot = state.slots[slotIndex];
  const token = state.tokens.find(
    (candidate) => candidate.kind === slot.kind && !slot.answerTokenIds.includes(candidate.id),
  );
  if (!token) throw new Error('no distractor available');
  return token.id;
};

const solveAll = (initial: SessionState): SessionState =>
  initial.slots.reduce(
    (state, slot) => reduce(state, { type: 'place', slotId: slot.id, tokenId: slot.answerTokenIds[0] }),
    initial,
  );

describe('learning mode', () => {
  it('awards 100 XP for a first-try placement and keeps it filled', () => {
    const state = start();
    const next = reduce(state, {
      type: 'place',
      slotId: state.slots[0].id,
      tokenId: correctFor(state, 0),
    });
    expect(next.results[state.slots[0].id]?.solved).toBe(true);
    expect(next.results[state.slots[0].id]?.xp).toBe(100);
    expect(next.xp).toBe(100);
    expect(next.streak).toBe(1);
    expect(next.feedback?.tone).toBe('correct');
  });

  it('explains a wrong placement, leaves the slot open and lets the student retry', () => {
    const state = start();
    const slotId = state.slots[0].id;
    const afterWrong = reduce(state, { type: 'place', slotId, tokenId: wrongFor(state, 0) });

    expect(afterWrong.placements[slotId]).toBeUndefined();
    expect(afterWrong.results[slotId]?.attempts).toBe(1);
    expect(afterWrong.results[slotId]?.solved).toBe(false);
    expect(afterWrong.streak).toBe(0);
    expect(afterWrong.feedback?.tone).toBe('incorrect');
    expect(afterWrong.feedback?.body.length).toBeGreaterThan(20);

    const afterRight = reduce(afterWrong, { type: 'place', slotId, tokenId: correctFor(state, 0) });
    expect(afterRight.results[slotId]?.solved).toBe(true);
    expect(afterRight.results[slotId]?.xp).toBe(70);
  });

  it('charges for hints and never goes below the floor', () => {
    const state = start();
    const slotId = state.slots[0].id;
    const hinted = reduce(reduce(state, { type: 'hint', slotId }), { type: 'hint', slotId });
    expect(hinted.hintsShown[slotId]).toBe(2);

    const solved = reduce(hinted, { type: 'place', slotId, tokenId: correctFor(state, 0) });
    expect(solved.results[slotId]?.xp).toBe(100 - 2 * HINT_COST);
    expect(solved.results[slotId]?.xp).toBeGreaterThan(0);
  });

  it('stops handing out hints beyond the third tier', () => {
    const state = start();
    const slotId = state.slots[0].id;
    const spammed = Array.from({ length: 6 }).reduce<SessionState>(
      (current) => reduce(current, { type: 'hint', slotId }),
      state,
    );
    expect(spammed.hintsShown[slotId]).toBe(3);
  });

  it('moves on to the wrap-up questions once every position is filled', () => {
    const finished = solveAll(start());
    expect(finished.phase).toBe('quiz');
    expect(finished.finishedAt).not.toBeNull();
  });

  it('pays the flawless-run bonus only when nothing went wrong', () => {
    const clean = solveAll(start());
    expect(clean.xp).toBe(100 * clean.slots.length + PERFECT_BONUS);

    const state = start();
    const stumbled = reduce(state, {
      type: 'place',
      slotId: state.slots[0].id,
      tokenId: wrongFor(state, 0),
    });
    const finished = solveAll(stumbled);
    expect(finished.xp).toBeLessThan(100 * finished.slots.length + PERFECT_BONUS);
  });

  it('ignores a token that does not belong to the slot kind', () => {
    const state = start({ mode: 'build', difficulty: 'expert' });
    const enzymeSlot = state.slots.find((slot) => slot.kind === 'enzyme');
    const metaboliteToken = state.tokens.find((token) => token.kind === 'metabolite');
    if (!enzymeSlot || !metaboliteToken) throw new Error('fixture missing');
    const next = reduce(state, {
      type: 'place',
      slotId: enzymeSlot.id,
      tokenId: metaboliteToken.id,
    });
    expect(next).toBe(state);
  });
});

describe('token tray availability', () => {
  it('removes a token once the positions it answers are solved', () => {
    const state = start();
    const tokenId = correctFor(state, 0);
    expect(tokenAvailability(state)[tokenId]).toBeGreaterThan(0);
    const solved = reduce(state, { type: 'place', slotId: state.slots[0].id, tokenId });
    expect(tokenAvailability(solved)[tokenId]).toBe(0);
  });

  it('keeps distractors in the tray', () => {
    const state = start();
    const distractor = wrongFor(state, 0);
    const after = reduce(state, {
      type: 'place',
      slotId: state.slots[0].id,
      tokenId: distractor,
    });
    expect(tokenAvailability(after)[distractor]).toBe(1);
  });
});

describe('exam mode', () => {
  const examStart = () => start({ gameMode: 'exam' });

  it('accepts placements without saying anything', () => {
    const state = examStart();
    const next = reduce(state, {
      type: 'place',
      slotId: state.slots[0].id,
      tokenId: wrongFor(state, 0),
    });
    expect(next.feedback).toBeNull();
    expect(next.placements[state.slots[0].id]).toBeDefined();
    expect(next.results[state.slots[0].id]).toBeUndefined();
  });

  it('lets a placement be taken back', () => {
    const state = examStart();
    const slotId = state.slots[0].id;
    const placed = reduce(state, { type: 'place', slotId, tokenId: correctFor(state, 0) });
    const cleared = reduce(placed, { type: 'clear', slotId });
    expect(cleared.placements[slotId]).toBeUndefined();
  });

  it('gives no hints', () => {
    const state = examStart();
    const next = reduce(state, { type: 'hint', slotId: state.slots[0].id });
    expect(next.hintsShown[state.slots[0].id]).toBeUndefined();
  });

  it('marks everything at submission', () => {
    const state = examStart();
    const withOneWrong = state.slots.reduce(
      (current, slot, position) =>
        reduce(current, {
          type: 'place',
          slotId: slot.id,
          tokenId: position === 0 ? wrongFor(state, 0) : slot.answerTokenIds[0],
        }),
      state,
    );
    const submitted = reduce(withOneWrong, { type: 'submit' });
    const summary = summariseRun(index, submitted);

    expect(submitted.phase).toBe('quiz');
    expect(summary.solved).toBe(state.slots.length - 1);
    expect(summary.accuracy).toBeCloseTo((state.slots.length - 1) / state.slots.length);
  });
});

describe('run summary', () => {
  it('separates mastered concepts from the ones needing review', () => {
    const state = start({ mode: 'missing-enzyme', difficulty: 'expert' });
    const stumbled = reduce(state, {
      type: 'place',
      slotId: state.slots[0].id,
      tokenId: wrongFor(state, 0),
    });
    const summary = summariseRun(index, solveAll(stumbled));

    expect(summary.solved).toBe(state.slots.length);
    expect(summary.firstTry).toBe(state.slots.length - 1);
    expect(summary.needsReview.length).toBeGreaterThan(0);
    expect(summary.mastered.length).toBeGreaterThan(0);
  });
});
