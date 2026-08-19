import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { getWeek } from '../content';
import { computeWeekScore } from '../engine/scoring';
import { useLocale } from '../state/LocaleProvider';
import { useProgress } from '../state/ProgressProvider';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/layout/Button';
import { Card, CardHeader } from '../components/layout/Card';
import { Badge } from '../components/layout/Badge';
import { ScoreSummary } from '../components/feedback/ScoreSummary';
import styles from '../components/course/course.module.css';

/** What the module contains and how it is scored, before the learner starts. */
export function WeekOverviewPage() {
  const { weekId } = useParams();
  const week = getWeek(weekId);
  const { text, ui } = useLocale();
  const { ready, progress, saveWeekProgress } = useProgress();
  const navigate = useNavigate();

  if (!ready) return null;
  if (!progress) return <Navigate to="/" replace />;
  if (!week || !week.available) return <Navigate to="/dashboard" replace />;

  const weekProgress = progress.weeks[week.id];
  const started = Boolean(weekProgress && weekProgress.status !== 'not_started');
  const completed = weekProgress?.status === 'completed';

  const restart = () => {
    if (started && !window.confirm(ui.overview.restartConfirm)) return;
    saveWeekProgress({
      weekId: week.id,
      status: 'in_progress',
      stepIndex: 0,
      answers: {},
      results: {},
      totalScore: 0,
      maxScore: computeWeekScore(week, {}).max,
      scoreByCompetency: computeWeekScore(week, {}).byCompetency,
      startedAt: new Date().toISOString(),
    });
    navigate(`/week/${week.id}/play`);
  };

  return (
    <AppShell meta={`${ui.weekCard.week} ${week.week}`}>
      <header className={styles.pageHeader}>
        <span className={styles.weekLabel}>
          {ui.weekCard.week} {week.week}
        </span>
        <h1 className={styles.pageTitle}>{text(week.title)}</h1>
        <p className={styles.pageSubtitle}>{text(week.subtitle)}</p>
      </header>

      <div className={styles.overviewGrid}>
        <Card>
          <CardHeader
            title={ui.overview.objectives}
            hint={`${ui.overview.estimated}: ${week.estimatedMinutes} ${ui.common.minutes}`}
          />
          <ul className={styles.objectives}>
            {week.learningObjectives.map((objective, index) => (
              <li key={index}>{text(objective)}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title={ui.overview.structure} />
          <ul className={styles.structureList}>
            {week.cases.map((kase, index) => (
              <li key={kase.id} className={styles.structureItem}>
                <span className={styles.structureIndex}>{index + 1}.</span>
                <span>
                  {text(kase.title)} — {ui.overview.structureCase} ({kase.stages.length})
                </span>
              </li>
            ))}
            {week.mechanismOrHype.length > 0 ? (
              <li className={styles.structureItem}>
                <span className={styles.structureIndex}>{week.cases.length + 1}.</span>
                <span>
                  {ui.overview.structureHype} ({week.mechanismOrHype.length})
                </span>
              </li>
            ) : null}
            {week.therapyBuilder ? (
              <li className={styles.structureItem}>
                <span className={styles.structureIndex}>{week.cases.length + 2}.</span>
                <span>
                  {ui.overview.structureTherapy} ({week.therapyBuilder.steps.length})
                </span>
              </li>
            ) : null}
          </ul>
          <p className={styles.empty} style={{ marginTop: 'var(--space-4)' }}>
            <Badge>{ui.overview.scoring}</Badge> {ui.overview.scoringHint}
          </p>
        </Card>

        {completed && weekProgress ? (
          <Card>
            <CardHeader title={ui.summary.title} />
            <ScoreSummary score={computeWeekScore(week, weekProgress.results)} />
          </Card>
        ) : null}

        <div className={styles.overviewActions}>
          {started && !completed ? (
            <Button onClick={() => navigate(`/week/${week.id}/play`)}>{ui.overview.resume}</Button>
          ) : null}
          {!started ? <Button onClick={restart}>{ui.overview.start}</Button> : null}
          {started ? (
            <Button variant="secondary" onClick={restart}>
              {ui.overview.restart}
            </Button>
          ) : null}
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            {ui.summary.backToDashboard}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
