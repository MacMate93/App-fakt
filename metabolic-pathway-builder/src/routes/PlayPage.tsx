import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { PlayablePathway } from '@/types/pathway';
import type { SessionConfig } from '@/types/session';
import { getPlayablePathway } from '@/data';
import { indexPathway } from '@/engine/pathwayModel';
import { hintTiers } from '@/engine/hints';
import { isDifficulty, isGameMode, isTaskMode, taskModeLabel } from '@/engine/modes';
import { randomSeed } from '@/engine/random';
import {
  allSlotsAnswered,
  createSessionReducer,
  createSessionState,
  tokenAvailability,
} from '@/engine/sessionReducer';
import { summariseRun } from '@/engine/summary';
import { DragProvider } from '@/interaction/DragContext';
import { Badge } from '@/components/layout/Badge';
import { Button } from '@/components/layout/Button';
import { Card } from '@/components/layout/Card';
import { DragLayer } from '@/components/game/DragLayer';
import { FeedbackPanel } from '@/components/game/FeedbackPanel';
import { ProgressHeader } from '@/components/game/ProgressHeader';
import { ScoreRail } from '@/components/game/ScoreRail';
import { TaskStrip } from '@/components/game/TaskStrip';
import { TokenTray } from '@/components/game/TokenTray';
import { PathwayCanvas } from '@/components/pathway/PathwayCanvas';
import { CompletionScreen } from '@/components/results/CompletionScreen';
import { SummaryQuiz } from '@/components/results/SummaryQuiz';
import { useProgress } from '@/state/ProgressProvider';
import styles from './routes.module.css';
import gameStyles from '@/components/game/game.module.css';

