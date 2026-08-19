import type { ReactNode } from 'react';
import styles from './layout.module.css';

export type BadgeTone = 'neutral' | 'accent' | 'correct' | 'partial' | 'incorrect';

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: '',
  accent: styles.badgeAccent,
  correct: styles.badgeCorrect,
  partial: styles.badgePartial,
  incorrect: styles.badgeIncorrect,
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={[styles.badge, TONE_CLASS[tone]].filter(Boolean).join(' ')}>{children}</span>;
}
