import { describe, expect, it } from 'vitest';
import { glycolysis } from '@/data';
import type { PlayablePathway } from '@/types/pathway';
import type { Difficulty, TaskMode } from '@/types/session';
import { generateSession } from './generateSession';
import { buildCanvasModel, splitRowsIntoColumns } from './pathwayModel';

const pathway = glycolysis as PlayablePathway;
const MODES: TaskMode[] = ['build', 'missing-metabolite', 'missing-enzyme', 'energy', 'cofactor'];
const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'expert'];

const session = (mode: TaskMode, difficulty: Difficulty, seed = 42) =>
  generateSession(pathway, { pathwayId: pathway.id, mode, difficulty, gameMode: 'learning', seed });

describe.each(MODES)('mode %s', (mode) => {
  describe.each(DIFFICULTIES)('at %s', (difficulty) => {
    const generated = session(mode, difficulty);

    it('produces at least one task', () => {
      expect(generated.slots.length).toBeGreaterThan(0);
    });

    it('offers a token for every correct answer', () => {
      const ids = new Set(generated.tokens.map((token) => token.id));
      for (const slot of generated.slots) {
        expect(slot.answerTokenIds.length).toBeGreaterThan(0);
        expect(slot.answerTokenIds.some((id) => ids.has(id))).toBe(true);
      }
    });

    it('offers enough copies of a token that answers several positions', () => {
      for (const token of generated.tokens) {
        const needed = generated.slots.filter((slot) =>
          slot.answerTokenIds.includes(token.id),
        ).length;
        expect(token.count).toBe(needed);
      }
    });

    it('offers wrong answers alongside the right ones', () => {
      const correct = new Set(generated.slots.flatMap((slot) => slot.answerTokenIds));
      expect(generated.tokens.some((token) => !correct.has(token.id))).toBe(true);
    });

    it('never blanks two metabolites of the same reaction', () => {
      const perReaction = new Map<string, number>();
      for (const slot of generated.slots) {
        if (slot.kind !== 'metabolite') continue;
        const count = (perReaction.get(slot.anchor.reactionId) ?? 0) + 1;
        perReaction.set(slot.anchor.reactionId, count);
        expect(count).toBeLessThanOrEqual(1);
      }
    });

    it('gives every task a prompt and a unique id', () => {
      const ids = generated.slots.map((slot) => slot.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const slot of generated.slots) expect(slot.prompt.length).toBeGreaterThan(10);
    });

    it('orders the tasks along the pathway', () => {
      const steps = generated.slots.map(
        (slot) => pathway.reactions.find((r) => r.id === slot.anchor.reactionId)?.step ?? 0,
      );
      expect([...steps].sort((a, b) => a - b)).toEqual(steps);
    });
  });
});

describe('difficulty', () => {
  it('blanks more of the pathway as it goes up', () => {
    const beginner = session('build', 'beginner').slots.length;
    const intermediate = session('build', 'intermediate').slots.length;
    const expert = session('build', 'expert').slots.length;
    expect(beginner).toBeLessThan(intermediate);
    expect(intermediate).toBeLessThan(expert);
  });

  it('keeps beginner sessions short', () => {
    expect(session('build', 'beginner').slots.length).toBeLessThanOrEqual(5);
  });

  it('asks for cofactors and energetics only at expert level in build mode', () => {
    const kinds = (difficulty: Difficulty) =>
      new Set(session('build', difficulty).slots.map((slot) => slot.kind));
    expect(kinds('beginner').has('metabolite')).toBe(false);
    expect(kinds('expert').has('redox')).toBe(true);
  });

  it('offers more distractors as difficulty rises', () => {
    const wrongCount = (difficulty: Difficulty) => {
      const generated = session('missing-enzyme', difficulty);
      const correct = new Set(generated.slots.flatMap((slot) => slot.answerTokenIds));
      return generated.tokens.filter((token) => !correct.has(token.id)).length;
    };
    expect(wrongCount('beginner')).toBeLessThan(wrongCount('expert'));
  });
});

describe('focused modes', () => {
  it('asks only about enzymes in Missing Enzyme', () => {
    for (const slot of session('missing-enzyme', 'intermediate').slots) {
      expect(slot.kind).toBe('enzyme');
    }
  });

  it('asks only about metabolites in Missing Metabolite', () => {
    for (const slot of session('missing-metabolite', 'intermediate').slots) {
      expect(slot.kind).toBe('metabolite');
    }
  });

  it('accepts both hexokinase and glucokinase for the first step', () => {
    const generated = session('missing-enzyme', 'expert');
    const first = generated.slots.find((slot) => slot.anchor.reactionId === 'r1');
    expect(first?.answerTokenIds).toContain('enzyme:hexokinase');
    expect(first?.answerTokenIds).toContain('enzyme:glucokinase');
  });

  it('expects "no ATP involved" where no ATP is involved', () => {
    const generated = session('energy', 'expert');
    const isomerisation = generated.slots.find((slot) => slot.anchor.reactionId === 'r2');
    expect(isomerisation?.answerTokenIds).toEqual(['energy:no-energy']);
  });
});

describe('seeding', () => {
  it('is deterministic for a given seed', () => {
    expect(session('build', 'intermediate', 7)).toEqual(session('build', 'intermediate', 7));
  });

  it('varies between seeds', () => {
    const a = session('build', 'intermediate', 1).slots.map((slot) => slot.id);
    const b = session('build', 'intermediate', 999).slots.map((slot) => slot.id);
    expect(a).not.toEqual(b);
  });
});

describe('canvas columns', () => {
  const rows = buildCanvasModel(pathway).rows;

  it('keeps every reaction, in order, whatever the column count', () => {
    for (const columns of [1, 2, 3]) {
      const flat = splitRowsIntoColumns(rows, columns).flat();
      expect(flat.map((row) => row.reaction.id)).toEqual(rows.map((row) => row.reaction.id));
    }
  });

  it('never leaves a column empty', () => {
    for (const columns of [2, 3]) {
      const groups = splitRowsIntoColumns(rows, columns);
      expect(groups).toHaveLength(columns);
      for (const group of groups) expect(group.length).toBeGreaterThan(0);
    }
  });

  it('balances the columns rather than cutting them at equal row counts', () => {
    const groups = splitRowsIntoColumns(rows, 2);
    const sizes = groups.map((group) => group.length);
    // The side branch and the two-product split make the first half taller, so
    // a balanced layout gives the first column no more rows than the second.
    expect(Math.abs(sizes[0] - sizes[1])).toBeLessThanOrEqual(2);
  });

  it('breaks glycolysis between the investment and the payoff phase', () => {
    const [first] = splitRowsIntoColumns(rows, 2);
    expect(first.every((row) => (row.reaction.factor ?? 1) === 1)).toBe(true);
  });
});
