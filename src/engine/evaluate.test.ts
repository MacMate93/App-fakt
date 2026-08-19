import { describe, expect, it } from 'vitest';
import { evaluate, evaluateHype } from './evaluate';
import type {
  ClassificationQuestion,
  DecisionQuestion,
  EvidenceRatingQuestion,
  HypeStatement,
  MultipleChoiceQuestion,
  OrderingQuestion,
  SingleChoiceQuestion,
  TrueFalseQuestion,
} from '../types/content';
import { en } from '../types/i18n';

const feedback = { correct: en('yes'), incorrect: en('no'), partial: en('nearly') };

describe('single choice', () => {
  const question: SingleChoiceQuestion = {
    id: 'q', type: 'single_choice', competency: 'mechanism', points: 6,
    prompt: en('?'), feedback,
    options: [{ id: 'a', text: en('A') }, { id: 'b', text: en('B') }],
    correctOptionId: 'b',
  };

  it('awards full points for the correct option', () => {
    const result = evaluate(question, { kind: 'option', optionId: 'b' });
    expect(result.status).toBe('correct');
    expect(result.awardedPoints).toBe(6);
  });

  it('awards nothing otherwise and marks the options', () => {
    const result = evaluate(question, { kind: 'option', optionId: 'a' });
    expect(result.status).toBe('incorrect');
    expect(result.awardedPoints).toBe(0);
    expect(result.optionStates).toEqual({ a: 'wrong', b: 'missed' });
  });
});

describe('multiple choice', () => {
  const question: MultipleChoiceQuestion = {
    id: 'q', type: 'multiple_choice', competency: 'data', points: 8,
    prompt: en('?'), feedback,
    options: ['a', 'b', 'c', 'd'].map((id) => ({ id, text: en(id) })),
    correctOptionIds: ['a', 'b', 'c'],
  };

  it('gives full credit for the exact set', () => {
    expect(evaluate(question, { kind: 'options', optionIds: ['a', 'b', 'c'] }).awardedPoints).toBe(8);
  });

  it('gives partial credit for a subset', () => {
    const result = evaluate(question, { kind: 'options', optionIds: ['a', 'b'] });
    expect(result.status).toBe('partial');
    expect(result.awardedPoints).toBe(5); // 2/3 of 8, rounded
  });

  it('penalises false positives so selecting everything scores zero', () => {
    const result = evaluate(question, { kind: 'options', optionIds: ['a', 'b', 'c', 'd'] });
    expect(result.awardedPoints).toBe(5); // (3 - 1) / 3
    const allWrong = evaluate(question, { kind: 'options', optionIds: ['d'] });
    expect(allWrong.awardedPoints).toBe(0);
  });

  it('honours all-or-nothing scoring', () => {
    const strict: MultipleChoiceQuestion = { ...question, scoring: 'all_or_nothing' };
    expect(evaluate(strict, { kind: 'options', optionIds: ['a', 'b'] }).awardedPoints).toBe(0);
  });
});

describe('true / false', () => {
  const question: TrueFalseQuestion = {
    id: 'q', type: 'true_false', competency: 'data', points: 4,
    prompt: en('?'), statement: en('s'), correctAnswer: false, feedback,
  };

  it('scores the matching value', () => {
    expect(evaluate(question, { kind: 'boolean', value: false }).awardedPoints).toBe(4);
    expect(evaluate(question, { kind: 'boolean', value: true }).awardedPoints).toBe(0);
  });
});

describe('ordering', () => {
  const question: OrderingQuestion = {
    id: 'q', type: 'ordering', competency: 'therapy', points: 6,
    prompt: en('?'), feedback,
    items: ['a', 'b', 'c', 'd'].map((id) => ({ id, text: en(id) })),
    correctOrder: ['a', 'b', 'c', 'd'],
  };

  it('gives full credit only for the exact order', () => {
    const result = evaluate(question, { kind: 'order', order: ['a', 'b', 'c', 'd'] });
    expect(result.status).toBe('correct');
    expect(result.awardedPoints).toBe(6);
  });

  it('rewards a nearly correct order', () => {
    const result = evaluate(question, { kind: 'order', order: ['a', 'c', 'b', 'd'] });
    expect(result.status).toBe('partial');
    expect(result.awardedPoints).toBeGreaterThan(0);
    expect(result.awardedPoints).toBeLessThan(6);
  });

  it('gives nothing for a fully reversed order', () => {
    expect(evaluate(question, { kind: 'order', order: ['d', 'c', 'b', 'a'] }).awardedPoints).toBe(0);
  });
});

