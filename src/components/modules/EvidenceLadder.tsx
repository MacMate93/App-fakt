import { EVIDENCE_LEVELS, type EvidenceLevel } from '../../types/content';
import { useLocale } from '../../state/LocaleProvider';
import styles from './modules.module.css';

interface EvidenceLadderProps {
  /** The level the learner selected, if any. */
  value?: number | null;
  /** Shown once the answer is revealed. */
  correctLevel?: number | null;
  onSelect?: (level: EvidenceLevel) => void;
  disabled?: boolean;
  /** Static reference rendering with no selection affordance. */
  reference?: boolean;
}

/**
 * The course-wide evidence scale. Rendered top-down (5 → 1) so it reads as a
 * ladder, and reused both as an interactive control and as a static reference.
 */
export function EvidenceLadder({
  value,
  correctLevel,
  onSelect,
  disabled,
  reference,
}: EvidenceLadderProps) {
  const { ui } = useLocale();
  const revealed = correctLevel != null;

  return (
    <div>
      <div className={styles.ladder}>
        {[...EVIDENCE_LEVELS].reverse().map((level) => {
          const isSelected = value === level;
          const isCorrect = correctLevel === level;
          const className = [
            styles.rung,
            revealed
              ? isCorrect
                ? styles.rungCorrect
                : isSelected
                  ? styles.rungWrong
                  : ''
              : isSelected
                ? styles.rungSelected
                : '',
          ]
            .filter(Boolean)
            .join(' ');

          const content = (
            <>
              <span className={styles.rungLevel}>{level}</span>
              <span className={styles.rungLabel}>{ui.ladder.levels[level]}</span>
              {revealed && isSelected ? (
                <span className={styles.rungTag}>{ui.question.yourAnswer}</span>
              ) : null}
            </>
          );

          if (reference) {
            return (
              <div key={level} className={className}>
                {content}
              </div>
            );
          }
          return (
            <button
              key={level}
              type="button"
              className={className}
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => onSelect?.(level)}
            >
              {content}
            </button>
          );
        })}
      </div>
      <p className={styles.ladderMessage}>{ui.ladder.message}</p>
    </div>
  );
}
