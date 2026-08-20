/*
 * Task generation.
 *
 * Every game mode is the same underlying exercise: some positions of the
 * pathway are blanked out, and a tray of tokens has to be dropped into them.
 * Which positions get blanked is decided here, from the mode and the difficulty
 * — the pathway data itself knows nothing about game modes.
 */
import type { PlayablePathway, Reaction } from '@/types/pathway';
import type {
  Difficulty,
  GeneratedSession,
  SessionConfig,
  Slot,
  SlotKind,
  TaskMode,
  Token,
} from '@/types/session';
import {
  buildCanvasModel,
  coupleOfRole,
  enzymeName,
  indexPathway,
  listNames,
  type PathwayIndex,
} from './pathwayModel';
import { mulberry32, shuffle, type Rng } from './random';

interface DifficultyProfile {
  /** Share of the eligible positions that get blanked, per kind. */
  coverage: number;
  minSlots: number;
  maxSlots: number | null;
  /** Wrong answers offered per token kind. */
  distractors: number;
}

const PROFILES: Record<Difficulty, DifficultyProfile> = {
  beginner: { coverage: 0.4, minSlots: 3, maxSlots: 5, distractors: 2 },
  intermediate: { coverage: 0.6, minSlots: 5, maxSlots: 10, distractors: 4 },
  expert: { coverage: 1, minSlots: 8, maxSlots: 26, distractors: 6 },
};

/** Which positions a mode is allowed to blank. Build widens with difficulty. */
const BUILD_KINDS: Record<Difficulty, SlotKind[]> = {
  beginner: ['enzyme', 'energy'],
  intermediate: ['enzyme', 'metabolite', 'energy'],
  expert: ['enzyme', 'metabolite', 'energy', 'redox'],
};

const FOCUSED_KINDS: Record<Exclude<TaskMode, 'build'>, SlotKind[]> = {
  'missing-metabolite': ['metabolite'],
  'missing-enzyme': ['enzyme'],
  energy: ['energy'],
  cofactor: ['redox'],
};

const KIND_ORDER: Record<SlotKind, number> = {
  metabolite: 0,
  enzyme: 1,
  energy: 2,
  redox: 3,
};

export const tokenId = (kind: SlotKind, entityId: string): string => `${kind}:${entityId}`;

function kindsFor(mode: TaskMode, difficulty: Difficulty): SlotKind[] {
  return mode === 'build' ? BUILD_KINDS[difficulty] : FOCUSED_KINDS[mode];
}

interface Candidate {
  kind: SlotKind;
  reaction: Reaction;
  anchorIndex?: number;
  metaboliteId?: string;
  answerEntityIds: string[];
}

/** Positions that could be blanked, before the difficulty filter is applied. */
function collectCandidates(index: PathwayIndex, kind: SlotKind, rng: Rng): Candidate[] {
  const reactions = [...index.pathway.reactions].sort((a, b) => a.step - b.step);

  if (kind === 'enzyme') {
    return reactions.map((reaction) => ({
      kind,
      reaction,
      answerEntityIds: [reaction.enzymeId, ...(reaction.acceptAlso ?? [])],
    }));
  }

  if (kind === 'metabolite') {
    // At most one blank per reaction: with two products side by side the student
    // could not tell which box is which, and that would be a guessing game.
    return buildCanvasModel(index.pathway).rows.map((row) => {
      const nodes = shuffle(row.nodes, rng);
      const node = nodes[0];
      return {
        kind,
        reaction: row.reaction,
        anchorIndex: node?.index ?? 0,
        metaboliteId: node?.metaboliteId,
        answerEntityIds: node ? [node.metaboliteId] : [],
      };
    });
  }

  const role = kind === 'energy' ? 'energy' : 'redox';
  const fallback = kind === 'energy' ? 'no-energy' : 'no-redox';
  const active: Candidate[] = [];
  const inactive: Candidate[] = [];
  for (const reaction of reactions) {
    const couple = coupleOfRole(index, reaction, role);
    const candidate: Candidate = {
      kind,
      reaction,
      answerEntityIds: [couple?.id ?? fallback],
    };
    (couple ? active : inactive).push(candidate);
  }
  // "Nothing happens here" is a real and important answer, but a session made
  // mostly of those teaches very little — so cap it at half the live steps.
  const quiet = shuffle(inactive, rng).slice(0, Math.max(1, Math.ceil(active.length / 2)));
  return [...shuffle(active, rng), ...quiet];
}

function selectCandidates(
  candidates: Candidate[],
  profile: DifficultyProfile,
  rng: Rng,
): Candidate[] {
  if (candidates.length === 0) return [];
  const wanted = Math.max(1, Math.round(candidates.length * profile.coverage));
  return shuffle(candidates, rng).slice(0, Math.min(candidates.length, wanted));
}

function promptFor(index: PathwayIndex, candidate: Candidate, hiddenEnzymes: Set<string>): string {
  const { reaction } = candidate;
  const substrates = listNames(index, reaction.substrates);
  const products = listNames(index, reaction.products);
  switch (candidate.kind) {
    case 'enzyme':
      return `Which enzyme converts ${substrates} into ${products}?`;
    case 'metabolite':
      return hiddenEnzymes.has(reaction.id)
        ? `Which metabolite is formed from ${substrates} in step ${reaction.step}?`
        : `Which metabolite does ${enzymeName(index, reaction.enzymeId)} form from ${substrates}?`;
    case 'energy':
      return `Step ${reaction.step} (${substrates} → ${products}) — what happens to ATP?`;
    case 'redox':
      return `Step ${reaction.step} (${substrates} → ${products}) — which redox cofactor is involved?`;
  }
}

