import { Card } from '@/components/layout/Card';
import { streakTier } from '@/engine/scoring';
import styles from './game.module.css';

export function ScoreRail({
  xp,
  streak,
  solved,
  total,
  hintsUsed,
  examMode,
}: {
  xp: number;
  streak: number;
  solved: number;
  total: number;
  hintsUsed: number;
  examMode: boolean;
}) {
  const tier = streakTier(streak);
  return (
    <Card>
      <div className={styles.scoreGrid}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{examMode ? 'Answered' : 'XP'}</span>
          <span className={styles.statValue}>{examMode ? `${solved}/${total}` : xp}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Placed</span>
          <span className={styles.statValue}>
            {solved}/{total}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Streak</span>
          <span className={styles.statValue}>{streak}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Hints</span>
          <span className={styles.statValue}>{hintsUsed}</span>
        </div>
      </div>
      {tier && !examMode ? (
        <div className={styles.streak} style={{ marginTop: 'var(--space-3)' }}>
          🔥 {streak} in a row — {tier.label}
        </div>
      ) : null}
    </Card>
  );
}
