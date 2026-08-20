import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ProgressState, RunRecord } from '@/types/progress';
import { applyRun, localProgressStore } from '@/storage/localProgress';

interface ProgressContextValue {
  progress: ProgressState;
  recordRun: (run: RunRecord, bestStreak: number) => void;
  reset: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() => localProgressStore.load());

  const recordRun = useCallback((run: RunRecord, bestStreak: number) => {
    setProgress((current) => {
      const next = applyRun(current, run, bestStreak);
      localProgressStore.save(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    localProgressStore.clear();
    setProgress(localProgressStore.load());
  }, []);

  const value = useMemo(() => ({ progress, recordRun, reset }), [progress, recordRun, reset]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be used inside a ProgressProvider.');
  return value;
}
