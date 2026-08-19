import type { Week } from '../types/content';
import { week03 } from './weeks/week-03';
import { placeholderWeeks } from './weeks/placeholders';
import { validateWeek } from './schema';

/**
 * The single registry of course content. Adding a week means importing its
 * data file here — no route, no component and no engine change.
 */
export const WEEKS: Week[] = [...placeholderWeeks, week03].sort((a, b) => a.week - b.week);

const BY_ID = new Map(WEEKS.map((week) => [week.id, week]));

export function getWeek(id: string | undefined): Week | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export function validateAllContent(): string[] {
  return WEEKS.flatMap(validateWeek);
}

// Fail loudly during development rather than rendering a broken module.
if (import.meta.env?.DEV) {
  const errors = validateAllContent();
  if (errors.length > 0) {
    console.error(`[content] ${errors.length} problem(s) found:\n- ${errors.join('\n- ')}`);
  }
}
