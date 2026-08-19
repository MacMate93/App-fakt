import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CourseProgress, WeekProgress } from '../types/progress';
import { progressStore, SCHEMA_VERSION } from '../storage/LocalProgressStore';
import { useLocale } from './LocaleProvider';

interface ProgressContextValue {
  /** False until the persisted state has been read. */
  ready: boolean;
  progress: CourseProgress | null;
  signIn: (displayName: string) => void;
  signOut: () => void;
  reset: () => void;
  weekProgress: (weekId: string) => WeekProgress | undefined;
  saveWeekProgress: (weekProgress: WeekProgress) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function createId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void progressStore.load().then((loaded) => {
      if (cancelled) return;
      setProgress(loaded);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on every change; the store swallows storage failures.
  useEffect(() => {
    if (!ready || !progress) return;
    void progressStore.save(progress);
  }, [progress, ready]);

  const signIn = useCallback(
    (displayName: string) => {
      setProgress((current) => {
        if (current) {
          return { ...current, profile: { ...current.profile, displayName, locale } };
        }
        return {
          schemaVersion: SCHEMA_VERSION,
          profile: {
            id: createId(),
            displayName,
            locale,
            createdAt: new Date().toISOString(),
          },
          weeks: {},
        };
      });
    },
    [locale],
  );

  const signOut = useCallback(() => {
    setProgress(null);
    void progressStore.clear();
  }, []);

  const reset = useCallback(() => {
    setProgress((current) => (current ? { ...current, weeks: {} } : current));
  }, []);

  const weekProgress = useCallback(
    (weekId: string) => progress?.weeks[weekId],
    [progress],
  );

  const saveWeekProgress = useCallback((next: WeekProgress) => {
    setProgress((current) =>
      current ? { ...current, weeks: { ...current.weeks, [next.weekId]: next } } : current,
    );
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({ ready, progress, signIn, signOut, reset, weekProgress, saveWeekProgress }),
    [ready, progress, signIn, signOut, reset, weekProgress, saveWeekProgress],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used inside <ProgressProvider>.');
  return context;
}
