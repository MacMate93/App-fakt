import type { Slot } from '@/types/session';
import { Badge } from '@/components/layout/Badge';
import { Button } from '@/components/layout/Button';
import { Card } from '@/components/layout/Card';
import { HINT_COST } from '@/engine/scoring';
import styles from './game.module.css';

const KIND_LABEL: Record<Slot['kind'], string> = {
  metabolite: 'Metabolite',
  enzyme: 'Enzyme',
  energy: 'Energy',
  redox: 'Cofactor',
};

const KIND_TONE = {
  metabolite: 'metabolite',
  enzyme: 'enzyme',
  energy: 'energy',
  redox: 'redox',
} as const;

export function TaskStrip({
  slot,
  position,
  total,
  hints,
  hintsShown,
  canHint,
  onHint,
}: {
  slot: Slot | null;
  position: number;
  total: number;
  hints: string[];
  hintsShown: number;
  canHint: boolean;
  onHint: () => void;
}) {
  if (!slot) return null;
  const remaining = hints.length - hintsShown;

  return (
    <Card padded={false}>
      <div className={styles.task}>
        <div className={styles.taskHead}>
          <div className={styles.taskMeta}>
            <Badge tone={KIND_TONE[slot.kind]}>{KIND_LABEL[slot.kind]}</Badge>
            <span className={styles.hintIndex}>
              Task {position} of {total}
            </span>
          </div>
          {canHint ? (
            <Button variant="secondary" size="small" onClick={onHint} disabled={remaining <= 0}>
              {remaining > 0 ? `Hint (−${HINT_COST} XP)` : 'No hints left'}
            </Button>
          ) : null}
        </div>

        <p className={styles.taskPrompt}>{slot.prompt}</p>

        {hintsShown > 0 ? (
          <ul className={styles.hintList}>
            {hints.slice(0, hintsShown).map((hint, tier) => (
              <li className={styles.hint} key={hint}>
                <span className={styles.hintIndex}>H{tier + 1}</span>
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Card>
  );
}
