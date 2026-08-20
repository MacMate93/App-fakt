import { Link } from 'react-router-dom';
import type { SessionState } from '@/types/session';
import type { RunSummary } from '@/engine/summary';
import type { PathwayIndex } from '@/engine/pathwayModel';
import { formatDuration } from '@/engine/summary';
import { Badge } from '@/components/layout/Badge';
import { Button } from '@/components/layout/Button';
import { Card } from '@/components/layout/Card';
import { PathwayCanvas } from '@/components/pathway/PathwayCanvas';
import { taskModeLabel } from '@/engine/modes';
import gameStyles from '@/components/game/game.module.css';
import styles from '@/routes/routes.module.css';

export function CompletionScreen({
  index,
  state,
  summary,
  onRestart,
}: {
  index: PathwayIndex;
  state: SessionState;
  summary: RunSummary;
  onRestart: () => void;
}) {
  const exam = state.config.gameMode === 'exam';
  const percent = Math.round(summary.accuracy * 100);

  const stats: { label: string; value: string }[] = [
    { label: exam ? 'Result' : 'Score', value: exam ? `${percent}%` : `${summary.xp} XP` },
    { label: 'Accuracy', value: `${percent}%` },
    {
      label: exam ? 'Correct' : 'First try',
      value: `${exam ? summary.solved : summary.firstTry}/${summary.totalSlots}`,
    },
    { label: 'Hints used', value: String(summary.hintsUsed) },
    { label: 'Time', value: formatDuration(summary.durationMs) },
    { label: 'Best streak', value: String(summary.bestStreak) },
  ];

  return (
    <div className={styles.stack}>
      <Card>
        <div className={styles.playTitle}>
          <h1>{index.pathway.name} completed</h1>
          <Badge tone="accent">{taskModeLabel(state.config.mode)}</Badge>
          <Badge>{state.config.difficulty}</Badge>
          <Badge tone={exam ? 'regulatory' : 'correct'}>{exam ? 'Exam mode' : 'Learning mode'}</Badge>
        </div>

        <div className={styles.resultGrid}>
          {stats.map((stat) => (
            <div className={gameStyles.stat} key={stat.label}>
              <span className={gameStyles.statLabel}>{stat.label}</span>
              <span className={gameStyles.statValue}>{stat.value}</span>
            </div>
          ))}
        </div>

        {summary.bonus > 0 ? (
          <Badge tone="correct">Flawless run — bonus +{summary.bonus} XP</Badge>
        ) : null}
        {summary.quizTotal > 0 ? (
          <p className={styles.pathwaySummary} style={{ marginTop: 'var(--space-3)' }}>
            Wrap-up questions: {summary.quizCorrect}/{summary.quizTotal} correct (+{summary.quizXp} XP)
          </p>
        ) : null}

        <div className={styles.reviewColumns}>
          <div>
            <span className={styles.detailLabel}>Key concepts mastered</span>
            <div className={styles.reviewList} style={{ marginTop: 'var(--space-2)' }}>
              {summary.mastered.length === 0 ? (
                <p className={styles.detailText}>Nothing cleared first time — worth another run.</p>
              ) : (
                summary.mastered.map((item) => (
                  <div className={[styles.reviewItem, styles.reviewItemGood].join(' ')} key={item}>
                    ✓ {item}
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <span className={styles.detailLabel}>Needs review</span>
            <div className={styles.reviewList} style={{ marginTop: 'var(--space-2)' }}>
              {summary.needsReview.length === 0 ? (
                <p className={styles.detailText}>Nothing — every position went in first time.</p>
              ) : (
                summary.needsReview.map((item) => (
                  <div className={[styles.reviewItem, styles.reviewItemWarn].join(' ')} key={item.label}>
                    <span>
                      ⚠ {item.label}
                      <span className={styles.reviewReason}>{item.reason}</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={styles.inlineActions} style={{ marginTop: 'var(--space-5)' }}>
          <Button onClick={onRestart}>Play again</Button>
          <Link to={`/explore/${index.pathway.id}`}>
            <Button variant="secondary">Explore the pathway</Button>
          </Link>
          <Link to="/">
            <Button variant="ghost">Back to pathways</Button>
          </Link>
        </div>
      </Card>

      <Card padded={false} className={styles.canvasCard}>
        <PathwayCanvas
          index={index}
          slots={state.slots}
          placements={state.placements}
          results={state.results}
          tokens={state.tokens}
          review
        />
      </Card>
    </div>
  );
}
