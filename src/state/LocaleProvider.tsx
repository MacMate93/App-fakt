import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { LOCALES, t, type LocalizedText, type Locale } from '../types/i18n';
import { dictionaryFor, type UiDictionary } from '../i18n';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** UI chrome strings. */
  ui: UiDictionary;
  /** Resolves a localized content string. */
  text: (value: LocalizedText) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = 'fptt.locale';

function initialLocale(): Locale {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored && (LOCALES as string[]).includes(stored)) return stored as Locale;
  const browser = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'en';
  return (LOCALES as string[]).includes(browser) ? (browser as Locale) : 'en';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
    } catch {
      // Storage may be unavailable (private mode); the choice still applies for this session.
    }
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      ui: dictionaryFor(locale),
      text: (value: LocalizedText) => t(value, locale),
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside <LocaleProvider>.');
  return context;
}
