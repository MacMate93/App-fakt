/*
 * Read-only derivations from a pathway data file: lookup tables, the canvas
 * layout and the ATP/NADH balance sheet.
 *
 * Nothing in here is glycolysis-specific — the balance sheet of the citric acid
 * cycle or of beta oxidation will fall out of the same functions.
 */
import type {
  Couple,
  Enzyme,
  Metabolite,
  PlayablePathway,
  Reaction,
} from '@/types/pathway';

export interface PathwayIndex {
  pathway: PlayablePathway;
  metabolites: Map<string, Metabolite>;
  enzymes: Map<string, Enzyme>;
  couples: Map<string, Couple>;
  reactions: Map<string, Reaction>;
  /** Ids that belong to the pathway proper, i.e. are not decoys. */
  onPathwayEnzymeIds: Set<string>;
  onPathwayMetaboliteIds: Set<string>;
}

const byId = <T extends { id: string }>(items: T[] | undefined): Map<string, T> =>
  new Map((items ?? []).map((item) => [item.id, item]));

export function indexPathway(pathway: PlayablePathway): PathwayIndex {
  const decoys = pathway.decoys ?? {};
  return {
    pathway,
    metabolites: byId([...pathway.metabolites, ...(decoys.metabolites ?? [])]),
    enzymes: byId([...pathway.enzymes, ...(decoys.enzymes ?? [])]),
    couples: byId([...pathway.couples, ...(decoys.couples ?? [])]),
    reactions: byId(pathway.reactions),
    onPathwayEnzymeIds: new Set(pathway.enzymes.map((enzyme) => enzyme.id)),
    onPathwayMetaboliteIds: new Set(pathway.metabolites.map((metabolite) => metabolite.id)),
  };
}

export const metaboliteName = (index: PathwayIndex, id: string): string =>
  index.metabolites.get(id)?.name ?? id;

export const enzymeName = (index: PathwayIndex, id: string): string =>
  index.enzymes.get(id)?.name ?? id;

export const listNames = (index: PathwayIndex, ids: string[]): string =>
  ids.map((id) => metaboliteName(index, id)).join(' + ');

/** How many times a step runs per molecule of pathway input. */
export const factorOf = (reaction: Reaction): number => reaction.factor ?? 1;

/** The couple of a given role attached to a reaction, if any. */
export function coupleOfRole(
  index: PathwayIndex,
  reaction: Reaction,
  role: 'energy' | 'redox' | 'carrier',
): Couple | undefined {
  for (const id of reaction.coupleIds) {
    const couple = index.couples.get(id);
    if (couple && couple.role === role) return couple;
  }
  return undefined;
}

/* ---------------------------------------------------------------- layout -- */

export interface CanvasNode {
  /** Stable key of a rendered metabolite card: "<reactionId>:<index>". */
  key: string;
  reactionId: string;
  index: number;
  metaboliteId: string;
}

export interface CanvasRow {
  reaction: Reaction;
  /** Metabolite cards drawn below this reaction's arrow. */
  nodes: CanvasNode[];
  /** Draw the "from here on, everything happens twice" divider above the row. */
  multiplierDivider: boolean;
}

export interface CanvasModel {
  /** The starting metabolite(s), drawn above the first arrow. */
  head: CanvasNode[];
  rows: CanvasRow[];
}

export const HEAD_REACTION_ID = 'head';

/**
 * Turns the reaction list into a top-down column of rows. A reaction marked
 * `branch` is drawn as an offset side branch (glycolysis: DHAP → G3P) instead of
 * interrupting the main chain.
 */
export function buildCanvasModel(pathway: PlayablePathway): CanvasModel {
  const reactions = [...pathway.reactions].sort((a, b) => a.step - b.step);
  const first = reactions[0];
  const head: CanvasNode[] = (first?.substrates ?? []).map((metaboliteId, index) => ({
    key: `${HEAD_REACTION_ID}:${index}`,
    reactionId: HEAD_REACTION_ID,
    index,
    metaboliteId,
  }));

  let dividerPlaced = false;
  const rows: CanvasRow[] = reactions.map((reaction) => {
    const isPayoff = factorOf(reaction) > 1;
    const multiplierDivider = isPayoff && !dividerPlaced;
    if (multiplierDivider) dividerPlaced = true;
    return {
      reaction,
      nodes: reaction.products.map((metaboliteId, index) => ({
        key: `${reaction.id}:${index}`,
        reactionId: reaction.id,
        index,
        metaboliteId,
      })),
      multiplierDivider,
    };
  });

  return { head, rows };
}

/* --------------------------------------------------------------- balance -- */

export interface PathwayBalance {
  atpConsumed: number;
  atpProduced: number;
  netAtp: number;
  /** Reduced cofactors produced per molecule of input, keyed by yield name. */
  cofactors: Record<string, number>;
  /** End products with their stoichiometry. */
  outputs: { metaboliteId: string; count: number }[];
}

export function computeBalance(pathway: PlayablePathway): PathwayBalance {
  const couples = byId(pathway.couples);
  const balance: PathwayBalance = {
    atpConsumed: 0,
    atpProduced: 0,
    netAtp: 0,
    cofactors: {},
    outputs: [],
  };

  for (const reaction of pathway.reactions) {
    const factor = factorOf(reaction);
    for (const coupleId of reaction.coupleIds) {
      const couple = couples.get(coupleId);
      if (!couple || couple.virtual) continue;
      const equivalents = couple.atpEquivalents ?? 0;
      if (equivalents < 0) balance.atpConsumed += -equivalents * factor;
      if (equivalents > 0) balance.atpProduced += equivalents * factor;
      for (const [name, amount] of Object.entries(couple.yields ?? {})) {
        balance.cofactors[name] = (balance.cofactors[name] ?? 0) + amount * factor;
      }
    }
  }
  balance.netAtp = balance.atpProduced - balance.atpConsumed;

  const last = [...pathway.reactions].sort((a, b) => a.step - b.step).at(-1);
  if (last) {
    balance.outputs = last.products.map((metaboliteId) => ({
      metaboliteId,
      count: factorOf(last),
    }));
  }
  return balance;
}

/** A readable, textbook-style equation for one reaction. */
export function reactionEquation(index: PathwayIndex, reaction: Reaction): string {
  const left = [
    ...reaction.substrates.map((id) => metaboliteName(index, id)),
    ...(reaction.consumes ?? []),
  ];
  const right = [
    ...reaction.products.map((id) => metaboliteName(index, id)),
    ...(reaction.releases ?? []),
  ];

  for (const coupleId of reaction.coupleIds) {
    const couple = index.couples.get(coupleId);
    if (!couple || couple.virtual) continue;
    left.push(couple.from);
    right.push(couple.to);
  }

  return `${left.join(' + ')} ${reaction.reversible ? '⇌' : '→'} ${right.join(' + ')}`;
}
