# From Pathway to Therapy — architektúra és MVP-terv

> Interactive Cases in Medical and Veterinary Biochemistry
> Biokémiai innovációk az orvos- és állatorvostudományban

Ez a dokumentum a fejlesztés kiindulópontja: célértelmezés, technológiai stack,
könyvtárstruktúra, adatmodellek, a Week 3 tartalmi reprezentációja, UI flow és
MVP-hatókör. A kód ezt a dokumentumot követi; ha a kettő eltér, ezt kell frissíteni.

---

## 1. Célértelmezés

Az app **nem quiz és nem digitális tankönyv**, hanem *reasoning trainer*. Minden
feladat ugyanazt a transzlációs gondolkodási láncot járatja végig:

```
clinical / biological problem
  → molecular data
    → interpretation
      → mechanism
        → biomarker
          → intervention / therapeutic target
            → strength of evidence
```

Ebből három tervezési következmény adódik, amely minden további döntést meghatároz:

1. **Progresszív információadagolás.** Az eset nem egy képernyőn jelenik meg. A
   hallgató minden döntése után kap új adatot — mert a valós klinikai/kutatói
   gondolkodás is így halad. Ezért a `Stage` elsőrendű adatmodell-elem, nem csak
   UI-csoportosítás.
2. **A feedback tananyag, nem pontszám-indoklás.** Minden válaszhoz rövid *miért*
   tartozik, helyes válasz esetén is. Az elutasított opcióknak is lehet saját
   magyarázata (`Option.rationale`).
3. **Az evidenciaszint önálló, mérhető kompetencia.** A `mechanistic plausibility ≠
   therapeutic efficacy` üzenet nem szövegdoboz, hanem pontozott feladattípus
   (`evidence_rating`, `Mechanism or Hype?`), amely a kurzus minden hetében visszatér.

A tartalom és a motor szigorúan elválik: **új hét hozzáadása = egy új adatfájl**,
nulla UI-kód. Ez az architektúra legfontosabb, nem alkudható követelménye.

---

## 2. Technológiai stack

| Réteg | Választás | Indoklás |
|---|---|---|
| Build | **Vite** | Gyors, statikus buildet ad; nincs szükség SSR-re. |
| UI | **React 18 + TypeScript (strict)** | Kérés szerint; a diszkriminált unió típusok itt fizetnek ki igazán. |
| Routing | **react-router-dom** (HashRouter) | 4 route, deep-link a hetekre; a hash-routing szerveroldali rewrite nélkül működik statikus hostingon. |
| Állapot | **React Context + useReducer** | A session-állapot lokális és determinisztikus; Redux/Zustand felesleges. |
| Stílus | **CSS Modules + CSS custom property design tokenek** | Kis felület, zéró runtime, könnyű sötét/világos téma és tudományos, visszafogott arculat. |
| Grafikonok | **saját, vékony SVG chart réteg** | 5 egyszerű charttípus kell; egy chart-könyvtár (Recharts/Chart.js) többet hoz be, mint amennyit ad, és nehezebb egységes tudományos stílust tartani. |
| Tartalomvalidáció | **saját referenciális validátor** (`content/schema.ts`) | A heti adatfájlok dev módban és tesztben validálódnak. Zod helyett: a shape-et már a TypeScript garantálja, a valódi kockázat a *hivatkozási* hiba (`correctOptionId`, amely nem létező opcióra mutat) — azt egy séma-könyvtár sem fogja meg. |
| Teszt | **Vitest** | A pontozási logika és a tartalom-invariánsok tesztelése kötelező (determinisztikus scoring). |
| Perzisztencia | **localStorage egy `ProgressStore` interfész mögött** | MVP-ben nincs backend; a csere később egy implementáció kicserélése. |
| i18n | **saját, minimális megoldás** (`LocalizedText` + UI-szótár) | A tartalom többnyelvűsége adatmodell-kérdés, nem könyvtárkérdés; i18next később behúzható. |

**Miért nem Next.js:** az MVP-nek nincs szerveroldali igénye, viszont statikus
hostingra (GitHub Pages / Netlify) kell kerülnie. A Next.js SSR/routing rétege most
csak karbantartási költség. Ha később kell instructor-backend, az API külön
szolgáltatás lesz, vagy a projekt Next.js-re migrálható — a `storage/` és
`content/` réteg ezt már most nem akadályozza.

