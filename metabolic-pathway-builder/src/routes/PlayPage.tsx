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
import { Button } from '@/components/layout/Button';
import { Card } from '@/components/layout/Card';
import { DragLayer } from '@/components/game/DragLayer';
import { ScoreRail } from '@/components/game/ScoreRail';
import { TaskStrip } from '@/components/game/TaskStrip';
import { TokenTray } from '@/components/game/TokenTray';
import { ZoomControl } from '@/components/game/ZoomControl';
import { useFitZoom } from '@/components/layout/useFitZoom';
import { useMediaQuery } from '@/components/layout/useMediaQuery';
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

  const twoColumns = useMediaQuery('(min-width: 760px)');
  const threeColumns = useMediaQuery('(min-width: 1360px)');
  const columns = threeColumns ? 3 : twoColumns ? 2 : 1;
  const paneRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [autoZoom, setAutoZoom] = useState(true);

  const exam = config.gameMode === 'exam';
  const activeSlot = state.slots.find((slot) => slot.id === state.activeSlotId) ?? null;
  const hints = useMemo(
    () => (activeSlot ? hintTiers(index, activeSlot) : []),
    [index, activeSlot],
  );
  const availability = useMemo(() => tokenAvailability(state), [state]);
  useFitZoom({
    paneRef,
    enabled: autoZoom,
    zoom,
    onZoom: setZoom,
    deps: [columns, state.phase, state.slots.length],
  });
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
        <div className={gameStyles.playRoot}>
          <TaskStrip
            title={`${pathway.name} — ${taskModeLabel(config.mode)}`}
            subtitle={`${config.difficulty} · ${exam ? 'exam mode — no hints, marked at the end' : 'learning mode — hints and retries allowed'}`}
            done={done}
            total={state.slots.length}
            slot={exam ? null : activeSlot}
            position={
              activeSlot ? state.slots.findIndex((slot) => slot.id === activeSlot.id) + 1 : 0
            }
            hints={hints}
            hintsShown={activeSlot ? (state.hintsShown[activeSlot.id] ?? 0) : 0}
            canHint={!exam}
            onHint={() => {
              if (activeSlot) dispatch({ type: 'hint', slotId: activeSlot.id });
            }}
            feedback={exam ? null : state.feedback}
            onDismissFeedback={() => dispatch({ type: 'dismiss-feedback' })}
            actions={
              <>
                <ZoomControl
                  zoom={zoom}
                  onChange={(next) => {
                    setAutoZoom(false);
                    setZoom(next);
                  }}
                />
                <Link to={`/explore/${pathway.id}`}>
                  <Button variant="ghost" size="small">
                    Explore
                  </Button>
                </Link>
              </>
            }
          />

          <div className={gameStyles.playLayout}>
            <div className={gameStyles.canvasColumn}>
              <Card padded={false} className={styles.canvasCard} ref={paneRef}>
                <PathwayCanvas
                  index={index}
                  slots={state.slots}
                  placements={state.placements}
                  results={state.results}
                  tokens={state.tokens}
                  activeSlotId={state.activeSlotId}
                  wrongSlotId={state.feedback?.tone === 'incorrect' ? state.feedback.slotId : null}
                  columns={columns}
                  zoom={zoom}
                  onSlotActivate={(slotId) => dispatch({ type: 'select-slot', slotId })}
                  onSlotClear={exam ? (slotId) => dispatch({ type: 'clear', slotId }) : undefined}
                />
              </Card>
            </div>

            <aside className={gameStyles.sideColumn}>
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
                      {allSlotsAnswered(state) ? 'Submit' : `Submit (${unanswered} unanswered)`}
                    </Button>
                  </div>
                </Card>
              ) : null}

              <TokenTray tokens={state.tokens} availability={availability} />
            </aside>
          </div>
        </div>
      )}
      <DragLayer />
    </DragProvider>
  );
}
