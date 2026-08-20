import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ExplorePage } from '@/routes/ExplorePage';
import { HomePage } from '@/routes/HomePage';
import { PlayPage } from '@/routes/PlayPage';
import { ProgressProvider } from '@/state/ProgressProvider';

/**
 * Hash routing on purpose: the build has to run from a file:// path, from an
 * LMS subfolder and from GitHub Pages without any server-side rewrite rule.
 */
export default function App() {
  return (
    <ProgressProvider>
      <HashRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/play/:pathwayId" element={<PlayPage />} />
            <Route path="/explore/:pathwayId" element={<ExplorePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </HashRouter>
    </ProgressProvider>
  );
}