export function PlayPage() {
  const { pathwayId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const [seed, setSeed] = useState(randomSeed);
  const pathway = getPlayablePathway(pathwayId);

  const modeParam = searchParams.get('mode');
  const difficultyParam = searchParams.get('difficulty');
  const gameParam = searchParams.get('game');

  const config: SessionConfig = {
    pathwayId,
    mode: isTaskMode(modeParam) ? modeParam : 'build',
    difficulty: isDifficulty(difficultyParam) ? difficultyParam : 'beginner',
    gameMode: isGameMode(gameParam) ? gameParam : 'learning',
    seed,
  };

  if (!pathway) {
    return (
      <Card className={styles.emptyState}>
        <h2>This pathway is not playable yet</h2>
        <p className={styles.pathwaySummary}>
          The module has no content file so far. Glycolysis is the one that is ready.
        </p>
        <Link to="/">
          <Button variant="secondary">Back to the pathways</Button>
        </Link>
      </Card>
    );
  }

  return (
    <GameSession
      key={`${config.mode}-${config.difficulty}-${config.gameMode}-${seed}`}
      pathway={pathway}
      config={config}
      onRestart={() => setSeed(randomSeed())}
    />
  );
}

function GameSession({
  pathway,
  config,
  onRestart,
}: {
  pathway: PlayablePathway;
  config: SessionConfig;
  onRestart: () => void;
}) {
  const index = useMemo(() => indexPathway(pathway), [pathway]);
  const reducer = useMemo(() => createSessionReducer(pathway), [pathway]);
  const [state, dispatch] = useReducer(reducer, config, (initial) =>
    createSessionState(pathway, initial),
  );
  const { recordRun } = useProgress();
  const recorded = useRef(false);

  const summary = useMemo(() => summariseRun(index, state), [index, state]);

  useEffect(() => {
    if (state.phase !== 'complete' || recorded.current) return;
    recorded.current = true;
    recordRun(
      {
        pathwayId: config.pathwayId,
        difficulty: config.difficulty,
        gameMode: config.gameMode,
        xp: summary.xp,
        accuracy: summary.accuracy,
        hintsUsed: summary.hintsUsed,
        durationMs: summary.durationMs,
        completedAt: Date.now(),
      },
      state.bestStreak,
    );
  }, [state.phase, state.bestStreak, summary, config, recordRun]);

  const handleDrop = useCallback((slotId: string, tokenId: string) => {
    dispatch({ type: 'place', slotId, tokenId });
  }, []);

  const exam = config.gameMode === 'exam';
  const activeSlot = state.slots.find((slot) => slot.id === state.activeSlotId) ?? null;
  const hints = useMemo(
    () => (activeSlot ? hintTiers(index, activeSlot) : []),
    [index, activeSlot],
  );
  const availability = useMemo(() => tokenAvailability(state), [state]);
  const done = exam
    ? state.slots.filter((slot) => state.placements[slot.id]).length
    : state.slots.filter((slot) => state.results[slot.id]?.solved).length;
  const unanswered = state.slots.length - done;

  return (
    <DragProvider onDrop={handleDrop}>
      {state.phase === 'complete' ? (
        <CompletionScreen index={index} state={state} summary={summary} onRestart={onRestart} />
      ) : state.phase === 'quiz' ? (
        <div className={styles.stack}>
          <SummaryQuiz
            items={pathway.summaryQuiz ?? []}
            answers={state.quizAnswers}
            onAnswer={(itemId, optionId) => dispatch({ type: 'answer-quiz', itemId, optionId })}
          />
          <div className={styles.inlineActions}>
            <Button onClick={() => dispatch({ type: 'skip-quiz' })}>See your results</Button>
          </div>
        </div>
      ) : (
        <>
          <ProgressHeader
            title={`${pathway.name} — ${taskModeLabel(config.mode)}`}
            subtitle={`${config.difficulty} · ${exam ? 'exam mode — no hints, marked at the end' : 'learning mode — hints and retries allowed'}`}
            done={done}
            total={state.slots.length}
          />

          <div className={styles.playLayout} style={{ marginTop: 'var(--space-4)' }}>
            <div className={styles.canvasColumn}>
              {!exam ? (
                <TaskStrip
                  slot={activeSlot}
                  position={
                    activeSlot
                      ? state.slots.findIndex((slot) => slot.id === activeSlot.id) + 1
                      : 0
                  }
                  total={state.slots.length}
                  hints={hints}
                  hintsShown={activeSlot ? (state.hintsShown[activeSlot.id] ?? 0) : 0}
                  canHint
                  onHint={() =>
                    activeSlot ? dispatch({ type: 'hint', slotId: activeSlot.id }) : undefined
                  }
                />
              ) : null}

              {!exam ? (
                <FeedbackPanel
                  feedback={state.feedback}
                  onDismiss={() => dispatch({ type: 'dismiss-feedback' })}
                />
              ) : null}

              <Card padded={false} className={styles.canvasCard}>
                <PathwayCanvas
                  index={index}
                  slots={state.slots}
                  placements={state.placements}
                  results={state.results}
                  tokens={state.tokens}
                  activeSlotId={state.activeSlotId}
                  wrongSlotId={state.feedback?.tone === 'incorrect' ? state.feedback.slotId : null}
                  onSlotActivate={(slotId) => dispatch({ type: 'select-slot', slotId })}
                  onSlotClear={exam ? (slotId) => dispatch({ type: 'clear', slotId }) : undefined}
                />
              </Card>
            </div>

            <div className={styles.sideColumn}>
              <ScoreRail
                xp={state.xp}
                streak={state.streak}
                solved={done}
                total={state.slots.length}
                hintsUsed={Object.values(state.hintsShown).reduce((sum, value) => sum + value, 0)}
                examMode={exam}
              />

              {exam ? (
                <Card>
                  <h3 className={gameStyles.progressTitle}>Exam mode</h3>
                  <p className={styles.detailText} style={{ marginTop: 'var(--space-2)' }}>
                    No hints and no feedback until you submit. Tap a filled position to clear it.
                  </p>
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <Button onClick={() => dispatch({ type: 'submit' })}>
                      {allSlotsAnswered(state)
                        ? 'Submit'
                        : `Submit (${unanswered} unanswered)`}
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card>
                  <h3 className={gameStyles.progressTitle}>Where you are</h3>
                  <p className={styles.detailText} style={{ marginTop: 'var(--space-2)' }}>
                    {activeSlot
                      ? 'The highlighted position is the current task. You can answer them in any order — just tap another blank.'
                      : 'Every position is filled.'}
                  </p>
                  <div className={styles.detailList} style={{ marginTop: 'var(--space-3)' }}>
                    <Badge tone="accent">100 XP first try</Badge>
                    <Badge>70 XP second</Badge>
                    <Badge>40 XP third</Badge>
                  </div>
                </Card>
              )}

              <Card>
                <h3 className={gameStyles.progressTitle}>Need the map?</h3>
                <p className={styles.detailText} style={{ marginTop: 'var(--space-2)' }}>
                  Explore shows the complete pathway with regulation and clinical notes. Opening it
                  costs nothing — but the answers are all there.
                </p>
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <Link to={`/explore/${pathway.id}`}>
                    <Button variant="secondary" size="small">
                      Open Explore
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          <TokenTray tokens={state.tokens} availability={availability} />
        </>
      )}
      <DragLayer />
    </DragProvider>
  );
}
