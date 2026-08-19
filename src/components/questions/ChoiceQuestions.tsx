import type {
  DataInterpretationQuestion,
  DecisionQuestion,
  MultipleChoiceQuestion,
  SingleChoiceQuestion,
} from '../../types/content';
import { useLocale } from '../../state/LocaleProvider';
import { ChartRenderer } from '../charts/ChartRenderer';
import { OptionList } from './OptionList';
import type { QuestionViewProps } from './types';
import styles from './questions.module.css';

function selectedIds(draft: QuestionViewProps['draft']): string[] {
  if (!draft) return [];
  if (draft.kind === 'option') return [draft.optionId];
  if (draft.kind === 'options') return draft.optionIds;
  return [];
}

/** One correct answer. */
export function SingleChoiceView({
  question,
  draft,
  onDraft,
  result,
}: QuestionViewProps<SingleChoiceQuestion>) {
  const { ui } = useLocale();
  return (
    <div className={styles.body}>
      <p className={styles.hint}>{ui.question.selectOne}</p>
      <OptionList
        options={question.options}
        selected={selectedIds(draft)}
        multiple={false}
        disabled={Boolean(result)}
        optionStates={result?.optionStates}
        onToggle={(optionId) => onDraft({ kind: 'option', optionId })}
      />
    </div>
  );
}

/** Several correct answers; partial credit by default. */
export function MultipleChoiceView({
  question,
  draft,
  onDraft,
  result,
}: QuestionViewProps<MultipleChoiceQuestion>) {
  const { ui } = useLocale();
  const selected = selectedIds(draft);
  return (
    <div className={styles.body}>
      <p className={styles.hint}>{ui.question.selectAll}</p>
      <OptionList
        options={question.options}
        selected={selected}
        multiple
        disabled={Boolean(result)}
        optionStates={result?.optionStates}
        onToggle={(optionId) => {
          const next = selected.includes(optionId)
            ? selected.filter((id) => id !== optionId)
            : [...selected, optionId];
          onDraft(next.length > 0 ? { kind: 'options', optionIds: next } : null);
        }}
      />
    </div>
  );
}

/** A figure plus a question about reading it. */
export function DataInterpretationView({
  question,
  draft,
  onDraft,
  result,
}: QuestionViewProps<DataInterpretationQuestion>) {
  const { ui } = useLocale();
  const multiple = question.select === 'multiple';
  const selected = selectedIds(draft);
  return (
    <div className={styles.body}>
      <ChartRenderer spec={question.chart} />
      <p className={styles.hint}>{multiple ? ui.question.selectAll : ui.question.selectOne}</p>
      <OptionList
        options={question.options}
        selected={selected}
        multiple={multiple}
        disabled={Boolean(result)}
        optionStates={result?.optionStates}
        onToggle={(optionId) => {
          if (!multiple) {
            onDraft({ kind: 'option', optionId });
            return;
          }
          const next = selected.includes(optionId)
            ? selected.filter((id) => id !== optionId)
            : [...selected, optionId];
          onDraft(next.length > 0 ? { kind: 'options', optionIds: next } : null);
        }}
      />
    </div>
  );
}

/** A therapeutic or experimental decision; options are graded, not binary. */
export function DecisionView({
  question,
  draft,
  onDraft,
  result,
}: QuestionViewProps<DecisionQuestion>) {
  const { text, ui } = useLocale();
  return (
    <div className={styles.body}>
      {question.scenario ? <p className={styles.claim}>{text(question.scenario)}</p> : null}
      <p className={styles.hint}>{ui.question.selectOne}</p>
      <OptionList
        options={question.options}
        selected={selectedIds(draft)}
        multiple={false}
        disabled={Boolean(result)}
        optionStates={result?.optionStates}
        onToggle={(optionId) => onDraft({ kind: 'option', optionId })}
      />
    </div>
  );
}