**Nincs AI-hívás a pontozásban.** A `engine/` réteg tiszta, determinisztikus,
hálózatfüggetlen TypeScript. AI-alapú funkciók (Socratic tutor, szabad szöveges
válasz értékelése) később egy opcionális `tutor/` modulként kapcsolódnak, a
pontszámhoz nem nyúlva.

---

## 3. Könyvtárstruktúra

```
app-fakt/
├─ index.html
├─ package.json / tsconfig.json / vite.config.ts
├─ docs/
│  └─ ARCHITECTURE.md
└─ src/
   ├─ main.tsx
   ├─ App.tsx                      # router + provider-ek
   │
   ├─ types/                       # tartalomfüggetlen típusdefiníciók
   │  ├─ content.ts                # Week, Case, Stage, Question, ChartSpec ...
   │  ├─ answers.ts                # AnswerValue, EvaluationResult
   │  ├─ progress.ts               # WeekProgress, CourseProgress
   │  └─ i18n.ts                   # Locale, LocalizedText
   │
   ├─ engine/                      # TISZTA LOGIKA, React nélkül, 100% tesztelt
   │  ├─ evaluate.ts               # kérdéstípusonkénti kiértékelés
   │  ├─ scoring.ts                # pontösszesítés kompetenciánként
   │  ├─ feedback.ts               # determinisztikus szöveges visszajelzés
   │  ├─ moduleFlow.ts             # Week -> lineáris lépéslista (a "nincs WeekXPage" kulcsa)
   │  └─ sessionReducer.ts         # a modul-lejátszás állapotgépe
   │
   ├─ content/                     # KIZÁRÓLAG ADAT
   │  ├─ index.ts                  # week-registry
   │  ├─ schema.ts                 # zod séma + validátor
   │  └─ weeks/
   │     ├─ week-03.ts             # MVP: teljes
   │     └─ week-01.ts ... week-07.ts
   │
   ├─ components/
   │  ├─ layout/                   # AppShell, Header, Card, Button, Badge, Callout
   │  ├─ course/                   # CourseDashboard, WeekCard, ProgressDashboard, CompetencyMeter
   │  ├─ case/                     # CasePlayer, CaseIntroduction, FindingsTable, StageView, StageProgress
   │  ├─ questions/                # QuestionRenderer + 8 típuskomponens
   │  ├─ modules/                  # MechanismOrHype, TherapyBuilder, EvidenceLadder, TranslationalPathway
   │  ├─ feedback/                 # FeedbackPanel, ScoreSummary, WeekSummary
   │  └─ charts/                   # ChartRenderer, BarChart, LineChart, ScatterPlot, Heatmap, PcaPlot, primitives/
   │
   ├─ routes/
   │  ├─ LandingPage.tsx
   │  ├─ CourseDashboardPage.tsx
   │  ├─ WeekOverviewPage.tsx
   │  ├─ WeekPlayerPage.tsx        # EGYETLEN player, minden hétre
   │  ├─ WeekSummaryPage.tsx
   │  └─ InstructorPage.tsx
   │
   ├─ state/                       # LocaleProvider, ProfileProvider, ProgressProvider
   ├─ storage/                     # ProgressStore interfész + LocalProgressStore
   ├─ i18n/                        # locale.ts, useTranslation.ts, ui/{en,hu}.ts
   └─ styles/                      # tokens.css, global.css
```

A `routes/` alatt **nincs** `Week1Page`, `Week3Page`. A `WeekPlayerPage` egy
`:weekId` paramétert kap, betölti az adatot a registry-ből, és a `moduleFlow`
által generált lépéslistát játssza le.

---

## 4. TypeScript adatmodellek

### 4.1 Lokalizáció

```ts
export type Locale = 'en' | 'hu' | 'de';

/** Minden hallgatónak megjelenő szöveg ilyen. Az `en` kötelező: ez a fallback. */
export interface LocalizedText {
  en: string;
  hu?: string;
  de?: string;
}

export const t = (text: LocalizedText, locale: Locale): string =>
  text[locale] ?? text.en;
```

Ez a döntés teszi lehetővé, hogy a magyar fordítás később *tartalmi commit*
legyen, ne refaktor.

### 4.2 Kompetenciák és pontkeret

