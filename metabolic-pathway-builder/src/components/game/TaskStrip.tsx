/*
 * The one panel above the canvas: where you are, what the current task is, the
 * hint ladder and the feedback for the last placement.
 *
 * These used to be three stacked cards, which pushed the pathway itself off the
 * screen. Progress, prompt and feedback belong together anyway — they are all
 * answers to "what am I doing right now".
 */
import type { ReactNode } from 'react';
import type { Feedback, Slot } from '@/types/session';
import { Badge } from '@/components/layout/Badge';
import { Button } from '@/components/layout/Button';
import { Card } from '@/components/layout/Card';
import { ProgressBar } from '@/components/layout/ProgressBar';
import { HINT_COST } from '@/engine/scoring';
import { FeedbackPanel } from './FeedbackPanel';
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
  title,
  subtitle,
  done,
  total,
  slot,
  position,
  hints,
  hintsShown,
  canHint,
  onHint,
  feedback,
  onDismissFeedback,
  actions,
}: {
  title: string;
  subtitle?: string;
  done: number;
  total: number;
  slot: Slot | null;
  position: number;
  hints: string[];
  hintsShown: number;
  canHint: boolean;
  onHint: () => void;
  feedback: Feedback | null;
  onDismissFeedback: () => void;
  actions?: ReactNode;
}) {
  const remaining = hints.length - hintsShown;

  return (
    <Card padded={false}>
      <div className={styles.task}>
        <div className={styles.taskTop}>
          <div className={styles.taskTitleGroup}>
            <span className={styles.progressTitle}>{title}</span>
            <span className={styles.progressCount}>
              {done} / {total} positions
            </span>
          </div>
          {actions ? <div className={styles.taskActions}>{actions}</div> : null}
        </div>

        <ProgressBar
          value={total === 0 ? 0 : done / total}
          label={`${done} of ${total} positions completed`}
          tone={done === total ? 'correct' : 'accent'}
        />
        {subtitle ? <span className={styles.progressCount}>{subtitle}</span> : null}

        {slot ? (
          <div className={styles.taskHead}>
            <div className={styles.taskMeta}>
              <Badge tone={KIND_TONE[slot.kind]}>{KIND_LABEL[slot.kind]}</Badge>
              <span className={styles.hintIndex}>
                {position} / {total}
              </span>
              <p className={styles.taskPrompt}>{slot.prompt}</p>
            </div>
            {canHint ? (
              <Button variant="secondary" size="small" onClick={onHint} disabled={remaining <= 0}>
                {remaining > 0 ? `Hint (−${HINT_COST} XP)` : 'No hints left'}
              </Button>
            ) : null}
          </div>
        ) : null}

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

        <FeedbackPanel feedback={feedback} onDismiss={onDismissFeedback} />
      </div>
    </Card>
  );
}
