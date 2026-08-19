import type { EvidenceLevel, EvidenceRatingQuestion } from '../../types/content';
import { useLocale } from '../../state/LocaleProvider';
import { EvidenceLadder } from '../modules/EvidenceLadder';
import type { QuestionViewProps } from './types';
import styles from './questions.module.css';

/** Place a finding on the shared evidence ladder. */
export function EvidenceRatingView({
  question,
  draft,
  onDraft,
  result,
}: QuestionViewProps<EvidenceRatingQuestion>) {
  const { text, ui } = useLocale();
  const value = draft?.kind === 'level' ? draft.level : null;

  return (
    <div className={styles.body}>
      <div className={styles.claim}>
        <span className={styles.claimLabel}>{ui.question.claim}</span>
        {text(question.claim)}
      </div>
      <p className={styles.hint}>{ui.question.evidenceHint}</p>
      <EvidenceLadder
        value={value}
        correctLevel={result ? question.correctLevel : null}
        disabled={Boolean(result)}
        onSelect={(level: EvidenceLevel) => onDraft({ kind: 'level', level })}
      />
    </div>
  );
}
