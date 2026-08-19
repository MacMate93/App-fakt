import {
  COMPETENCIES,
  type Question,
  type Week,
} from '../types/content';
import { collectQuestions, validatePointsBudget } from '../engine/scoring';

/**
 * Referential integrity checks that the type system cannot express: a
 * `correctOptionId` that matches no option compiles fine but breaks the module
 * at runtime. Content authors get these as loud errors in development.
 */

function checkQuestion(question: Question, errors: string[]): void {
  const where = `question "${question.id}"`;

  if (question.points <= 0) errors.push(`${where}: points must be positive.`);
  if (!COMPETENCIES.includes(question.competency)) {
    errors.push(`${where}: unknown competency "${question.competency}".`);
  }

  switch (question.type) {
    case 'single_choice': {
      const ids = question.options.map((o) => o.id);
      if (!ids.includes(question.correctOptionId)) {
        errors.push(`${where}: correctOptionId "${question.correctOptionId}" is not an option.`);
      }
      if (new Set(ids).size !== ids.length) errors.push(`${where}: duplicate option ids.`);
      break;
    }
    case 'multiple_choice':
    case 'data_interpretation': {
      const ids = new Set(question.options.map((o) => o.id));
      if (question.correctOptionIds.length === 0) {
        errors.push(`${where}: needs at least one correct option.`);
      }
      for (const id of question.correctOptionIds) {
        if (!ids.has(id)) errors.push(`${where}: correct option "${id}" is not an option.`);
      }
      if (question.type === 'data_interpretation' && question.select === 'single' &&
          question.correctOptionIds.length !== 1) {
        errors.push(`${where}: single-select data interpretation needs exactly one correct option.`);
      }
      break;
    }
    case 'ordering': {
      const itemIds = question.items.map((i) => i.id).sort();
      const orderIds = [...question.correctOrder].sort();
      if (itemIds.length !== orderIds.length || itemIds.some((id, i) => id !== orderIds[i])) {
        errors.push(`${where}: correctOrder must contain exactly the item ids.`);
      }
      break;
    }
    case 'classification': {
      const categoryIds = new Set(question.categories.map((c) => c.id));
      for (const item of question.items) {
        if (!categoryIds.has(item.correctCategoryId)) {
          errors.push(`${where}: item "${item.id}" points to unknown category "${item.correctCategoryId}".`);
        }
      }
      break;
    }
    case 'evidence_rating': {
      if (question.correctLevel < 1 || question.correctLevel > 5) {
        errors.push(`${where}: correctLevel must be between 1 and 5.`);
      }
      break;
    }
    case 'decision': {
      const optimal = question.options.filter((o) => o.quality === 'optimal');
      if (optimal.length !== 1) {
        errors.push(`${where}: a decision needs exactly one "optimal" option (found ${optimal.length}).`);
      }
      break;
    }
    case 'true_false':
      break;
  }
}

/** Returns a list of human-readable problems; an empty array means valid. */
export function validateWeek(week: Week): string[] {
  const errors: string[] = [];

  // Unauthored weeks are registered as locked stubs and are not scored.
  if (!week.available) return errors;

  const questions = collectQuestions(week);
  const ids = [...questions.map((q) => q.id), ...week.mechanismOrHype.map((s) => s.id)];
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) errors.push(`${week.id}: duplicate item id "${id}".`);
    seen.add(id);
  }

  for (const question of questions) checkQuestion(question, errors);
  errors.push(...validatePointsBudget(week));

  if (week.cases.length === 0) errors.push(`${week.id}: an available week needs at least one case.`);
  for (const kase of week.cases) {
    if (kase.stages.length === 0) errors.push(`${week.id}: case "${kase.id}" has no stages.`);
  }

  return errors;
}