```ts
export type Competency =
  | 'mechanism'    // molecular mechanism        30 pont
  | 'data'         // data interpretation        25 pont
  | 'therapy'      // intervention / therapy     20 pont
  | 'evidence'     // evidence evaluation        15 pont
  | 'critical';    // critical thinking          10 pont

export type PointsBudget = Record<Competency, number>;

export const DEFAULT_POINTS_BUDGET: PointsBudget = {
  mechanism: 30, data: 25, therapy: 20, evidence: 15, critical: 10,
};
```

A tartalomvalidátor **hibát dob**, ha egy hét kérdéseinek kompetenciánkénti
pontösszege nem egyezik a kerettel. Így a „100 pont / hét” garantált, nem
kézi könyvelés kérdése.

### 4.3 Evidencia-létra

```ts
export type EvidenceLevel = 1 | 2 | 3 | 4 | 5;
// 1 biochemical plausibility | 2 in vitro | 3 in vivo experimental
// 4 controlled clinical/veterinary | 5 repeated clinical / established
```

### 4.4 Kérdések (diszkriminált unió)

```ts
export interface QuestionBase {
  id: string;
  competency: Competency;
  points: number;
  prompt: LocalizedText;
  /** Opcionális ábra bármely kérdéstípushoz. */
  chart?: ChartSpec;
  /** Rövid, mindig megjelenő szakmai magyarázat a válasz után. */
  explanation?: LocalizedText;
  feedback: { correct: LocalizedText; incorrect: LocalizedText; partial?: LocalizedText };
}

export interface Option {
  id: string;
  text: LocalizedText;
  /** Opciószintű indoklás — miért jó vagy miért csábító, de hibás. */
  rationale?: LocalizedText;
  /** A Therapy Builder / Week summary folyamatábra csomópontcímkéje. */
  summaryLabel?: LocalizedText;
}

export type Question =
  | SingleChoiceQuestion | MultipleChoiceQuestion | TrueFalseQuestion
  | OrderingQuestion | ClassificationQuestion | DataInterpretationQuestion
  | EvidenceRatingQuestion | DecisionQuestion;

interface SingleChoiceQuestion extends QuestionBase {
  type: 'single_choice';
  options: Option[];
  correctOptionId: string;
}

interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple_choice';
  options: Option[];
  correctOptionIds: string[];
  /** 'partial' (alap): helyes találatok aránya mínusz a hibás jelölések, 0-ra vágva. */
  scoring?: 'partial' | 'all_or_nothing';
}

interface TrueFalseQuestion extends QuestionBase {
  type: 'true_false';
  statement: LocalizedText;
  correctAnswer: boolean;
}

interface OrderingQuestion extends QuestionBase {
  type: 'ordering';
  items: Option[];
  correctOrder: string[];          // item id-k helyes sorrendben
  /** Részpont a leghosszabb helyes relatív sorrendű részsorozat alapján. */
}

interface ClassificationQuestion extends QuestionBase {
  type: 'classification';
  categories: { id: string; label: LocalizedText; description?: LocalizedText }[];
  items: { id: string; text: LocalizedText; correctCategoryId: string; rationale?: LocalizedText }[];
}

interface DataInterpretationQuestion extends QuestionBase {
  type: 'data_interpretation';
  chart: ChartSpec;                // itt kötelező
  select: 'single' | 'multiple';
  options: Option[];
  correctOptionIds: string[];
}

interface EvidenceRatingQuestion extends QuestionBase {
  type: 'evidence_rating';
  claim: LocalizedText;
  scale: 'evidence_ladder' | 'clinical_strength';
  correctLevel: EvidenceLevel;
  /** ±1 szint részpontot ér: az evidenciaszint becslése nem bináris készség. */
  tolerance?: number;
}

interface DecisionQuestion extends QuestionBase {
  type: 'decision';
  scenario: LocalizedText;
  options: (Option & { quality: 'optimal' | 'acceptable' | 'poor' })[];
  /** acceptable = a pont 60%-a; a valós döntéseknek ritkán van egyetlen jó válaszuk. */
}
```

### 4.5 Válasz és kiértékelés

