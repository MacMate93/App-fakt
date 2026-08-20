import { describe, expect, it } from 'vitest';
import { glycolysis } from '@/data';
import type { PlayablePathway } from '@/types/pathway';
import type { Slot } from '@/types/session';
import { hintTiers } from './hints';
import { incorrectFeedback } from './feedback';
import { indexPathway } from './pathwayModel';

const index = indexPathway(glycolysis as PlayablePathway);

const slot = (kind: Slot['kind'], reactionId: string, answer: string): Slot => ({
  id: `${reactionId}:${kind}`,
  kind,
  anchor: { reactionId },
  answerTokenIds: [`${kind}:${answer}`],
  prompt: 'test',
});

describe('hint ladder', () => {
  it('gives three tiers that get more specific', () => {
    const tiers = hintTiers(index, slot('enzyme', 'r3', 'pfk1'));
    expect(tiers).toHaveLength(3);
    expect(tiers[0]).toContain('ATP');
    expect(tiers[2]).toContain('PFK-1');
  });

  it('describes a metabolite by its structure in the last tier', () => {
    const tiers = hintTiers(index, slot('metabolite', 'r3', 'f16bp'));
    expect(tiers[2]).toContain('6 carbon atoms');
    expect(tiers[2]).toContain('2 phosphate groups');
  });

  it('says outright when a step leaves the nucleotide pool alone', () => {
    const tiers = hintTiers(index, slot('energy', 'r2', 'no-energy'));
    expect(tiers[2]).toMatch(/not touched/i);
  });

  it('names the carrier that is formed for a redox step', () => {
    const tiers = hintTiers(index, slot('redox', 'r6', 'nad-nadh'));
    expect(tiers[2]).toContain('NADH');
  });
});

describe('wrong-answer feedback', () => {
  it('explains what the enzyme the student picked actually does', () => {
    const feedback = incorrectFeedback(index, slot('enzyme', 'r10', 'pk'), 'enzyme:pfk1');
    expect(feedback.body).toContain('Phosphofructokinase-1');
    expect(feedback.body).toContain('step 3');
  });

  it('places an off-pathway enzyme for the student', () => {
    const feedback = incorrectFeedback(index, slot('enzyme', 'r10', 'pk'), 'enzyme:ldh');
    expect(feedback.body).toContain('Lactate dehydrogenase');
    expect(feedback.body).toMatch(/lactate/i);
  });

  it('says which metabolite the student actually reached for', () => {
    const feedback = incorrectFeedback(index, slot('metabolite', 'r2', 'f6p'), 'metabolite:pyruvate');
    expect(feedback.body).toContain('Pyruvate');
    expect(feedback.body).toContain('step 10');
  });

  it('states what the step really does with ATP', () => {
    const feedback = incorrectFeedback(index, slot('energy', 'r1', 'atp-adp'), 'energy:adp-atp');
    expect(feedback.body).toContain('ATP → ADP');
  });
});
