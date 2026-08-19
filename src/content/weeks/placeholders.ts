import { DEFAULT_POINTS_BUDGET, type Week } from '../../types/content';
import type { LocalizedText } from '../../types/i18n';

/**
 * Weeks 1, 2 and 4–7 are registered but not yet authored. They appear on the
 * dashboard as locked cards; filling one in means replacing the entry with a
 * content file like `week-03.ts` — no UI change.
 */
function placeholder(week: number, title: LocalizedText, subtitle: LocalizedText): Week {
  return {
    id: `week-${week}`,
    week,
    title,
    subtitle,
    estimatedMinutes: 15,
    available: false,
    learningObjectives: [],
    cases: [],
    mechanismOrHype: [],
    takeHomeMessages: [],
    summaryPathway: [],
    pointsBudget: DEFAULT_POINTS_BUDGET,
  };
}

export const placeholderWeeks: Week[] = [
  placeholder(
    1,
    {
      en: 'From molecular mechanisms to targeted therapy',
      hu: 'A molekuláris mechanizmusoktól a célzott terápiáig',
    },
    {
      en: 'The new perspective of modern biochemistry',
      hu: 'A modern biokémia új szemlélete',
    },
  ),
  placeholder(
    2,
    {
      en: 'The microbiome as a therapeutic target',
      hu: 'A mikrobiom mint terápiás célpont',
    },
    {
      en: 'Metabolites and microbiome-based interventions',
      hu: 'Metabolitok és mikrobiom-alapú beavatkozások',
    },
  ),
  placeholder(
    4,
    {
      en: 'Cellular stress and redox homeostasis',
      hu: 'Sejtes stressz és redox-homeosztázis',
    },
    {
      en: 'Therapeutic targets in stress and disease',
      hu: 'Terápiás célpontok stressz és betegség során',
    },
  ),
  placeholder(
    5,
    { en: 'The biochemistry of ageing', hu: 'Az öregedés biokémiája' },
    {
      en: 'Longevity interventions and geroprotective strategies',
      hu: 'Longevity intervenciók és geroprotektív stratégiák',
    },
  ),
  placeholder(
    6,
    {
      en: 'Omics in diagnostics and precision medicine',
      hu: 'Omikák a diagnosztikában és precíziós medicinában',
    },
    {
      en: 'From biomarkers to personalised treatment',
      hu: 'Biomarkerektől a személyre szabott kezelésig',
    },
  ),
  placeholder(
    7,
    { en: 'Immunometabolism', hu: 'Immunometabolizmus' },
    {
      en: 'Targeting metabolism in inflammatory and infectious disease',
      hu: 'Az anyagcsere célzott befolyásolása gyulladásos és fertőző betegségekben',
    },
  ),
];