```ts
export type AnswerValue =
  | { kind: 'option';     optionId: string }
  | { kind: 'options';    optionIds: string[] }
  | { kind: 'boolean';    value: boolean }
  | { kind: 'order';      order: string[] }
  | { kind: 'assignment'; assignment: Record<string, string> }  // itemId -> categoryId
  | { kind: 'level';      level: number };

export interface EvaluationResult {
  questionId: string;
  competency: Competency;
  status: 'correct' | 'partial' | 'incorrect';
  awardedPoints: number;
  maxPoints: number;
  feedback: LocalizedText;
  explanation?: LocalizedText;
  /** Opciószintű jelölés a UI-nak: melyik volt jó, melyik hiányzott. */
  optionStates?: Record<string, 'correct' | 'missed' | 'wrong' | 'neutral'>;
}
```

Az `evaluate(question, answer): EvaluationResult` egyetlen tiszta függvény,
`switch` a `question.type`-on. Új kérdéstípus = egy `case` ág + egy komponens.

### 4.6 Eset, stage, hét

```ts
export interface Finding {
  label: LocalizedText;
  value?: string;                              // pl. "0.42 (ref 0.8–1.2)"
  direction: 'up' | 'down' | 'unchanged';
}

export interface Stage {
  id: string;
  title: LocalizedText;                        // "Interpret the molecular data"
  goal: LocalizedText;                         // egy mondat: mit kell most tenni
  /** Csak ezen a stage-en feltáruló új információ (progresszív adagolás). */
  brief?: LocalizedText;
  newFindings?: Finding[];
  chart?: ChartSpec;
  questions: Question[];
}

export interface Case {
  id: string;
  title: LocalizedText;
  species?: string;                            // "Broiler chicken"
  context: 'human' | 'veterinary' | 'comparative';
  introduction: LocalizedText;                 // max ~150 szó
  findings: Finding[];
  stages: Stage[];
}

export interface HypeStatement {
  id: string;
  statement: LocalizedText;
  verdict: 'supported' | 'partly_supported' | 'unsupported';
  points: number;                              // competency: mindig 'critical'
  explanation: LocalizedText;
}

export interface TherapyBuilderStep {
  id: string;
  kind: 'problem' | 'pathway' | 'intervention' | 'biomarker' | 'experiment' | 'evidence';
  question: Question;                          // újrahasznált kérdésmotor
}

export interface TherapyBuilder {
  id: string;
  title: LocalizedText;
  problem: LocalizedText;
  findings?: Finding[];
  steps: TherapyBuilderStep[];
}

export interface Week {
  id: string;                                  // "week-3"
  week: number;
  title: LocalizedText;
  subtitle: LocalizedText;
  estimatedMinutes: number;
  available: boolean;                          // false -> "Locked" a dashboardon
  learningObjectives: LocalizedText[];
  cases: Case[];
  mechanismOrHype: HypeStatement[];
  therapyBuilder?: TherapyBuilder;
  takeHomeMessages: LocalizedText[];
  /** A záró "Your translational pathway" ábra csomópontjai. */
  summaryPathway: LocalizedText[];
  pointsBudget: PointsBudget;
}
```

### 4.7 Grafikonok

```ts
export type ChartSpec =
  | { kind: 'bar';     title?: LocalizedText; yLabel?: LocalizedText; groups: string[];
      series: { name: LocalizedText; values: number[]; error?: number[] }[];
      annotations?: ChartAnnotation[]; caption?: LocalizedText }
  | { kind: 'line';    title?: LocalizedText; xLabel?: LocalizedText; yLabel?: LocalizedText;
      x: number[]; series: { name: LocalizedText; values: number[] }[] }
  | { kind: 'scatter'; xLabel?: LocalizedText; yLabel?: LocalizedText;
      points: { x: number; y: number; group?: string; label?: string }[] }
  | { kind: 'heatmap'; rows: string[]; cols: string[]; values: number[][]; scale?: 'diverging' | 'sequential' }
  | { kind: 'pca';     xLabel?: LocalizedText; yLabel?: LocalizedText;
      points: { x: number; y: number; group: string }[]; variance?: [number, number] };
```

A `ChartRenderer` diszkriminált unió alapján választ komponenst; minden chart
`viewBox`-alapú, reszponzív SVG, közös tengely/skála primitívekkel.

### 4.8 Haladás

