import type { Question } from '../../types/content';
import type { QuestionViewProps } from './types';
import {
  DataInterpretationView,
  DecisionView,
  MultipleChoiceView,
  SingleChoiceView,
} from './ChoiceQuestions';
import { TrueFalseView } from './TrueFalseView';
import { OrderingView } from './OrderingView';
import { ClassificationView } from './ClassificationView';
import { EvidenceRatingView } from './EvidenceRatingView';

/**
 * The only place that knows about question types in the UI. Adding a type means
 * adding one case here and one component — no change anywhere else.
 */
export function QuestionRenderer({ question, draft, onDraft, result }: QuestionViewProps<Question>) {
  const shared = { draft, onDraft, result };
  switch (question.type) {
    case 'single_choice':
      return <SingleChoiceView question={question} {...shared} />;
    case 'multiple_choice':
      return <MultipleChoiceView question={question} {...shared} />;
    case 'true_false':
      return <TrueFalseView question={question} {...shared} />;
    case 'ordering':
      return <OrderingView question={question} {...shared} />;
    case 'classification':
      return <ClassificationView question={question} {...shared} />;
    case 'data_interpretation':
      return <DataInterpretationView question={question} {...shared} />;
    case 'evidence_rating':
      return <EvidenceRatingView question={question} {...shared} />;
    case 'decision':
      return <DecisionView question={question} {...shared} />;
  }
}

/** Is the draft answer complete enough to be submitted? */
export function isAnswerReady(question: Question, draft: QuestionViewProps['draft']): boolean {
  if (!draft) return false;
  switch (question.type) {
    case 'classification':
      return draft.kind === 'assignment' && question.items.every((item) => draft.assignment[item.id]);
    case 'ordering':
      return draft.kind === 'order' && draft.order.length === question.items.length;
    default:
      return true;
  }
}
