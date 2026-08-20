/*
 * The content model.
 *
 * Everything the application knows about biochemistry lives in objects shaped
 * like this. The engine derives Explore views, Build tasks, Missing Enzyme /
 * Missing Metabolite questions, Energy and Cofactor challenges, hint ladders,
 * distractors and the ATP/NADH balance sheet from the same data — so a new
 * pathway is a new data file plus one line in the registry, nothing else.
 */

/** How a co-substrate pair participates in a reaction. */
export type CoupleRole = 'energy' | 'redox' | 'carrier';

/**
 * The kinds of position a task can blank out. The content layer owns this
 * vocabulary because hints and answers are authored against it.
 */
export type BlankKind = 'metabolite' | 'enzyme' | 'energy' | 'redox';

export interface Metabolite {
  id: string;
  name: string;
  /** Short form used on small cards and in tier-3 hints, e.g. "G6P". */
  abbr?: string;
  /** Carbon count — drives the C3/C6 badge and a structural hint. */
  carbons?: number;
  /** Number of phosphate groups; used for hints, not for chemistry. */
  phosphates?: number;
  /** One or two sentences shown in Explore. */
  note?: string;
}

export interface Enzyme {
  id: string;
  name: string;
  abbr?: string;
  /** EC number — only filled in where it is unambiguous. */
  ec?: string;
  /** Irreversible, physiologically regulated control point. */
  regulatory?: boolean;
  alsoKnownAs?: string;
  role?: string;
  activators?: string[];
  inhibitors?: string[];
  /** Clinically relevant note (deficiency, inhibitor, tissue distribution). */
  clinical?: string;
  /**
   * Enzymes students commonly mix this one up with. Used to seed plausible
   * distractors, and later to feed the teacher dashboard.
   */
  confusedWith?: string[];
}

/**
 * A co-substrate pair consumed or produced alongside the main metabolites:
 * ATP → ADP, NAD+ → NADH, FAD → FADH2, CoA-SH → acyl-CoA …
 */
export interface Couple {
  id: string;
  role: CoupleRole;
  /** Rendered on the arrow and on the draggable chip, e.g. "ATP → ADP". */
  label: string;
  from: string;
  to: string;
  /** Whether the cell spends or gains the high-energy species here. */
  direction: 'consumes' | 'produces';
  /** ATP equivalents gained (+1) or spent (−1) per turn of the reaction. */
  atpEquivalents?: number;
  /** Reduced cofactor produced per turn, e.g. { nadh: 1 }. */
  yields?: Record<string, number>;
  /** Not a real participant — a "nothing happens here" answer option. */
  virtual?: boolean;
  note?: string;
}

export interface ReactionHints {
  /** Tier 1 — orients the student without naming anything. */
  generic?: string;
  /** Tier 2 — narrows it to a class of enzyme / metabolite. */
  specific?: string;
  /**
   * Tier 3 — all but gives the answer away. Authored per kind of blank, since
   * the last hint is about the missing item rather than about the reaction.
   * Anything not given here is derived from the entity itself.
   */
  reveal?: Partial<Record<BlankKind, string>>;
}

export interface Reaction {
  id: string;
  step: number;
  substrates: string[];
  products: string[];
  enzymeId: string;
  /** Isoenzymes that are equally correct here (hexokinase / glucokinase). */
  acceptAlso?: string[];
  coupleIds: string[];
  /** Extra small molecules taken up, e.g. ["Pi"], ["H2O"]. Display + wording. */
  consumes?: string[];
  /** Extra small molecules given off, e.g. ["H2O"], ["H+"], ["CO2"]. */
  releases?: string[];
  reversible: boolean;
  regulatory?: boolean;
  /** phosphorylation, isomerisation, aldol cleavage, dehydration … */
  reactionType: string;
  /** Why the cell bothers — the "so what" of the step. */
  purpose: string;
  /** Shown on a correct placement and in Explore. */
  explanation: string;
  /** How many times this step runs per molecule of pathway input (×2 phase). */
  factor?: 1 | 2;
  /** Renders as an offset side branch rather than in the main column. */
  branch?: boolean;
  hints?: ReactionHints;
}

/** A concept the completion screen reports as mastered / needing review. */
export interface KeyConcept {
  id: string;
  label: string;
  reactionIds: string[];
}

export interface QuizItem {
  id: string;
  question: string;
  options: { id: string; label: string }[];
  answerId: string;
  explanation: string;
}

export interface Pathway {
  id: string;
  name: string;
  subtitle: string;
  /** "coming-soon" pathways render as locked cards on the home screen. */
  status: 'available' | 'coming-soon';
  compartment?: string;
  input?: string;
  output?: string;
  summary?: string;
  metabolites?: Metabolite[];
  enzymes?: Enzyme[];
  couples?: Couple[];
  reactions?: Reaction[];
  /** Off-pathway species used as plausible wrong answers. */
  decoys?: {
    metabolites?: Metabolite[];
    enzymes?: Enzyme[];
    couples?: Couple[];
  };
  keyConcepts?: KeyConcept[];
  summaryQuiz?: QuizItem[];
  references?: string[];
}

/** A pathway with the content-bearing fields guaranteed to be present. */
export type PlayablePathway = Pathway &
  Required<Pick<Pathway, 'metabolites' | 'enzymes' | 'couples' | 'reactions'>>;

export function isPlayable(pathway: Pathway): pathway is PlayablePathway {
  return pathway.status === 'available' && (pathway.reactions?.length ?? 0) > 0;
}
