/*
 * Human-readable metadata for the game modes and difficulty levels. The rules
 * themselves live in generateSession; this is only what the UI shows.
 */
import type { Difficulty, GameMode, TaskMode } from '@/types/session';

export interface ModeInfo {
  id: TaskMode;
  label: string;
  description: string;
}

export const TASK_MODES: ModeInfo[] = [
  {
    id: 'build',
    label: 'Build the pathway',
    description: 'Enzymes, metabolites and cofactors — as much of the pathway as the level asks for.',
  },
  {
    id: 'missing-metabolite',
    label: 'Missing metabolite',
    description: 'The pathway is there; the intermediates are not.',
  },
  {
    id: 'missing-enzyme',
    label: 'Missing enzyme',
    description: 'Name the catalyst of each reaction.',
  },
  {
    id: 'energy',
    label: 'Energy challenge',
    description: 'Decide for every step what happens to ATP — including the steps where nothing does.',
  },
  {
    id: 'cofactor',
    label: 'Cofactor challenge',
    description: 'Which redox cofactor does the step need, if any?',
  },
];

export const taskModeLabel = (mode: TaskMode): string =>
  TASK_MODES.find((info) => info.id === mode)?.label ?? mode;

export interface DifficultyInfo {
  id: Difficulty;
  label: string;
  description: string;
}

export const DIFFICULTIES: DifficultyInfo[] = [
  {
    id: 'beginner',
    label: 'Beginner',
    description: 'Most of the pathway stays visible, a handful of positions are blank, few distractors.',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: 'About half the pathway is blank, metabolites and enzymes together, more look-alikes.',
  },
  {
    id: 'expert',
    label: 'Expert',
    description: 'Nearly the whole pathway is blank, cofactors and energetics included.',
  },
];

export const isTaskMode = (value: string | null): value is TaskMode =>
  TASK_MODES.some((info) => info.id === value);

export const isDifficulty = (value: string | null): value is Difficulty =>
  DIFFICULTIES.some((info) => info.id === value);

export const isGameMode = (value: string | null): value is GameMode =>
  value === 'learning' || value === 'exam';