function buildTokens(
  index: PathwayIndex,
  slots: Slot[],
  kinds: SlotKind[],
  profile: DifficultyProfile,
  rng: Rng,
): Token[] {
  const tokens = new Map<string, Token>();

  const add = (kind: SlotKind, entityId: string): void => {
    const id = tokenId(kind, entityId);
    const existing = tokens.get(id);
    if (existing) return;
    const token = makeToken(index, kind, entityId);
    if (token) tokens.set(id, token);
  };

  for (const slot of slots) {
    for (const answerId of slot.answerTokenIds) {
      const entityId = answerId.slice(answerId.indexOf(':') + 1);
      add(slot.kind, entityId);
    }
  }

  for (const kind of kinds) {
    if (!slots.some((slot) => slot.kind === kind)) continue;
    const pool = distractorPool(index, kind).filter((id) => !tokens.has(tokenId(kind, id)));
    for (const entityId of shuffle(pool, rng).slice(0, profile.distractors)) add(kind, entityId);
  }

  // Correct tokens have to cover every slot that needs them (G3P twice, say).
  for (const token of tokens.values()) {
    token.count = slots.filter((slot) => slot.answerTokenIds.includes(token.id)).length;
  }

  return shuffle([...tokens.values()], rng);
}

function makeToken(index: PathwayIndex, kind: SlotKind, entityId: string): Token | null {
  if (kind === 'enzyme') {
    const enzyme = index.enzymes.get(entityId);
    if (!enzyme) return null;
    return {
      id: tokenId(kind, entityId),
      kind,
      label: enzyme.name,
      sublabel: enzyme.abbr && enzyme.abbr !== enzyme.name ? enzyme.abbr : undefined,
      entityId,
      count: 0,
      regulatory: enzyme.regulatory,
    };
  }
  if (kind === 'metabolite') {
    const metabolite = index.metabolites.get(entityId);
    if (!metabolite) return null;
    return {
      id: tokenId(kind, entityId),
      kind,
      label: metabolite.name,
      sublabel: metabolite.carbons ? `C${metabolite.carbons}` : undefined,
      entityId,
      count: 0,
    };
  }
  const couple = index.couples.get(entityId);
  if (!couple) return null;
  return {
    id: tokenId(kind, entityId),
    kind,
    label: couple.label,
    entityId,
    role: couple.role,
    count: 0,
  };
}

function distractorPool(index: PathwayIndex, kind: SlotKind): string[] {
  if (kind === 'enzyme') return [...index.enzymes.keys()];
  if (kind === 'metabolite') return [...index.metabolites.keys()];
  const role = kind === 'energy' ? 'energy' : 'redox';
  return [...index.couples.values()].filter((couple) => couple.role === role).map((c) => c.id);
}

export function generateSession(
  pathway: PlayablePathway,
  config: SessionConfig,
): GeneratedSession {
  const index = indexPathway(pathway);
  const rng = mulberry32(config.seed);
  const profile = PROFILES[config.difficulty];
  const kinds = kindsFor(config.mode, config.difficulty);

  let chosen: Candidate[] = [];
  for (const kind of kinds) {
    chosen = chosen.concat(selectCandidates(collectCandidates(index, kind, rng), profile, rng));
  }

  // Top up small sessions, trim oversized ones.
  if (chosen.length < profile.minSlots) {
    const extras = kinds
      .flatMap((kind) => collectCandidates(index, kind, rng))
      .filter((candidate) => !chosen.some((picked) => sameSpot(picked, candidate)));
    chosen = chosen.concat(shuffle(extras, rng).slice(0, profile.minSlots - chosen.length));
  }
  if (profile.maxSlots !== null && chosen.length > profile.maxSlots) {
    chosen = shuffle(chosen, rng).slice(0, profile.maxSlots);
  }

  chosen.sort(
    (a, b) => a.reaction.step - b.reaction.step || KIND_ORDER[a.kind] - KIND_ORDER[b.kind],
  );

  const hiddenEnzymes = new Set(
    chosen.filter((c) => c.kind === 'enzyme').map((c) => c.reaction.id),
  );

  const slots: Slot[] = chosen.map((candidate) => ({
    id:
      candidate.kind === 'metabolite'
        ? `${candidate.reaction.id}:node:${candidate.anchorIndex ?? 0}`
        : `${candidate.reaction.id}:${candidate.kind}`,
    kind: candidate.kind,
    anchor: { reactionId: candidate.reaction.id, index: candidate.anchorIndex },
    answerTokenIds: candidate.answerEntityIds.map((id) => tokenId(candidate.kind, id)),
    prompt: promptFor(index, candidate, hiddenEnzymes),
  }));

  return { config, slots, tokens: buildTokens(index, slots, kinds, profile, rng) };
}

const sameSpot = (a: Candidate, b: Candidate): boolean =>
  a.kind === b.kind && a.reaction.id === b.reaction.id && a.anchorIndex === b.anchorIndex;
