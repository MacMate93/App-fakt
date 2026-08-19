import { enUi, type UiDictionary } from './ui/en';
import { huUi } from './ui/hu';
import type { Locale } from '../types/i18n';

const DICTIONARIES: Partial<Record<Locale, UiDictionary>> = {
  en: enUi,
  hu: huUi,
};

export function dictionaryFor(locale: Locale): UiDictionary {
  return DICTIONARIES[locale] ?? enUi;
}

export type { UiDictionary };
