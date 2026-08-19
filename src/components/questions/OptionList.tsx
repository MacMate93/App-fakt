import type { Option } from '../../types/content';
import type { OptionState } from '../../types/answers';
import { useLocale } from '../../state/LocaleProvider';
import styles from './questions.module.css';

interface OptionListProps {
  options: Option[];
  selected: string[];
  multiple: boolean;
  disabled: boolean;
  /** Present once the answer is submitted; drives the correct/wrong marking. */
  optionStates?: Record<string, OptionState>;
  onToggle: (optionId: string) => void;
}

const STATE_CLASS: Record<OptionState, string> = {
  correct: styles.optionCorrect,
  missed: styles.optionMissed,
  partial: styles.optionPartial,
  wrong: styles.optionWrong,
  neutral: '',
};

const MARKER_STATE_CLASS: Record<OptionState, string> = {
  correct: styles.markerCorrect,
  missed: styles.markerMissed,
  partial: styles.markerPartial,
  wrong: styles.markerWrong,
  neutral: '',
};

/** Shared option renderer for single choice, multiple choice, decision and data interpretation. */
export function OptionList({
  options,
  selected,
  multiple,
  disabled,
  optionStates,
  onToggle,
}: OptionListProps) {
  const { text } = useLocale();
  const revealed = Boolean(optionStates);

  return (
    <ul className={styles.options}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        const state = optionStates?.[option.id];
        const stateClass = state ? STATE_CLASS[state] : '';
        const markerClass = state
          ? MARKER_STATE_CLASS[state]
          : isSelected
            ? styles.markerOn
            : '';
        // Rationales are shown for the chosen options and for the correct ones,
        // so the learner sees both why they were wrong and why the answer holds.
        const showRationale =
          revealed && option.rationale && (isSelected || state === 'correct' || state === 'missed');
        const marker =
          state === 'wrong' ? '✕' : isSelected || state === 'correct' || state === 'missed' ? '✓' : '';

        return (
          <li key={option.id}>
            <button
              type="button"
              className={[
                styles.option,
                !revealed && isSelected ? styles.optionSelected : '',
                stateClass,
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => onToggle(option.id)}
            >
              <span
                aria-hidden="true"
                className={[
                  styles.marker,
                  multiple ? styles.markerCheckbox : styles.markerRadio,
                  markerClass,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {marker}
              </span>
              <span className={styles.optionText}>
                <span className={styles.optionLabel}>{text(option.text)}</span>
                {showRationale ? (
                  <span className={styles.rationale}>{text(option.rationale!)}</span>
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
