/*
 * The pathway registry — the single place the application learns what content
 * exists. Adding a module means importing its data file and listing it here.
 */
import type { Pathway, PlayablePathway } from '@/types/pathway';
import { isPlayable } from '@/types/pathway';
import { glycolysis } from './glycolysis';
import { upcomingPathways } from './upcoming';

export const pathways: Pathway[] = [glycolysis, ...upcomingPathways];

export function getPathway(id: string): Pathway | undefined {
  return pathways.find((pathway) => pathway.id === id);
}

export function getPlayablePathway(id: string): PlayablePathway | undefined {
  const pathway = getPathway(id);
  return pathway && isPlayable(pathway) ? pathway : undefined;
}

export { glycolysis };