```ts
export type WeekStatus = 'not_started' | 'in_progress' | 'completed' | 'locked';

export interface WeekProgress {
  weekId: string;
  status: WeekStatus;
  stepIndex: number;                                 // hol tart a lejátszásban
  results: Record<string, EvaluationResult>;         // questionId -> eredmény
  totalScore: number;
  scoreByCompetency: Record<Competency, { earned: number; max: number }>;
  startedAt?: string;
  completedAt?: string;
}

export interface StudentProfile {
  id: string;                 // generált UUID
  displayName: string;        // a hallgató által megadott név vagy Neptun-kód
  locale: Locale;
}

export interface CourseProgress {
  schemaVersion: number;
  profile: StudentProfile;
  weeks: Record<string, WeekProgress>;
}

export interface ProgressStore {                     // storage/ProgressStore.ts
  load(): Promise<CourseProgress | null>;
  save(progress: CourseProgress): Promise<void>;
  clear(): Promise<void>;
}
```

Csak név/azonosító + eredmény tárolódik — se születési dátum, se elérhetőség.
A `ProgressStore` interfész miatt a későbbi backend (és a GDPR-kompatibilis
törlés/export) egyetlen implementáció kérdése.

---

## 5. A Week 3 tartalom reprezentációja

Egyetlen adatfájl, `src/content/weeks/week-03.ts`, típusos objektum (nem JSON:
a TypeScript fordítási idejű ellenőrzést és IDE-támogatást ad a tartalomírónak).

