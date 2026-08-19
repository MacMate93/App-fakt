import type { CourseProgress, ProgressStore } from '../types/progress';

const STORAGE_KEY = 'fptt.progress.v1';
export const SCHEMA_VERSION = 1;

/**
 * MVP persistence: the learner's identifier and scores never leave the device.
 * Swapping in a backend store means implementing the same interface.
 */
export class LocalProgressStore implements ProgressStore {
  async load(): Promise<CourseProgress | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CourseProgress;
      // A schema change invalidates old data rather than risking a broken render.
      if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  async save(progress: CourseProgress): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Quota or private mode: the session continues in memory.
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to do.
    }
  }
}

export const progressStore = new LocalProgressStore();
