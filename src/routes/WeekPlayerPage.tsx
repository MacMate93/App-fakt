import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { getWeek } from '../content';
import type { HypeStatement, Question, Week } from '../types/content';
import type { AnswerValue } from '../types/answers';
import type { WeekProgress } from '../types/progress';
import { evaluate, evaluateHype } from '../engine/evaluate';
import { computeWeekScore, collectQuestions } from '../engine/scoring';
import { buildModuleFlow, firstUnansweredIndex, stepItemIds } from '../engine/moduleFlow';
import { sessionReducer, type SessionState } from '../engine/sessionReducer';
import { useLocale } from '../state/LocaleProvider';
import { useProgress } from '../state/ProgressProvider';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/layout/Button';
import { ProgressBar } from '../components/layout/ProgressBar';
import { CaseIntroduction } from '../components/case/CaseIntroduction';
import { StageView } from '../components/case/StageView';
import { MechanismOrHype } from '../components/modules/MechanismOrHype';
import { TherapyBuilder } from '../components/modules/TherapyBuilder';
import { WeekSummary } from '../components/feedback/WeekSummary';
import styles from '../components/case/case.module.css';

type ScorableItem =
  | { kind: 'question'; question: Question }
  | { kind: 'hype'; statement: HypeStatement };

/** id -> scorable, so submitting only needs the item id. */
function buildItemIndex(week: Week): Map<string, ScorableItem> {
  const index = new Map<string, ScorableItem>();
  for (const question of collectQuestions(week)) {
    index.set(question.id, { kind: 'question', question });
  }
  for (const statement of week.mechanismOrHype) {
    index.set(statement.id, { kind: 'hype', statement });
  }
  return index;
}

function emptyProgress(week: Week): WeekProgress {
  const score = computeWeekScore(week, {});
  return {
    weekId: week.id,
    status: 'in_progress',
    stepIndex: 0,
    answers: {},
    results: {},
    totalScore: 0,
    maxScore: score.max,
    scoreByCompetency: score.byCompetency,
    startedAt: new Date().toISOString(),
  };
}

/**
 * The single player for every week. It walks the generated module flow, so new
 * content never requires a new page or new routing.
 */
export function WeekPlayerPage() {
  const { weekId } = useParams();
  const week = getWeek(weekId);
  const { ui } = useLocale();
  const { ready, progress, saveWeekProgress } = useProgress();
  const navigate = useNavigate();

  const flow = useMemo(() => (week ? buildModuleFlow(week) : []), [week]);
  const itemIndex = useMemo(() => (week ? buildItemIndex(week) : new Map()), [week]);

  const stored = week ? progress?.weeks[week.id] : undefined;
  const session: SessionState = useMemo(
    () => ({
      weekId: week?.id ?? '',
      stepIndex: Math.min(stored?.stepIndex ?? 0, Math.max(0, flow.length - 1)),
      answers: stored?.answers ?? {},
      results: stored?.results ?? {},
      status: stored?.status === 'completed' ? 'completed' : 'in_progress',
    }),
    [week?.id, stored, flow.length],
  );

  const step = flow[session.stepIndex];

  // Sub-position inside a step. Held locally so that feedback stays on screen
  // after an answer is recorded; recomputed whenever the step changes.
  const resultsRef = useRef(session.results);
  resultsRef.current = session.results;
  const [subIndex, setSubIndex] = useState(() =>
    step ? firstUnansweredIndex(step, session.results) : 0,
  );
  useEffect(() => {
    const current = flow[session.stepIndex];
    if (current) setSubIndex(firstUnansweredIndex(current, resultsRef.current));
  }, [flow, session.stepIndex]);

  const apply = useCallback(
    (next: SessionState) => {
      if (!week) return;
      const score = computeWeekScore(week, next.results);
      const base = stored ?? emptyProgress(week);
      saveWeekProgress({
        ...base,
        weekId: week.id,
        stepIndex: next.stepIndex,
        answers: next.answers,
        results: next.results,
        status: next.status === 'completed' ? 'completed' : 'in_progress',
        totalScore: score.total,
        maxScore: score.max,
        scoreByCompetency: score.byCompetency,
        completedAt:
          next.status === 'completed' ? (base.completedAt ?? new Date().toISOString()) : undefined,
      });
    },
    [week, stored, saveWeekProgress],
  );

  // Reaching the summary step completes the module.
  useEffect(() => {
    if (step?.kind === 'summary' && session.status !== 'completed') {
      apply(sessionReducer(session, { type: 'complete' }));
    }
  }, [step, session, apply]);

  if (!ready) return null;
  if (!progress) return <Navigate to="/" replace />;
  if (!week || !week.available) return <Navigate to="/dashboard" replace />;
  if (!step) return <Navigate to={`/week/${week.id}`} replace />;

  const score = computeWeekScore(week, session.results);

  const submit = (itemId: string, answer: AnswerValue) => {
    const item = itemIndex.get(itemId);
    if (!item) return;
    const result =
      item.kind === 'question' ? evaluate(item.question, answer) : evaluateHype(item.statement, answer);
    apply(sessionReducer(session, { type: 'answer', questionId: itemId, answer, result }));
  };

  const goToNextStep = () => {
    apply(sessionReducer(session, { type: 'next', stepCount: flow.length }));
    setSubIndex(0);
  };

  const advance = () => {
    const count = stepItemIds(step).length;
    // The Therapy Builder renders its own closing diagram at index === count.
    const last = step.kind === 'therapy' ? count : Math.max(0, count - 1);
    if (subIndex < last) {
      setSubIndex(subIndex + 1);
      return;
    }
    goToNextStep();
  };

  const caseProgress =
    step.kind === 'stage' ? `${ui.player.caseProgress}: ${step.stageIndex + 1} / ${step.stageCount}` : null;

  return (
    <AppShell meta={`${ui.weekCard.week} ${week.week}`}>
      <div className={styles.playerTop}>
        <span>{caseProgress ?? `${ui.player.moduleProgress}`}</span>
        <span>
          {score.answered} / {score.totalQuestions}
        </span>
      </div>
      <div className={styles.playerBar}>
        <ProgressBar
          value={score.answered}
          max={score.totalQuestions}
          label={ui.player.moduleProgress}
        />
      </div>

      {step.kind === 'case_intro' ? (
        <CaseIntroduction case={step.case} onStart={goToNextStep} />
      ) : null}

      {step.kind === 'stage' ? (
        <StageView
          stage={step.stage}
          stageIndex={step.stageIndex}
          stageCount={step.stageCount}
          results={session.results}
          questionIndex={subIndex}
          onSubmit={submit}
          onContinue={advance}
        />
      ) : null}

      {step.kind === 'hype' ? (
        <MechanismOrHype
          statements={step.statements}
          results={session.results}
          index={subIndex}
          onSubmit={submit}
          onContinue={advance}
        />
      ) : null}

      {step.kind === 'therapy' ? (
        <TherapyBuilder
          builder={step.builder}
          results={session.results}
          answers={session.answers}
          index={subIndex}
          onSubmit={submit}
          onNext={advance}
          onFinish={goToNextStep}
        />
      ) : null}

      {step.kind === 'summary' ? (
        <WeekSummary week={week} score={score} onFinish={() => navigate('/dashboard')} />
      ) : null}

      {step.kind !== 'summary' ? (
        <div className={styles.actions}>
          <Button variant="ghost" small onClick={() => navigate(`/week/${week.id}`)}>
            {ui.player.exit}
          </Button>
        </div>
      ) : null}
    </AppShell>
  );
}
