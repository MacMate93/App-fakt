/*
 * The play-session model: what the engine generates from a pathway and what
 * the reducer tracks while the student works through it.
 */
import type { BlankKind, CoupleRole } from './pathway';

export type Difficulty = 'beginner' | 'intermediate' | 'expert';
export type GameMode = 'learning' | 'exam';

/** The five task families of the spec, plus "mixed" for a full build. */
export type TaskMode =
  | 'build'
  | 'missing-metabolite'
  | 'missing-enzyme'
  | 'energy'
  | 'cofactor';

export type SlotKind = BlankKind;

/** Where a slot sits in the rendered pathway. */
export interface SlotAnchor {
  /** Reaction the slot belongs to; "head" for the very first metabolite node. */
  reactionId: string;
  /** Index within that reaction's product list (metabolite slots only). */
  index?: number;
}

export interface Slot {
  id: string;
  kind: SlotKind;
  anchor: SlotAnchor;
  /** Token ids that count as correct (isoenzymes give more than one). */
  answerTokenIds: string[];
  /** Question shown in the task strip when this slot is active. */
  prompt: string;
}

export interface Token {
  id: string;
  kind: SlotKind;
  label: string;
  sublabel?: string;
  /** Content entity behind the token (metabolite / enzyme / couple id). */
  entityId: string;
  role?: CoupleRole | 'none';
  /** How many slots this token has to fill; hidden from the tray at 0 left. */
  count: number;
  regulatory?: boolean;
}

export interface SlotResult {
  attempts: number;
  hintsUsed: number;
  solved: boolean;
  xp: number;
  /** Token ids the student tried and got wrong — feeds "needs review". */
  wrongTokenIds: string[];
}

export interface Feedback {
  slotId: string;
  tone: 'correct' | 'incorrect' | 'info';
  title: string;
  body: string;
}

export interface SessionConfig {
  pathwayId: string;
  mode: TaskMode;
  difficulty: Difficulty;
  gameMode: GameMode;
  seed: number;
}

export interface GeneratedSession {
  config: SessionConfig;
  slots: Slot[];
  tokens: Token[];
}

export type SessionPhase = 'playing' | 'quiz' | 'complete';

export interface SessionState {
  config: SessionConfig;
  slots: Slot[];
  tokens: Token[];
  /** slotId → token id currently sitting in the slot. */
  placements: Record<string, string | undefined>;
  results: Record<string, SlotResult>;
  hintsShown: Record<string, number>;
  activeSlotId: string | null;
  feedback: Feedback | null;
  streak: number;
  bestStreak: number;
  xp: number;
  phase: SessionPhase;
  quizAnswers: Record<string, string>;
  startedAt: number;
  finishedAt: number | null;
}
