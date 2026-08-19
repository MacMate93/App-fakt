import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LocaleProvider } from './state/LocaleProvider';
import { ProgressProvider } from './state/ProgressProvider';
import { LandingPage } from './routes/LandingPage';
import { CourseDashboardPage } from './routes/CourseDashboardPage';
import { WeekOverviewPage } from './routes/WeekOverviewPage';
import { WeekPlayerPage } from './routes/WeekPlayerPage';

/**
 * Five routes for the whole course: there is deliberately no per-week page.
 * HashRouter keeps deep links working on static hosting without server rewrites.
 */
export default function App() {
  return (
    <LocaleProvider>
      <ProgressProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<CourseDashboardPage />} />
            <Route path="/week/:weekId" element={<WeekOverviewPage />} />
            <Route path="/week/:weekId/play" element={<WeekPlayerPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ProgressProvider>
    </LocaleProvider>
  );
}