describe('classification', () => {
  const question: ClassificationQuestion = {
    id: 'q', type: 'classification', competency: 'mechanism', points: 8,
    prompt: en('?'), feedback,
    categories: [
      { id: 'x', label: en('X') },
      { id: 'y', label: en('Y') },
    ],
    items: [
      { id: 'i1', text: en('1'), correctCategoryId: 'x' },
      { id: 'i2', text: en('2'), correctCategoryId: 'y' },
      { id: 'i3', text: en('3'), correctCategoryId: 'y' },
      { id: 'i4', text: en('4'), correctCategoryId: 'x' },
    ],
  };

  it('scores per item', () => {
    const result = evaluate(question, {
      kind: 'assignment',
      assignment: { i1: 'x', i2: 'y', i3: 'x', i4: 'x' },
    });
    expect(result.status).toBe('partial');
    expect(result.awardedPoints).toBe(6); // 3/4 of 8
    expect(result.optionStates?.i3).toBe('wrong');
  });
});

describe('evidence rating', () => {
  const question: EvidenceRatingQuestion = {
    id: 'q', type: 'evidence_rating', competency: 'evidence', points: 8,
    prompt: en('?'), claim: en('c'), correctLevel: 4, feedback,
  };

  it('gives full credit for the exact level', () => {
    expect(evaluate(question, { kind: 'level', level: 4 }).awardedPoints).toBe(8);
  });

  it('gives half credit within tolerance', () => {
    const result = evaluate(question, { kind: 'level', level: 3 });
    expect(result.status).toBe('partial');
    expect(result.awardedPoints).toBe(4);
  });

  it('gives nothing beyond tolerance', () => {
    expect(evaluate(question, { kind: 'level', level: 1 }).awardedPoints).toBe(0);
  });
});

describe('decision', () => {
  const question: DecisionQuestion = {
    id: 'q', type: 'decision', competency: 'therapy', points: 10,
    prompt: en('?'), feedback,
    options: [
      { id: 'a', text: en('A'), quality: 'optimal' },
      { id: 'b', text: en('B'), quality: 'acceptable' },
      { id: 'c', text: en('C'), quality: 'poor' },
    ],
  };

  it('grades options rather than marking them right or wrong', () => {
    expect(evaluate(question, { kind: 'option', optionId: 'a' }).awardedPoints).toBe(10);
    expect(evaluate(question, { kind: 'option', optionId: 'b' }).awardedPoints).toBe(6);
    expect(evaluate(question, { kind: 'option', optionId: 'c' }).awardedPoints).toBe(0);
  });

  it('marks the optimal option as the answer and an acceptable pick as partial', () => {
    const result = evaluate(question, { kind: 'option', optionId: 'b' });
    expect(result.optionStates).toEqual({ a: 'missed', b: 'partial', c: 'neutral' });
  });
});

describe('mechanism or hype', () => {
  const statement: HypeStatement = {
    id: 'h', points: 2, verdict: 'partly_supported',
    statement: en('s'), explanation: en('because'),
  };

  it('scores the verdict and always returns the explanation', () => {
    const correct = evaluateHype(statement, { kind: 'verdict', verdict: 'partly_supported' });
    expect(correct.awardedPoints).toBe(2);
    expect(correct.competency).toBe('critical');
    const wrong = evaluateHype(statement, { kind: 'verdict', verdict: 'supported' });
    expect(wrong.awardedPoints).toBe(0);
    expect(wrong.feedback).toEqual(statement.explanation);
  });
});

describe('answer shape', () => {
  it('rejects an answer of the wrong kind', () => {
    const question: TrueFalseQuestion = {
      id: 'q', type: 'true_false', competency: 'data', points: 1,
      prompt: en('?'), statement: en('s'), correctAnswer: true, feedback,
    };
    expect(() => evaluate(question, { kind: 'level', level: 3 })).toThrow();
  });
});
