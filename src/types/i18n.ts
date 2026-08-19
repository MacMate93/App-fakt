/** Supported interface and content languages. `en` is the required fallback. */
export type Locale = 'en' | 'hu' | 'de';

export const LOCALES: Locale[] = ['en', 'hu'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  hu: 'Magyar',
  de: 'Deutsch',
};

/**
 * Every learner-facing string in the content layer uses this shape.
 * `en` is mandatory, so a missing translation degrades to English
 * instead of rendering an empty node.
 */
export interface LocalizedText {
  en: string;
  hu?: string;
  de?: string;
}

/** Resolve a localized string, falling back to English. */
export function t(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.en;
}

/** Convenience for content authoring: an English-only string. */
export function en(value: string): LocalizedText {
  return { en: value };
}