```ts
import type { Week } from '../../types/content';
import { DEFAULT_POINTS_BUDGET } from '../../types/content';

export const week03: Week = {
  id: 'week-3',
  week: 3,
  title: { en: 'Bioactive compounds and nutraceuticals',
           hu: 'Bioaktív vegyületek és nutraceutikumok' },
  subtitle: { en: 'From molecular effects to therapeutic potential',
              hu: 'A molekuláris hatásoktól a terápiás lehetőségekig' },
  estimatedMinutes: 15,
  available: true,
  pointsBudget: DEFAULT_POINTS_BUDGET,

  learningObjectives: [
    { en: 'Interpret redox and inflammatory biomarker patterns in a stressed animal.' },
    { en: 'Link a nutritional intervention to a defined molecular pathway.' },
    { en: 'Distinguish mechanistic plausibility from demonstrated therapeutic efficacy.' },
  ],

  cases: [{
    id: 'heat-stressed-broiler',
    title: { en: 'Heat-stressed broiler flock' },
    species: 'Broiler chicken',
    context: 'veterinary',
    introduction: {
      en: 'A commercial broiler flock is exposed to ambient temperatures above 34 °C ' +
          'for five consecutive days. Production and blood parameters are recorded.',
    },
    findings: [
      { label: { en: 'Feed intake' },        direction: 'down' },
      { label: { en: 'Plasma GSH/GSSG' },    value: '0.42 (ref 0.9–1.3)', direction: 'down' },
      { label: { en: 'Plasma MDA' },         direction: 'up' },
      { label: { en: 'Plasma IL-6' },        direction: 'up' },
      { label: { en: 'Tissue HSP70' },       direction: 'up' },
    ],

    stages: [
      // Stage 1 — Identify the problem            (mechanism, single_choice)
      // Stage 2 — Interpret the molecular data    (data, data_interpretation + true_false)
      // Stage 3 — Identify the pathway            (mechanism, multiple_choice + classification)
      // Stage 4 — Select an intervention          (therapy, decision)
      // Stage 5 — Select biomarkers               (data/therapy, multiple_choice)
      // Stage 6 — Design the experiment           (therapy, ordering)
      // Stage 7 — Assess the evidence             (evidence, evidence_rating)
      {
        id: 'stage-2',
        title: { en: 'Interpret the molecular data' },
        goal:  { en: 'Decide what the redox measurements tell you — and what they do not.' },
        brief: { en: 'Blood was sampled from control and heat-exposed birds on day 5.' },
        chart: {
          kind: 'bar',
          yLabel: { en: 'Relative value (control = 1.0)' },
          groups: ['GSH/GSSG', 'MDA', 'IL-6', 'HSP70'],
          series: [
            { name: { en: 'Thermoneutral' }, values: [1.0, 1.0, 1.0, 1.0], error: [0.08, 0.10, 0.12, 0.11] },
            { name: { en: 'Heat-stressed' }, values: [0.42, 2.1, 2.8, 3.4], error: [0.06, 0.18, 0.30, 0.35] },
          ],
        },
        questions: [{
          id: 'w3-c1-s2-q1',
          type: 'single_choice',
          competency: 'data',
          points: 8,
          prompt: { en: 'What does the decreased GSH/GSSG ratio most directly indicate?' },
          options: [
            { id: 'a', text: { en: 'Reduced total glutathione synthesis only' },
              rationale: { en: 'The ratio reports redox balance, not synthesis capacity; total GSH may be unchanged.' } },
            { id: 'b', text: { en: 'A shift of the cellular thiol pool towards the oxidised state' },
              rationale: { en: 'Correct: the ratio is a redox-state readout, consistent with the raised MDA.' },
              summaryLabel: { en: 'Redox dysregulation' } },
            { id: 'c', text: { en: 'Direct heat-induced protein denaturation' } },
            { id: 'd', text: { en: 'Bacterial infection of the flock' } },
          ],
          correctOptionId: 'b',
          explanation: {
            en: 'GSH/GSSG is a ratio, so it reflects the oxidation state of the thiol pool rather than ' +
                'the amount of glutathione present. Together with elevated MDA it indicates ongoing ' +
                'oxidative stress, but it does not by itself identify the cellular source of the oxidants.',
          },
          feedback: {
            correct:   { en: 'Correct — and note that the ratio does not localise the oxidant source.' },
            incorrect: { en: 'Re-read the parameter: it is a ratio of reduced to oxidised glutathione.' },
          },
        }],
      },
      // ... a további stage-ek ugyanezzel a struktúrával
    ],
  }],

  mechanismOrHype: [
    { id: 'w3-h1', points: 2, verdict: 'unsupported',
      statement: { en: 'Natural compounds are generally safer than synthetic drugs.' },
      explanation: { en: 'Origin does not determine toxicity. Dose, purity, interactions and ' +
                         'exposure duration determine safety; several potent toxins are natural products.' } },
    { id: 'w3-h2', points: 2, verdict: 'supported',
      statement: { en: 'An antioxidant effect demonstrated in vitro does not automatically predict clinical efficacy.' },
      explanation: { en: 'Cell-culture concentrations are frequently unreachable in vivo, and disease ' +
                         'outcome depends on more than a single redox parameter.' } },
    { id: 'w3-h3', points: 2, verdict: 'supported',
      statement: { en: 'Bioavailability can limit the in vivo effects of a compound with strong activity in cell culture.' },
      explanation: { en: 'Curcumin is the classic example: poor absorption, rapid glucuronidation and ' +
                         'sulfation keep free plasma concentrations far below in vitro active levels.' } },
    { id: 'w3-h4', points: 2, verdict: 'unsupported',
      statement: { en: 'Reduction of an oxidative stress biomarker proves that a treatment improves clinical outcome.' },
      explanation: { en: 'This is the biomarker-versus-endpoint error. A marker must be validated as a ' +
                         'surrogate before its change can stand for clinical benefit.' } },
    { id: 'w3-h5', points: 2, verdict: 'supported',
      statement: { en: 'Some compounds described as antioxidants may act partly by activating endogenous stress-response pathways.' },
      explanation: { en: 'Indirect, hormetic action via Nrf2–Keap1 rather than direct radical scavenging ' +
                         'explains much of the in vivo activity of several polyphenols.' } },
  ],

  therapyBuilder: { /* 6 lépés: problem → pathway → intervention → biomarker → experiment → evidence */ },

  summaryPathway: [
    { en: 'Stress phenotype' }, { en: 'Redox dysregulation' },
    { en: 'Nrf2 / inflammatory signalling' }, { en: 'Candidate intervention' },
    { en: 'Biomarker panel' }, { en: 'Experimental validation' }, { en: 'Evidence assessment' },
  ],

  takeHomeMessages: [
    { en: 'Mechanistic plausibility is a hypothesis, not evidence of efficacy.' },
    { en: 'Bioavailability decides whether an in vitro effect can occur in a living animal.' },
    { en: 'A biomarker change is not a clinical outcome until it is validated as a surrogate.' },
  ],
};
```

