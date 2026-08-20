import type { ReactNode } from 'react';
import styles from './ui.module.css';

export type BadgeTone =
  | 'neutral'
  | 'metabolite'
  | 'enzyme'
  | 'energy'
  | 'redox'
  | 'regulatory'
  | 'correct'
  | 'accent';

const tones: Record<BadgeTone, string> = {
  neutral: '',
  metabolite: styles.badgeMetabolite,
  enzyme: styles.badgeEnzyme,
  energy: styles.badgeEnergy,
  redox: styles.badgeRedox,
  regulatory: styles.badgeRegulatory,
  correct: styles.badgeCorrect,
  accent: styles.badgeAccent,
};

export function Badge({
  tone = 'neutral',
  children,
  title,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  title?: string;
}) {
  return (
    <span className={[styles.badge, tones[tone]].filter(Boolean).join(' ')} title={title}>
      {children}
    </span>
  );
}
