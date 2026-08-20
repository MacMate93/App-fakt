/*
 * The three-tier hint ladder.
 *
 * Tier 1 orients, tier 2 narrows down, tier 3 all but names the answer. Data
 * files may author the first two tiers; anything missing is derived from the
 * reaction and from the target entity, so a new pathway gets a working hint
 * ladder even before anyone writes prose for it.
 */
import type { Slot } from '@/types/session';
import { coupleOfRole, type PathwayIndex } from './pathwayModel';

export const HINT_TIERS = 3;

export function hintTiers(index: PathwayIndex, slot: Slot): string[] {
  const reaction = index.reactions.get(slot.anchor.reactionId);
  if (!reaction) return [];
  const authored = reaction.hints ?? {};

  const generic =
    authored.generic ??
    `Reaction type: ${reaction.reactionType.toLowerCase()}. ${reaction.purpose}`;

  const specific = authored.specific ?? specificFallback(index, slot);
  const reveal = authored.reveal?.[slot.kind] ?? revealFor(index, slot);

  return [generic, specific, reveal].filter((tier): tier is string => Boolean(tier));
}

function specificFallback(index: PathwayIndex, slot: Slot): string {
  const reaction = index.reactions.get(slot.anchor.reactionId);
  if (!reaction) return '';
  switch (slot.kind) {
    case 'enzyme':
      return reaction.reversible
        ? 'This step is freely reversible — the same enzyme also works in the opposite direction.'
        : 'This step is essentially irreversible under physiological conditions.';
    case 'metabolite':
      return `It is the product of a ${reaction.reactionType.toLowerCase()} reaction.`;
    case 'energy':
      return 'Ask yourself whether a phosphate group is being spent or collected here.';
    case 'redox':
      return 'Ask yourself whether anything is actually oxidised or reduced in this step.';
  }
}

function revealFor(index: PathwayIndex, slot: Slot): string {
  const reaction = index.reactions.get(slot.anchor.reactionId);
  if (!reaction) return '';

  if (slot.kind === 'enzyme') {
    const enzyme = index.enzymes.get(reaction.enzymeId);
    if (!enzyme) return '';
    return enzyme.abbr && enzyme.abbr !== enzyme.name
      ? `The enzyme is abbreviated ${enzyme.abbr}.`
      : `The enzyme's name begins with "${enzyme.name.slice(0, 4)}…".`;
  }

  if (slot.kind === 'metabolite') {
    const id = slot.answerTokenIds[0]?.split(':')[1] ?? '';
    const metabolite = index.metabolites.get(id);
    if (!metabolite) return '';
    const parts: string[] = [];
    if (metabolite.carbons) parts.push(`${metabolite.carbons} carbon atoms`);
    if (metabolite.phosphates !== undefined) {
      parts.push(
        metabolite.phosphates === 0
          ? 'no phosphate group'
          : `${metabolite.phosphates} phosphate group${metabolite.phosphates > 1 ? 's' : ''}`,
      );
    }
    if (metabolite.abbr) parts.push(`abbreviated ${metabolite.abbr}`);
    return parts.length ? `It has ${parts.join(', ')}.` : `Its name begins with "${metabolite.name.slice(0, 3)}…".`;
  }

  const role = slot.kind === 'energy' ? 'energy' : 'redox';
  const couple = coupleOfRole(index, reaction, role);
  if (!couple) {
    return role === 'energy'
      ? 'The adenine nucleotide pool is not touched in this step.'
      : 'Nothing is oxidised or reduced in this step.';
  }
  return couple.direction === 'consumes'
    ? `${couple.from} is used up here.`
    : `${couple.to} is formed here.`;
}
