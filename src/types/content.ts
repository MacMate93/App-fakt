import type { LocalizedText } from './i18n';

/* ------------------------------------------------------------------ */
/* Competencies and scoring budget                                     */
/* ------------------------------------------------------------------ */

export type Competency =
  | 'mechanism' // molecular mechanism recognition
  | 'data' // data interpretation
  | 'therapy' // intervention / therapeutic reasoning
  | 'evidence' // evidence evaluation
  | 'critical'; // critical thinking (Mechanism or Hype?)

export const COMPETENCIES: Competency[] = ['mechanism', 'data', 'therapy', 'evidence', 'critical'];

export type PointsBudget = Record<Competency, number>;

/** Fixed 100-point split shared by every week of the course. */
export const DEFAULT_POINTS_BUDGET: PointsBudget = {
  mechanism: 30,
  data: 25,
  therapy: 20,
  evidence: 15,
  critical: 10,
};

/* ------------------------------------------------------------------ */
/* Evidence ladder                                                     */
/* ------------------------------------------------------------------ */

/**
 * 1 biochemical plausibility · 2 in vitro · 3 in vivo experimental
 * 4 controlled clinical/veterinary · 5 repeated clinical / established use
 */
export type EvidenceLevel = 1 | 2 | 3 | 4 | 5;

export const EVIDENCE_LEVELS: EvidenceLevel[] = [1, 2, 3, 4, 5];

/* ------------------------------------------------------------------ */
/* Charts                                                              */
/* ------------------------------------------------------------------ */

export interface ChartSeries {
  name: LocalizedText;
  values: number[];
  /** Symmetric error bar half-width, same length as `values`. */
  error?: number[];
}

interface ChartBase {
  title?: LocalizedText;
  caption?: LocalizedText;
  xLabel?: LocalizedText;
  yLabel?: LocalizedText;
}

export interface BarChartSpec extends ChartBase {
  kind: 'bar';
  groups: string[];
  series: ChartSeries[];
  /** Optional horizontal reference line (e.g. control level = 1.0). */
  reference?: number;
}

export interface LineChartSpec extends ChartBase {
  kind: 'line';
  x: number[];
  series: ChartSeries[];
}

export interface ScatterPoint {
  x: number;
  y: number;
  group?: string;
  label?: string;
}

export interface ScatterChartSpec extends ChartBase {
  kind: 'scatter';
  points: ScatterPoint[];
}

export interface HeatmapChartSpec extends ChartBase {
  kind: 'heatmap';
  rows: string[];
  cols: string[];
  /** values[rowIndex][colIndex] */
  values: number[][];
  scale?: 'diverging' | 'sequential';
}

export interface PcaChartSpec extends ChartBase {
  kind: 'pca';
  points: ScatterPoint[];
  /** Explained variance of PC1 / PC2 in percent. */
  variance?: [number, number];
}

export type ChartSpec =
  | BarChartSpec
  | LineChartSpec
  | ScatterChartSpec
  | HeatmapChartSpec
  | PcaChartSpec;

/* ------------------------------------------------------------------ */
/* Questions                                                           */
/* ------------------------------------------------------------------ */

export interface Option {
  id: string;
  text: LocalizedText;
  /** Why this option is right — or why it is a tempting mistake. */
  rationale?: LocalizedText;
  /** Node label used by the Therapy Builder / week summary pathway. */
  summaryLabel?: LocalizedText;
}

export interface QuestionFeedback {
  correct: LocalizedText;
  incorrect: LocalizedText;
  partial?: LocalizedText;
}

export interface QuestionBase {
  id: string;
  competency: Competency;
  points: number;
  prompt: LocalizedText;
  /** Optional figure shown above the question. */
  chart?: ChartSpec;
  /** Short scientific explanation, always shown after answering. */
  explanation?: LocalizedText;
  feedback: QuestionFeedback;
}

export interface SingleChoiceQuestion extends QuestionBase {
  type: 'single_choice';
  options: Option[];
  correctOptionId: string;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple_choice';
  options: Option[];
  correctOptionIds: string[];
  /** `partial` (default): hits minus false positives, floored at zero. */
  scoring?: 'partial' | 'all_or_nothing';
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'true_false';
  statement: LocalizedText;
  correctAnswer: boolean;
}

