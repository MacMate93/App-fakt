/*
 * Feedback text. A wrong answer never just says "incorrect" — it explains what
 * the chosen molecule or enzyme actually does, which is usually the piece of
 * knowledge the student was missing.
 */
import type { Feedback, Slot } from '@/types/session';
import { coupleOfRole, listNames, type PathwayIndex } from './pathwayModel';

export function correctFeedback(index: PathwayIndex, slot: Slot): Feedback {
  const reaction = index.reactions.get(slot.anchor.reactionId);
  return {
    slotId: slot.id,
    tone: 'correct',
    title: 'Correct',
    body: reaction?.explanation ?? 'Right place, right molecule.',
  };
}

export function incorrectFeedback(
  index: PathwayIndex,
  slot: Slot,
  chosenTokenId: string,
): Feedback {
  const entityId = chosenTokenId.slice(chosenTokenId.indexOf(':') + 1);
  return {
    slotId: slot.id,
    tone: 'incorrect',
    title: 'Not quite',
    body: `${explainChoice(index, slot, entityId)} Try another one.`,
  };
}

function explainChoice(index: PathwayIndex, slot: Slot, entityId: string): string {
  if (slot.kind === 'enzyme') {
    const enzyme = index.enzymes.get(entityId);
    if (!enzyme) return 'That enzyme does not act here.';
    const own = index.pathway.reactions.find(
      (reaction) => reaction.enzymeId === entityId || reaction.acceptAlso?.includes(entityId),
    );
    if (own) {
      return `${enzyme.name} catalyses step ${own.step} of this pathway: ${listNames(index, own.substrates)} → ${listNames(index, own.products)}.`;
    }
    return `${enzyme.name}: ${enzyme.role ?? 'this enzyme belongs to another pathway.'}`;
  }

  if (slot.kind === 'metabolite') {
    const metabolite = index.metabolites.get(entityId);
    if (!metabolite) return 'That metabolite does not belong here.';
    const producedBy = index.pathway.reactions.find((reaction) =>
      reaction.products.includes(entityId),
    );
    if (producedBy) {
      return `${metabolite.name} is the product of step ${producedBy.step}, not of this one.`;
    }
    return `${metabolite.name}: ${metabolite.note ?? 'this molecule is not an intermediate of the pathway.'}`;
  }

  const couple = index.couples.get(entityId);
  const reaction = index.reactions.get(slot.anchor.reactionId);
  const actual = reaction
    ? coupleOfRole(index, reaction, slot.kind === 'energy' ? 'energy' : 'redox')
    : undefined;
  const chosenNote = couple?.note ? ` ${couple.note}` : '';
  if (!actual) {
    return slot.kind === 'energy'
      ? `This step neither spends nor makes ATP.${chosenNote}`
      : `Nothing is oxidised or reduced in this step.${chosenNote}`;
  }
  return `This step works with ${actual.from} → ${actual.to}.${chosenNote}`;
}
