/*
 * Content invariants. These are what stop a new pathway file from silently
 * breaking task generation: every id has to resolve, every step has to exist.
 */
import { describe, expect, it } from 'vitest';
import { pathways } from './index';
import { isPlayable } from '@/types/pathway';
import { computeBalance, indexPathway } from '@/engine/pathwayModel';

const playable = pathways.filter(isPlayable);

describe('pathway registry', () => {
  it('has unique pathway ids', () => {
    const ids = pathways.map((pathway) => pathway.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ships at least one playable pathway', () => {
    expect(playable.length).toBeGreaterThan(0);
  });
});

describe.each(playable.map((pathway) => [pathway.name, pathway] as const))(
  '%s',
  (_name, pathway) => {
    const index = indexPathway(pathway);

    it('resolves every id referenced by a reaction', () => {
      for (const reaction of pathway.reactions) {
        for (const id of [...reaction.substrates, ...reaction.products]) {
          expect(index.metabolites.has(id), `metabolite ${id}`).toBe(true);
        }
        expect(index.enzymes.has(reaction.enzymeId), `enzyme ${reaction.enzymeId}`).toBe(true);
        for (const id of reaction.acceptAlso ?? []) {
          expect(index.enzymes.has(id), `alternative enzyme ${id}`).toBe(true);
        }
        for (const id of reaction.coupleIds) {
          expect(index.couples.has(id), `couple ${id}`).toBe(true);
        }
      }
    });

    it('numbers the steps consecutively from 1', () => {
      const steps = pathway.reactions.map((reaction) => reaction.step).sort((a, b) => a - b);
      expect(steps).toEqual(steps.map((_, i) => i + 1));
    });

    it('chains every reaction to the one before it', () => {
      const sorted = [...pathway.reactions].sort((a, b) => a.step - b.step);
      const available = new Set(sorted[0]?.substrates ?? []);
      for (const reaction of sorted) {
        for (const substrate of reaction.substrates) {
          expect(available.has(substrate), `step ${reaction.step} needs ${substrate}`).toBe(true);
        }
        for (const product of reaction.products) available.add(product);
      }
    });

    it('keeps decoys off the pathway', () => {
      for (const decoy of pathway.decoys?.enzymes ?? []) {
        expect(index.onPathwayEnzymeIds.has(decoy.id), `${decoy.id} is a decoy`).toBe(false);
      }
      for (const decoy of pathway.decoys?.metabolites ?? []) {
        expect(index.onPathwayMetaboliteIds.has(decoy.id), `${decoy.id} is a decoy`).toBe(false);
      }
    });

    it('points every key concept at a real reaction', () => {
      for (const concept of pathway.keyConcepts ?? []) {
        for (const id of concept.reactionIds) expect(index.reactions.has(id)).toBe(true);
      }
    });

    it('has a valid answer for every wrap-up question', () => {
      for (const item of pathway.summaryQuiz ?? []) {
        expect(item.options.some((option) => option.id === item.answerId)).toBe(true);
      }
    });
  },
);

describe('glycolysis energetics', () => {
  const glycolysis = playable.find((pathway) => pathway.id === 'glycolysis');
  const balance = glycolysis ? computeBalance(glycolysis) : null;

  it('spends 2 ATP and makes 4, for a net gain of 2', () => {
    expect(balance?.atpConsumed).toBe(2);
    expect(balance?.atpProduced).toBe(4);
    expect(balance?.netAtp).toBe(2);
  });

  it('makes 2 NADH and 2 pyruvate per glucose', () => {
    expect(balance?.cofactors.nadh).toBe(2);
    expect(balance?.outputs).toEqual([{ metaboliteId: 'pyruvate', count: 2 }]);
  });

  it('agrees with the answer given in the wrap-up quiz', () => {
    const item = glycolysis?.summaryQuiz?.find((quiz) => quiz.id === 'net-atp');
    const answer = item?.options.find((option) => option.id === item.answerId);
    expect(answer?.label).toBe(`${balance?.netAtp} ATP`);
  });
});