export interface OrderingQuestion extends QuestionBase {
  type: 'ordering';
  items: Option[];
  /** Item ids in the correct order. */
  correctOrder: string[];
}

export interface ClassificationCategory {
  id: string;
  label: LocalizedText;
  description?: LocalizedText;
}

export interface ClassificationItem {
  id: string;
  text: LocalizedText;
  correctCategoryId: string;
  rationale?: LocalizedText;
}

export interface ClassificationQuestion extends QuestionBase {
  type: 'classification';
  categories: ClassificationCategory[];
  items: ClassificationItem[];
}

export interface DataInterpretationQuestion extends QuestionBase {
  type: 'data_interpretation';
  /** Required here: the question is about reading the figure. */
  chart: ChartSpec;
  select: 'single' | 'multiple';
  options: Option[];
  correctOptionIds: string[];
}

export interface EvidenceRatingQuestion extends QuestionBase {
  type: 'evidence_rating';
  claim: LocalizedText;
  correctLevel: EvidenceLevel;
  /** Levels within this distance earn partial credit. Default 1. */
  tolerance?: number;
}

export type DecisionQuality = 'optimal' | 'acceptable' | 'poor';

export interface DecisionOption extends Option {
  quality: DecisionQuality;
}

export interface DecisionQuestion extends QuestionBase {
  type: 'decision';
  scenario?: LocalizedText;
  options: DecisionOption[];
}

export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | OrderingQuestion
  | ClassificationQuestion
  | DataInterpretationQuestion
  | EvidenceRatingQuestion
  | DecisionQuestion;

export type QuestionType = Question['type'];

/* ------------------------------------------------------------------ */
/* Cases                                                               */
/* ------------------------------------------------------------------ */

export interface Finding {
  label: LocalizedText;
  /** Free-form value with reference range, e.g. "0.42 (ref 0.9–1.3)". */
  value?: string;
  direction: 'up' | 'down' | 'unchanged';
}

export interface Stage {
  id: string;
  title: LocalizedText;
  /** One sentence: what the learner has to do here. */
  goal: LocalizedText;
  /** Information revealed only at this stage (progressive disclosure). */
  brief?: LocalizedText;
  newFindings?: Finding[];
  chart?: ChartSpec;
  questions: Question[];
}

export interface Case {
  id: string;
  title: LocalizedText;
  species?: string;
  context: 'human' | 'veterinary' | 'comparative';
  /** Max ~150 words. */
  introduction: LocalizedText;
  findings: Finding[];
  stages: Stage[];
}

/* ------------------------------------------------------------------ */
/* Mechanism or Hype?                                                  */
/* ------------------------------------------------------------------ */

export type HypeVerdict = 'supported' | 'partly_supported' | 'unsupported';

export const HYPE_VERDICTS: HypeVerdict[] = ['supported', 'partly_supported', 'unsupported'];

export interface HypeStatement {
  id: string;
  statement: LocalizedText;
  verdict: HypeVerdict;
  points: number;
  explanation: LocalizedText;
}

/* ------------------------------------------------------------------ */
/* Therapy Builder                                                     */
/* ------------------------------------------------------------------ */

export type TherapyStepKind =
  | 'problem'
  | 'pathway'
  | 'intervention'
  | 'biomarker'
  | 'experiment'
  | 'evidence';

export interface TherapyBuilderStep {
  id: string;
  kind: TherapyStepKind;
  question: Question;
  /** Fallback pathway node label when the answer has no option label. */
  summaryLabel?: LocalizedText;
}

export interface TherapyBuilder {
  id: string;
  title: LocalizedText;
  problem: LocalizedText;
  findings?: Finding[];
  steps: TherapyBuilderStep[];
}

/* ------------------------------------------------------------------ */
/* Week                                                                */
/* ------------------------------------------------------------------ */

export interface Week {
  id: string;
  week: number;
  title: LocalizedText;
  subtitle: LocalizedText;
  estimatedMinutes: number;
  /** false renders the week as "Locked" on the dashboard. */
  available: boolean;
  learningObjectives: LocalizedText[];
  cases: Case[];
  mechanismOrHype: HypeStatement[];
  therapyBuilder?: TherapyBuilder;
  takeHomeMessages: LocalizedText[];
  /** Nodes of the closing "Your translational pathway" diagram. */
  summaryPathway: LocalizedText[];
  pointsBudget: PointsBudget;
}