A tartalom hangvétele szándékosan **nem** sugallja, hogy egy adott étrend-kiegészítő
hatásos: minden intervenciós lépés hipotézisként fogalmaz, és evidenciaértékeléssel zárul.

---

## 6. Fő UI flow

```
Landing  ──►  Course dashboard  ──►  Week overview  ──►  Week player  ──►  Week summary
(név/ID)      (7 kártya +           (célok, ~15 perc,   (lépésről         (pontszám,
              kompetenciák)          Start)              lépésre)          feedback, pathway)
                    ▲                                                            │
                    └────────────────────────────────────────────────────────────┘
```

**A Week player a rendszer magja.** A `buildModuleFlow(week)` a heti adatból egy
lineáris lépéslistát generál:

```
[ case_intro ] → [ stage 1 ] → … → [ stage n ] → [ hype 1..5 ] → [ therapy step 1..6 ] → [ summary ]
```

Egy lépés = egy képernyő. Minden képernyőn: felül `Case progress: 3 / 7`, középen
egyetlen fókuszált kérdés vagy kérdéscsoport, alatta a `Submit`. Válasz után a
`FeedbackPanel` nyílik ki — 2–4 mondat, a helyes megoldás megjelölésével — majd
`Continue`. **Nincs visszaléptetés és javítás**: a pontozás determinisztikus és
egyszeri, ahogy a klinikai döntés is.

A `Week summary` képernyő tartalma:
- `Total score: 86 / 100` + kompetenciánkénti bontás sávdiagramon,
- *Strong areas* / *Review recommended* listák (küszöbalapú, determinisztikus),
- **Your translational pathway** — függőleges folyamatábra, amelyben a hallgató
  saját választásai szerepelnek csomópontcímkeként (`Option.summaryLabel`),
- take-home messages.

Az `Evidence Ladder` a kurzus vizuális állandója: megjelenik minden
`evidence_rating` kérdésnél interaktív skálaként, a záró összegzésben pedig
statikus referenciaként.

**Dizájn:** két semleges felület (háttér/kártya), egy hideg kék akcentus,
státuszszínek (helyes/részleges/hibás) kizárólag a feedbackben. Betűtípus:
rendszer sans-serif, adatokhoz tabular numerals. Animáció csak a feedback
megjelenésénél (150 ms). Mobilon egyoszlopos, 44 px-es érintőcélpontok.

---

## 7. MVP-hatókör és fejlesztési sorrend

**Az MVP kimenete: a Week 3 végigjátszható, pontozott, visszajelzést adó modul,
backend nélkül futó statikus appban.**

| Fázis | Tartalom | Állapot |
|---|---|---|
| 1 | Projekt-scaffold, design tokenek, AppShell, Landing, Course dashboard, WeekCard | MVP |
| 2 | `types/content.ts` + zod séma + week registry | MVP |
| 3 | Question engine: `evaluate.ts` + `QuestionRenderer` + 8 kérdéskomponens | MVP |
| 4 | Chart réteg (bar, line, scatter, heatmap, PCA) | MVP (bar + line elég a Week 3-hoz) |
| 5 | `CasePlayer` + `moduleFlow` + `sessionReducer` + Week 3 esettartalom | MVP |
| 6 | `MechanismOrHype` (5 állítás) | MVP |
| 7 | `TherapyBuilder` (6 lépés) + `EvidenceLadder` | MVP |
| 8 | Scoring + `FeedbackPanel` + `ScoreSummary` + `WeekSummary` + `TranslationalPathway` | MVP |
| 9 | `ProgressDashboard` + localStorage perzisztencia | MVP |
| 10 | Instructor dashboard prototípus (aggregált statisztika) | MVP után |
| 11 | Tartalom magyar fordítása, Week 1–2 és 4–7 tartalom | Későbbi |

Az 1–9. fázis **elkészült**. A `docs/`-on kívüli forrás a `src/` alatt található;
`npm run dev` fejlesztéshez, `npm test` a pontozási és tartalmi invariánsokra,
`npm run build` statikus buildhez.

Az 1–9. fázis lefedi a kérés 22. pontjában felsorolt mind a 15 MVP-elemet.

**Nem kerül bele az MVP-be:** authentikáció, backend, kurzuskód, több kurzus,
AI-tutor, eredményexport szerveroldalon. Az adatmodell és a `ProgressStore`
interfész mindegyiket előkészíti.
