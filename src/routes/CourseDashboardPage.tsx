import { Navigate } from 'react-router-dom';
import { WEEKS, getWeek } from '../content';
import { computeWeekScore } from '../engine/scoring';
import { aggregateCompetencies } from '../engine/feedback';
import { useLocale } from '../state/LocaleProvider';
import { useProgress } from '../state/ProgressProvider';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/layout/Button';
import { WeekCard } from '../components/course/WeekCard';
import { ProgressDashboard } from '../components/course/ProgressDashboard';
import styles from '../components/course/course.module.css';

/** Course overview: every module, its status and the competency profile. */
export function CourseDashboardPage() {
  const { ui } = useLocale();
  const { ready, progress, reset, signOut } = useProgress();

  if (!ready) return null;
  if (!progress) return <Navigate to="/" replace />;

  // Competencies are aggregated from every week the learner has answered in.
  const scores = Object.values(progress.weeks)
    .map((weekProgress) => {
      const week = getWeek(weekProgress.weekId);
      return week ? computeWeekScore(week, weekProgress.results) : null;
    })
    .filter((score): score is NonNullable<typeof score> => score !== null && score.answered > 0);

  const percentages = aggregateCompetencies(scores);

  return (
    <AppShell meta={`${ui.dashboard.greeting} ${progress.profile.displayName}`}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{ui.dashboard.title}</h1>
        <p className={styles.pageSubtitle}>{ui.app.tagline}</p>
      </header>

      <div className={styles.layout}>
        <section>
          <div className={styles.grid}>
            {WEEKS.map((week) => (
              <WeekCard key={week.id} week={week} progress={progress.weeks[week.id]} />
            ))}
          </div>
        </section>

        <aside>
          <ProgressDashboard percentages={percentages} hasData={scores.length > 0} />
          <div className={styles.sidebarActions}>
            <Button
              variant="ghost"
              small
              onClick={() => {
                if (window.confirm(ui.dashboard.resetConfirm)) reset();
              }}
            >
              {ui.dashboard.reset}
            </Button>
            <Button variant="ghost" small onClick={signOut}>
              {ui.dashboard.signOut}
            </Button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
