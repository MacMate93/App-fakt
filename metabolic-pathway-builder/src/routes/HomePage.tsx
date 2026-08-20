import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Pathway } from '@/types/pathway';
import type { Difficulty, TaskMode } from '@/types/session';
import { pathways } from '@/data';
import { isPlayable } from '@/types/pathway';
import { DIFFICULTIES, TASK_MODES } from '@/engine/modes';
import { Badge } from '@/components/layout/Badge';
import { Button } from '@/components/layout/Button';
import { Card } from '@/components/layout/Card';
import { ProgressBar } from '@/components/layout/ProgressBar';
import { masteryOf } from '@/storage/localProgress';
import { useProgress } from '@/state/ProgressProvider';
import styles from './routes.module.css';

const FIRST_PLAYABLE = pathways.find(isPlayable)?.id ?? 'glycolysis';

export function HomePage() {
  const navigate = useNavigate();
  const { progress, reset } = useProgress();

  const start = (pathwayId: string, mode: TaskMode, difficulty: Difficulty, game: 'learning' | 'exam') =>
    navigate(`/play/${pathwayId}?mode=${mode}&difficulty=${difficulty}&game=${game}`);

  return (
    <>
      <Card className={styles.hero}>
        <h1 className={styles.heroTitle}>Metabolic Pathway Builder</h1>
        <p className={styles.heroLead}>
          Build it. Understand it. Master metabolism. Assemble pathways step by step instead of
          memorising them: place the enzymes, the intermediates and the cofactors yourself, and get
          an explanation for every move — right or wrong.
        </p>
        <div className={styles.heroActions}>
          <Button onClick={() => start(FIRST_PLAYABLE, 'build', 'beginner', 'learning')}>
            Start learning
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/explore/${FIRST_PLAYABLE}`)}>
            Explore pathways
          </Button>
          <Button
            variant="secondary"
            onClick={() => start(FIRST_PLAYABLE, 'build', 'intermediate', 'exam')}
          >
            Exam mode
          </Button>
        </div>
      </Card>

      <div className={styles.sectionTitle}>
        <h2>Pathways</h2>
        <span className={styles.sectionHint}>
          {progress.totalXp.toLocaleString('en-US')} XP earned · best streak {progress.bestStreak}
          {progress.totalXp > 0 ? (
            <>
              {' · '}
              <button
                type="button"
                onClick={reset}
                style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textDecoration: 'underline', color: 'inherit' }}
              >
                reset progress
              </button>
            </>
          ) : null}
        </span>
      </div>

      <div className={styles.pathwayGrid}>
        {pathways.map((pathway) =>
          isPlayable(pathway) ? (
            <PlayableCard
              key={pathway.id}
              pathway={pathway}
              mastery={masteryOf(progress, pathway.id)}
              onStart={start}
              onExplore={() => navigate(`/explore/${pathway.id}`)}
            />
          ) : (
            <LockedCard key={pathway.id} pathway={pathway} />
          ),
        )}
      </div>
    </>
  );
}

function PlayableCard({
  pathway,
  mastery,
  onStart,
  onExplore,
}: {
  pathway: Pathway;
  mastery: number;
  onStart: (pathwayId: string, mode: TaskMode, difficulty: Difficulty, game: 'learning' | 'exam') => void;
  onExplore: () => void;
}) {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [mode, setMode] = useState<TaskMode>('build');
  const modeInfo = TASK_MODES.find((info) => info.id === mode);
  const difficultyInfo = DIFFICULTIES.find((info) => info.id === difficulty);

  return (
    <Card className={styles.pathwayCard}>
      <div className={styles.pathwayHead}>
        <div>
          <h3 className={styles.pathwayName}>{pathway.name}</h3>
          <span className={styles.pathwaySub}>{pathway.subtitle}</span>
        </div>
        <Badge tone="accent">{pathway.reactions?.length ?? 0} steps</Badge>
      </div>

      <p className={styles.pathwaySummary}>{pathway.summary}</p>

      <div>
        <span className={styles.controlLabel}>Difficulty</span>
        <div className={styles.segmented} role="group" aria-label="Difficulty">
          {DIFFICULTIES.map((info) => (
            <button
              key={info.id}
              type="button"
              className={[styles.segment, difficulty === info.id ? styles.segmentActive : ''].join(' ')}
              onClick={() => setDifficulty(info.id)}
              aria-pressed={difficulty === info.id}
            >
              {info.label}
            </button>
          ))}
        </div>
        <p className={styles.pathwaySummary} style={{ marginTop: 'var(--space-2)' }}>
          {difficultyInfo?.description}
        </p>
      </div>

      <div>
        <label className={styles.controlLabel} htmlFor={`mode-${pathway.id}`}>
          Task focus
        </label>
        <select
          id={`mode-${pathway.id}`}
          className={styles.select}
          value={mode}
          onChange={(event) => setMode(event.target.value as TaskMode)}
        >
          {TASK_MODES.map((info) => (
            <option key={info.id} value={info.id}>
              {info.label}
            </option>
          ))}
        </select>
        <p className={styles.pathwaySummary} style={{ marginTop: 'var(--space-2)' }}>
          {modeInfo?.description}
        </p>
      </div>

      <div className={styles.masteryRow}>
        <span>Mastery</span>
        <ProgressBar value={mastery} label={`${pathway.name} mastery`} />
        <span>{Math.round(mastery * 100)}%</span>
      </div>

      <div className={styles.cardActions}>
        <Button onClick={() => onStart(pathway.id, mode, difficulty, 'learning')}>
          Learning mode
        </Button>
        <Button variant="secondary" onClick={() => onStart(pathway.id, mode, difficulty, 'exam')}>
          Exam mode
        </Button>
        <Button variant="ghost" onClick={onExplore}>
          Explore
        </Button>
      </div>
    </Card>
  );
}

function LockedCard({ pathway }: { pathway: Pathway }) {
  return (
    <Card className={[styles.pathwayCard, styles.locked].join(' ')}>
      <div className={styles.pathwayHead}>
        <div>
          <h3 className={styles.pathwayName}>{pathway.name}</h3>
          <span className={styles.pathwaySub}>{pathway.subtitle}</span>
        </div>
        <Badge>Coming soon</Badge>
      </div>
      <p className={styles.pathwaySummary}>{pathway.summary}</p>
      {pathway.compartment ? <Badge tone="neutral">{pathway.compartment}</Badge> : null}
    </Card>
  );
}
