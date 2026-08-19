import { DEFAULT_POINTS_BUDGET, type Week } from '../../types/content';
import { en } from '../../types/i18n';

/**
 * Week 3 — the MVP proof-of-concept module.
 *
 * Content only: no component in this file, no logic. Adding a new week means
 * writing another file like this one and registering it in `content/index.ts`.
 *
 * Points: mechanism 30 · data 25 · therapy 20 · evidence 15 · critical 10.
 * The budget is enforced at load time by `validatePointsBudget`.
 */
export const week03: Week = {
  id: 'week-3',
  week: 3,
  title: {
    en: 'Bioactive compounds and nutraceuticals',
    hu: 'Bioaktív vegyületek és nutraceutikumok',
  },
  subtitle: {
    en: 'From molecular effects to therapeutic potential',
    hu: 'A molekuláris hatásoktól a terápiás lehetőségekig',
  },
  estimatedMinutes: 15,
  available: true,
  pointsBudget: DEFAULT_POINTS_BUDGET,

  learningObjectives: [
    en('Interpret redox and inflammatory biomarker patterns in a stressed animal.'),
    en('Link a candidate nutritional intervention to a defined molecular pathway.'),
    en('Separate a measurable biomarker from a mechanism and from a therapeutic target.'),
    en('Distinguish mechanistic plausibility from demonstrated therapeutic efficacy.'),
  ],

  cases: [
    {
      id: 'heat-stressed-broiler',
      title: en('Heat-stressed broiler flock'),
      species: 'Broiler chicken',
      context: 'veterinary',
      introduction: en(
        'A commercial broiler flock is exposed to ambient temperatures above 34 °C for five ' +
          'consecutive days. Housing, stocking density and diet are unchanged. Birds are alert ' +
          'and there is no diarrhoea, no respiratory disease and no rise in mortality. ' +
          'Production data and blood samples are collected on day 5 and compared with a ' +
          'thermoneutral house on the same farm.',
      ),
      findings: [
        { label: en('Feed intake'), direction: 'down' },
        { label: en('Plasma GSH/GSSG ratio'), value: '0.42 (ref 0.9–1.3)', direction: 'down' },
        { label: en('Plasma MDA'), direction: 'up' },
        { label: en('Plasma IL-6'), direction: 'up' },
        { label: en('Tissue HSP70'), direction: 'up' },
      ],

      stages: [
        /* ---------------- Stage 1 — Identify the problem ---------------- */
        {
          id: 'stage-1',
          title: en('Identify the problem'),
          goal: en('Decide what kind of biological process this pattern describes.'),
          questions: [
            {
              id: 'w3-c1-s1-q1',
              type: 'single_choice',
              competency: 'mechanism',
              points: 6,
              prompt: en('Which biological process appears to be most strongly affected?'),
              options: [
                {
                  id: 'a',
                  text: en('Intestinal infection with secondary malabsorption'),
                  rationale: en(
                    'There is no diarrhoea, no mortality rise and no enteric signs; IL-6 alone ' +
                      'does not identify an infectious cause.',
                  ),
                },
                {
                  id: 'b',
                  text: en(
                    'A systemic stress response combining redox imbalance, proteotoxic stress and inflammatory signalling',
                  ),
                  rationale: en(
                    'Correct: a fallen GSH/GSSG ratio with raised MDA, IL-6 and HSP70 is the ' +
                      'signature of a coordinated stress response, not of one isolated lesion.',
                  ),
                  summaryLabel: en('Stress phenotype'),
                },
                {
                  id: 'c',
                  text: en('Primary mitochondrial DNA damage'),
                  rationale: en('Nothing in the data set reports on mtDNA integrity.'),
                },
                {
                  id: 'd',
                  text: en('An isolated dietary vitamin E deficiency'),
                  rationale: en('The diet is unchanged and the thermoneutral house is unaffected.'),
                },
              ],
              correctOptionId: 'b',
              explanation: en(
                'Reduced feed intake is the phenotype; the molecular data describe the response ' +
                  'behind it. HSP70 reports proteotoxic stress, the GSH/GSSG shift and MDA report ' +
                  'redox imbalance and lipid peroxidation, IL-6 reports inflammatory signalling. ' +
                  'Reading them together — rather than one by one — is the first step of the chain.',
              ),
              feedback: {
                correct: en('Correct. The three readouts belong to one integrated stress response.'),
                incorrect: en(
                  'Look at the markers as a set rather than individually: which single process ' +
                    'could produce all of them at once?',
                ),
              },
            },
          ],
        },

        /* -------------- Stage 2 — Interpret the molecular data -------------- */
        {
          id: 'stage-2',
          title: en('Interpret the molecular data'),
          goal: en('Decide what the redox measurements tell you — and what they do not.'),
          brief: en(
            'Blood was sampled from ten birds per house on day 5. Values are expressed relative ' +
              'to the thermoneutral group (mean ± SD).',
          ),
          questions: [
            {
              id: 'w3-c1-s2-q1',
              type: 'data_interpretation',
              competency: 'data',
              points: 8,
              select: 'single',
              prompt: en('What does the decreased GSH/GSSG ratio most directly indicate?'),
              chart: {
                kind: 'bar',
                title: en('Day 5 blood parameters, relative to thermoneutral controls'),
                yLabel: en('Relative value (control = 1.0)'),
                groups: ['GSH/GSSG', 'MDA', 'IL-6', 'HSP70'],
                reference: 1,
                series: [
                  {
                    name: en('Thermoneutral'),
                    values: [1.0, 1.0, 1.0, 1.0],
                    error: [0.08, 0.1, 0.12, 0.11],
                  },
                  {
                    name: en('Heat-stressed'),
                    values: [0.42, 2.1, 2.8, 3.4],
                    error: [0.06, 0.18, 0.3, 0.35],
                  },
                ],
                caption: en('n = 10 birds per group, day 5 of exposure.'),
              },
              options: [
                {
                  id: 'a',
                  text: en('Reduced total glutathione synthesis'),
                  rationale: en(
                    'A ratio cannot report an absolute amount: total glutathione may be unchanged, ' +
                      'raised or lowered.',
                  ),
                },
                {
                  id: 'b',
                  text: en('A shift of the cellular thiol pool towards the oxidised state'),
                  rationale: en(
                    'Correct: the ratio is a redox-state readout, and the raised MDA is consistent with it.',
                  ),
                  summaryLabel: en('Redox dysregulation'),
                },
                {
                  id: 'c',
                  text: en('Direct heat-induced denaturation of plasma proteins'),
                  rationale: en('HSP70 induction reports proteotoxic stress; GSH/GSSG does not.'),
                },
                {
                  id: 'd',
                  text: en('Ongoing bacterial infection'),
                  rationale: en('No clinical or haematological evidence supports this.'),
                },
              ],
              correctOptionIds: ['b'],
              explanation: en(
                'GSH/GSSG is a ratio of reduced to oxidised glutathione, so it describes the ' +
                  'oxidation state of the thiol pool rather than how much glutathione is present. ' +
                  'It signals ongoing oxidative stress, but it does not localise the oxidant source.',
              ),
              feedback: {
                correct: en(
                  'Correct — and note that the ratio still does not tell you where the oxidants come from.',
                ),
                incorrect: en(
                  'The parameter is a ratio. Ask what a ratio can and cannot report about a pool of molecules.',
                ),
              },
            },
            {
              id: 'w3-c1-s2-q2',
              type: 'true_false',
              competency: 'data',
              points: 4,
              prompt: en('Evaluate the following statement.'),
              statement: en(
                'The elevated plasma MDA concentration identifies the subcellular source of the reactive oxygen species.',
              ),
              correctAnswer: false,
              explanation: en(
                'MDA is an end product of polyunsaturated fatty acid peroxidation. It shows that ' +
                  'lipid peroxidation occurred, not which compartment generated the oxidants — ' +
                  'mitochondria, NADPH oxidases and xanthine oxidase would all raise it.',
              ),
              feedback: {
                correct: en('Correct. MDA reports a consequence, not a source.'),
                incorrect: en(
                  'MDA is a downstream product of lipid peroxidation, so several different oxidant ' +
                    'sources produce the same signal.',
                ),
              },
            },
          ],
        },

        /* ---------------- Stage 3 — Identify the pathway ---------------- */
        {
          id: 'stage-3',
          title: en('Identify the pathway'),
          goal: en('Map the observed changes onto regulatory pathways — and sort what you have found.'),
          questions: [
            {
              id: 'w3-c1-s3-q1',
              type: 'multiple_choice',
              competency: 'mechanism',
              points: 8,
              prompt: en(
                'Which regulatory pathways are plausibly engaged by this pattern? Select all that apply.',
              ),
              options: [
                {
                  id: 'nrf2',
                  text: en('Nrf2–Keap1 antioxidant response'),
                  rationale: en(
                    'Oxidative modification of Keap1 cysteines releases Nrf2 and induces glutathione ' +
                      'synthesis and NQO1/HO-1.',
                  ),
                  summaryLabel: en('Nrf2–Keap1'),
                },
                {
                  id: 'nfkb',
                  text: en('NF-κB–driven inflammatory transcription'),
                  rationale: en('Consistent with the raised IL-6.'),
                },
                {
                  id: 'hsf1',
                  text: en('HSF1-driven heat shock response'),
                  rationale: en('HSP70 induction is its canonical readout.'),
                },
                {
                  id: 'wnt',
                  text: en('Wnt/β-catenin developmental signalling'),
                  rationale: en('Nothing in the data set points to this pathway.'),
                },
                {
                  id: 'notch',
                  text: en('Notch-mediated lateral inhibition'),
                  rationale: en('Not plausibly involved in an acute thermal stress response.'),
                },
              ],
              correctOptionIds: ['nrf2', 'nfkb', 'hsf1'],
              explanation: en(
                'Redox, proteostatic and inflammatory branches run in parallel and cross-talk: ' +
                  'Nrf2 activity restrains NF-κB signalling, which is why a redox-directed ' +
                  'intervention can plausibly affect an inflammatory readout.',
              ),
              feedback: {
                correct: en('Correct — all three stress branches are engaged simultaneously.'),
                partial: en(
                  'Partly right. Each measured marker is the canonical readout of one specific pathway.',
                ),
                incorrect: en(
                  'Work backwards from each marker: GSH/GSSG → redox, HSP70 → proteostasis, IL-6 → inflammation.',
                ),
              },
            },
            {
              id: 'w3-c1-s3-q2',
              type: 'classification',
              competency: 'mechanism',
              points: 8,
              prompt: en('Sort each item into the category that describes its role.'),
              categories: [
                {
                  id: 'biomarker',
                  label: en('Biomarker'),
                  description: en('A measurable quantity that reports on state.'),
                },
                {
                  id: 'mechanism',
                  label: en('Mechanism'),
                  description: en('A molecular process that explains the observed changes.'),
                },
                {
                  id: 'target',
                  label: en('Therapeutic target'),
                  description: en('A point you could deliberately modulate to change the outcome.'),
                },
              ],
              items: [
                {
                  id: 'i1',
                  text: en('Plasma MDA concentration'),
                  correctCategoryId: 'biomarker',
                  rationale: en('A measurement, not a process you can act on.'),
                },
                {
                  id: 'i2',
                  text: en('Circulating IL-6 concentration'),
                  correctCategoryId: 'biomarker',
                  rationale: en('Reports inflammatory activity; it is not itself the mechanism.'),
                },
                {
                  id: 'i3',
                  text: en('Oxidation of the cellular glutathione pool'),
                  correctCategoryId: 'mechanism',
                  rationale: en('The process that the GSH/GSSG ratio measures.'),
                },
                {
                  id: 'i4',
                  text: en('Keap1-dependent degradation of Nrf2 under basal conditions'),
                  correctCategoryId: 'mechanism',
                  rationale: en('Describes how the pathway is normally kept off.'),
                },
                {
                  id: 'i5',
                  text: en('Activation of Nrf2 by a dietary electrophile'),
                  correctCategoryId: 'target',
                  rationale: en('An intervention point, phrased as something you would do.'),
                },
                {
                  id: 'i6',
                  text: en('Pharmacological support of HSF1-driven chaperone induction'),
                  correctCategoryId: 'target',
                  rationale: en('Also an intervention point rather than an observation.'),
                },
              ],
              explanation: en(
                'The same molecule can appear in more than one category in different sentences. ' +
                  'What decides the category is the role it plays: measured, explanatory, or ' +
                  'deliberately modulated. Treating every biomarker as a target is one of the ' +
                  'commonest errors in translational reasoning.',
              ),
              feedback: {
                correct: en('Correct. Role, not molecule, decides the category.'),
                partial: en(
                  'Partly right. Re-read the wording of each item: is it measured, explanatory, or acted upon?',
                ),
                incorrect: en(
                  'Ask of each item: could I measure it, does it explain the change, or would I modulate it?',
                ),
              },
            },
          ],
        },

        /* --------------- Stage 4 — Select an intervention --------------- */
        {
          id: 'stage-4',
          title: en('Select an intervention'),
          goal: en('Choose what you would take into a controlled trial first.'),
          brief: en(
            'The producer asks for a recommendation before the next heat period and is willing ' +
              'to run one controlled trial.',
          ),
          questions: [
            {
              id: 'w3-c1-s4-q1',
              type: 'decision',
              competency: 'therapy',
              points: 8,
              prompt: en('Which intervention would you investigate?'),
              options: [
                {
                  id: 'a',
                  quality: 'optimal',
                  text: en(
                    'Reduce the thermal load first (ventilation, stocking density), then evaluate a defined nutritional intervention on top of it',
                  ),
                  rationale: en(
                    'Removing the cause outperforms compensating for it, and it gives the ' +
                      'supplement a fair test against a controlled baseline.',
                  ),
                  summaryLabel: en('Thermal load reduction + defined supplement'),
                },
                {
                  id: 'b',
                  quality: 'acceptable',
                  text: en(
                    'Test a standardised Nrf2-activating dietary compound at a documented bioavailable dose against untreated heat-stressed controls',
                  ),
                  rationale: en(
                    'Mechanistically defensible and testable, but it leaves the primary cause of ' +
                      'the stress in place.',
                  ),
                  summaryLabel: en('Nrf2-activating supplement'),
                },
                {
                  id: 'c',
                  quality: 'poor',
                  text: en('Give high-dose vitamin C, because antioxidants counteract oxidative stress'),
                  rationale: en(
                    'This is the "antioxidant therefore beneficial" shortcut. High-dose antioxidants ' +
                      'can also blunt adaptive redox signalling.',
                  ),
                },
                {
                  id: 'd',
                  quality: 'poor',
                  text: en('Start a broad-spectrum antibiotic, since IL-6 is elevated'),
                  rationale: en(
                    'IL-6 rises in sterile stress as well. Treating a marker as if it proved ' +
                      'infection is a causal error — and an antimicrobial stewardship problem.',
                  ),
                },
              ],
              explanation: en(
                'A mechanistically plausible supplement is a hypothesis to be tested, not a ' +
                  'treatment to be assumed. Where the stressor itself can be reduced, that ' +
                  'intervention has both the larger effect size and the stronger evidence base.',
              ),
              feedback: {
                correct: en('Correct. Address the cause first, then test the addition properly.'),
                partial: en(
                  'A defensible research question, but the primary stressor is still acting on the birds.',
                ),
                incorrect: en(
                  'Re-read the data: nothing indicates infection, and "antioxidant" is a mechanism, not an indication.',
                ),
              },
            },
          ],
        },

        /* ---------------- Stage 5 — Select biomarkers ---------------- */
        {
          id: 'stage-5',
          title: en('Select biomarkers'),
          goal: en('Choose the measurements that could actually demonstrate an effect.'),
          questions: [
            {
              id: 'w3-c1-s5-q1',
              type: 'multiple_choice',
              competency: 'data',
              points: 8,
              prompt: en(
                'Which measurements would best demonstrate whether the intervention worked? Select all that apply.',
              ),
              options: [
                {
                  id: 'a',
                  text: en('Plasma GSH/GSSG ratio'),
                  rationale: en('Directly reports the redox parameter the intervention targets.'),
                  summaryLabel: en('GSH/GSSG'),
                },
                {
                  id: 'b',
                  text: en('Plasma MDA'),
                  rationale: en('Reports whether lipid peroxidation actually decreased.'),
                  summaryLabel: en('MDA'),
                },
                {
                  id: 'c',
                  text: en('Plasma IL-6'),
                  rationale: en('Tests whether the redox change translates into less inflammatory signalling.'),
                  summaryLabel: en('IL-6'),
                },
                {
                  id: 'd',
                  text: en('Feed conversion ratio, weight gain and mortality'),
                  rationale: en(
                    'The outcome that actually matters. Without it you only know that a marker moved.',
                  ),
                  summaryLabel: en('Production outcome'),
                },
                {
                  id: 'e',
                  text: en('Total antioxidant capacity (TAC) alone'),
                  rationale: en(
                    'In birds plasma TAC is dominated by uric acid, so it is a poor and easily ' +
                      'misread stand-alone endpoint.',
                  ),
                },
                {
                  id: 'f',
                  text: en('Ambient temperature inside the house'),
                  rationale: en(
                    'This is the exposure variable. It must be recorded and controlled, but it ' +
                      'cannot show that the intervention worked.',
                  ),
                },
              ],
              correctOptionIds: ['a', 'b', 'c', 'd'],
              explanation: en(
                'A defensible biomarker panel pairs mechanism-proximal markers with an outcome ' +
                  'the producer or clinician cares about. Marker improvement without an outcome ' +
                  'measure cannot support a therapeutic claim.',
              ),
              feedback: {
                correct: en('Correct — mechanism-proximal markers plus a real outcome.'),
                partial: en(
                  'Partly right. Check both ends: is the mechanism covered, and is there a clinical or production outcome?',
                ),
                incorrect: en(
                  'Ask of each option: does it report the mechanism, the outcome, or merely the exposure?',
                ),
              },
            },
          ],
        },

        /* ---------------- Stage 6 — Design the experiment ---------------- */
        {
          id: 'stage-6',
          title: en('Design the experiment'),
          goal: en('Put the steps of a controlled trial into a defensible order.'),
          questions: [
            {
              id: 'w3-c1-s6-q1',
              type: 'ordering',
              competency: 'therapy',
              points: 6,
              prompt: en('Arrange the steps of the controlled trial in the correct order.'),
              items: [
                { id: 's1', text: en('Define the primary outcome and calculate the required sample size') },
                {
                  id: 's2',
                  text: en(
                    'Randomise birds to thermoneutral control, heat-stressed control and heat-stressed + intervention groups',
                  ),
                },
                { id: 's3', text: en('Apply the intervention at a defined, bioavailable dose') },
                { id: 's4', text: en('Collect blood and production data at pre-specified time points') },
                {
                  id: 's5',
                  text: en('Analyse the pre-specified primary outcome before exploring secondary markers'),
                },
              ],
              correctOrder: ['s1', 's2', 's3', 's4', 's5'],
              explanation: en(
                'Defining the primary outcome first is what separates a trial from a fishing ' +
                  'expedition. If the outcome is chosen after seeing the data, any of a dozen ' +
                  'markers will eventually look significant.',
              ),
              feedback: {
                correct: en('Correct. The primary outcome is fixed before any data are seen.'),
                partial: en(
                  'Close. Check where outcome definition and randomisation sit relative to the intervention.',
                ),
                incorrect: en(
                  'Start from the question the trial must answer, not from the sampling schedule.',
                ),
              },
            },
          ],
        },

        /* ---------------- Stage 7 — Assess the evidence ---------------- */
        {
          id: 'stage-7',
          title: en('Assess the evidence'),
          goal: en('Place the reported result on the evidence ladder.'),
          brief: en(
            'You find a published study on the compound you selected and have to judge how far ' +
              'it takes the argument.',
          ),
          questions: [
            {
              id: 'w3-c1-s7-q1',
              type: 'evidence_rating',
              competency: 'evidence',
              points: 8,
              prompt: en('Where does this finding sit on the evidence ladder?'),
              claim: en(
                'A single randomised, controlled trial in 480 broilers reports that dietary ' +
                  'supplementation with the compound raised the plasma GSH/GSSG ratio and ' +
                  'improved feed conversion ratio under heat stress.',
              ),
              correctLevel: 4,
              tolerance: 1,
              explanation: en(
                'A randomised, controlled trial in the target species with a production outcome ' +
                  'is level 4. It is not level 5: that requires repeated, independent confirmation ' +
                  'and established practical application. One good trial makes a claim credible, ' +
                  'not established.',
              ),
              feedback: {
                correct: en('Correct. Controlled evidence in the target species, awaiting replication.'),
                partial: en(
                  'One rung off. Consider what a single trial can and cannot establish on its own.',
                ),
                incorrect: en(
                  'The study is randomised, controlled and in the target species — well above ' +
                    'mechanistic or in vitro evidence, but short of established application.',
                ),
              },
            },
          ],
        },
      ],
    },
  ],

  /* ------------------------ Mechanism or Hype? ------------------------ */
  mechanismOrHype: [
    {
      id: 'w3-hype-1',
      points: 2,
      verdict: 'unsupported',
      statement: en('Natural compounds are generally safer than synthetic drugs.'),
      explanation: en(
        'Origin does not determine toxicity. Dose, purity, interactions and duration of exposure ' +
          'do — and several of the most potent toxins known are natural products. Plant extracts ' +
          'are also chemically variable between batches, which synthetic compounds are not.',
      ),
    },
    {
      id: 'w3-hype-2',
      points: 2,
      verdict: 'supported',
      statement: en(
        'An antioxidant effect demonstrated in vitro does not automatically predict clinical efficacy.',
      ),
      explanation: en(
        'Cell-culture experiments often use concentrations that cannot be reached in plasma, and ' +
          'clinical outcome depends on far more than a single redox parameter.',
      ),
    },
    {
      id: 'w3-hype-3',
      points: 2,
      verdict: 'supported',
      statement: en(
        'Bioavailability can limit the in vivo effects of a compound that shows strong activity in cell culture.',
      ),
      explanation: en(
        'Curcumin is the standard example: poor absorption together with rapid glucuronidation and ' +
          'sulfation keeps free plasma concentrations far below the levels active in vitro.',
      ),
    },
    {
      id: 'w3-hype-4',
      points: 2,
      verdict: 'unsupported',
      statement: en(
        'Reduction of an oxidative stress biomarker proves that a treatment improves clinical outcome.',
      ),
      explanation: en(
        'This is the biomarker-versus-endpoint error. A marker has to be validated as a surrogate ' +
          'before its movement can stand in for clinical benefit — and several antioxidant trials ' +
          'have improved markers without improving outcomes.',
      ),
    },
    {
      id: 'w3-hype-5',
      points: 2,
      verdict: 'supported',
      statement: en(
        'Some compounds described as antioxidants may act partly by activating endogenous stress-response pathways.',
      ),
      explanation: en(
        'Indirect, hormetic action through Nrf2–Keap1 rather than direct radical scavenging explains ' +
          'much of the in vivo activity of several polyphenols: the compound behaves as a mild ' +
          'electrophilic stressor and the cell mounts its own antioxidant response.',
      ),
    },
  ],

  /* -------------------------- Therapy Builder -------------------------- */
  therapyBuilder: {
    id: 'w3-therapy',
    title: en('Build the intervention'),
    problem: en(
      'A production animal under chronic environmental stress shows a reduced GSH/GSSG ratio, ' +
        'increased lipid peroxidation and elevated inflammatory markers. Build a defensible ' +
        'intervention from the molecular problem to the strength of the evidence.',
    ),
    findings: [
      { label: en('GSH/GSSG ratio'), direction: 'down' },
      { label: en('Lipid peroxidation (MDA)'), direction: 'up' },
      { label: en('Inflammatory markers (IL-6)'), direction: 'up' },
    ],
    steps: [
      {
        id: 'tb-1',
        kind: 'problem',
        question: {
          id: 'w3-tb-q1',
          type: 'single_choice',
          competency: 'mechanism',
          points: 4,
          prompt: en('What is the principal molecular problem?'),
          options: [
            {
              id: 'a',
              text: en('An oxidative shift of the cellular redox state with secondary inflammatory signalling'),
              summaryLabel: en('Redox dysregulation'),
              rationale: en('Correct: the redox change is primary, the inflammatory change follows it.'),
            },
            {
              id: 'b',
              text: en('A primary defect of inflammatory resolution'),
              rationale: en('Possible in principle, but the redox markers changed first and most.'),
            },
            {
              id: 'c',
              text: en('Insufficient dietary protein supply'),
              rationale: en('Nothing in the presentation points to a specific nutrient deficiency.'),
            },
          ],
          correctOptionId: 'a',
          explanation: en(
            'Naming the problem at the right level matters: "oxidative stress" is a state, not a ' +
              'diagnosis, and the therapeutic question is which node maintains that state.',
          ),
          feedback: {
            correct: en('Correct. Redox first, inflammation downstream.'),
            incorrect: en('Which change is primary and which one follows from it?'),
          },
        },
      },
      {
        id: 'tb-2',
        kind: 'pathway',
        question: {
          id: 'w3-tb-q2',
          type: 'single_choice',
          competency: 'mechanism',
          points: 4,
          prompt: en('Which regulatory node is the most plausible target?'),
          options: [
            {
              id: 'a',
              text: en('Nrf2–Keap1, the master regulator of the endogenous antioxidant response'),
              summaryLabel: en('Nrf2–Keap1'),
              rationale: en(
                'Correct: it controls glutathione synthesis and phase II enzymes, and it restrains NF-κB.',
              ),
            },
            {
              id: 'b',
              text: en('Direct chemical scavenging of radicals by a dietary antioxidant'),
              rationale: en(
                'Stoichiometric scavenging rarely reaches effective concentrations in vivo; it is ' +
                  'a mechanism, not a regulatory node.',
              ),
            },
            {
              id: 'c',
              text: en('mTORC1-driven protein synthesis'),
              rationale: en('Not the primary regulator of the redox state described here.'),
            },
          ],
          correctOptionId: 'a',
          explanation: en(
            'Targeting the regulator of the response is usually more effective than supplying the ' +
              'end product, because the cell then produces its own antioxidants in the right ' +
              'compartments and amounts.',
          ),
          feedback: {
            correct: en('Correct. Modulating the regulator beats supplying the effector.'),
            incorrect: en('Which of these actually controls the transcription of antioxidant genes?'),
          },
        },
      },
      {
        id: 'tb-3',
        kind: 'intervention',
        question: {
          id: 'w3-tb-q3',
          type: 'decision',
          competency: 'therapy',
          points: 3,
          prompt: en('Which intervention is mechanistically justifiable?'),
          options: [
            {
              id: 'a',
              quality: 'optimal',
              text: en(
                'A standardised Nrf2-activating compound at a dose with documented plasma exposure in the target species',
              ),
              summaryLabel: en('Standardised Nrf2 activator, documented exposure'),
              rationale: en('Links the target to a dose that can actually reach it.'),
            },
            {
              id: 'b',
              quality: 'acceptable',
              text: en('An unstandardised plant extract with in vitro Nrf2 activity'),
              summaryLabel: en('Plant extract with in vitro activity'),
              rationale: en(
                'The mechanism is plausible, but batch variability and unknown exposure make the ' +
                  'result hard to interpret either way.',
              ),
            },
            {
              id: 'c',
              quality: 'poor',
              text: en('A high-dose antioxidant vitamin combination given indefinitely'),
              rationale: en(
                'Sustained high-dose antioxidants can suppress the adaptive redox signalling you ' +
                  'are trying to support.',
              ),
            },
          ],
          explanation: en(
            'An intervention is only as good as its exposure data: without knowing what reaches ' +
              'the tissue, a negative result cannot distinguish a wrong target from a wrong dose.',
          ),
          feedback: {
            correct: en('Correct. Defined compound, defined dose, documented exposure.'),
            partial: en('Plausible, but you will not be able to interpret the outcome cleanly.'),
            incorrect: en('More antioxidant is not the same as better redox regulation.'),
          },
        },
      },
      {
        id: 'tb-4',
        kind: 'biomarker',
        question: {
          id: 'w3-tb-q4',
          type: 'multiple_choice',
          competency: 'data',
          points: 5,
          prompt: en('Which biomarkers would you measure? Select all that apply.'),
          options: [
            {
              id: 'a',
              text: en('GSH/GSSG ratio'),
              summaryLabel: en('GSH/GSSG'),
              rationale: en('Target-proximal: shows whether the redox state actually shifted.'),
            },
            {
              id: 'b',
              text: en('Nrf2 target gene expression (HO-1, NQO1, GCLC)'),
              summaryLabel: en('Nrf2 target genes'),
              rationale: en('Target engagement: shows the pathway you aimed at responded.'),
            },
            {
              id: 'c',
              text: en('A clinical or production outcome'),
              summaryLabel: en('Clinical outcome'),
              rationale: en('Without it, no therapeutic claim can be made.'),
            },
            {
              id: 'd',
              text: en('Plasma concentration of the administered compound'),
              summaryLabel: en('Compound exposure'),
              rationale: en('Distinguishes a failed target from a failed exposure.'),
            },
            {
              id: 'e',
              text: en('Body temperature of the animals'),
              rationale: en('Part of characterising the exposure, not a measure of drug effect.'),
            },
          ],
          correctOptionIds: ['a', 'b', 'c', 'd'],
          explanation: en(
            'A complete panel answers three separate questions: did the compound get there, did ' +
              'the pathway respond, and did the animal do better.',
          ),
          feedback: {
            correct: en('Correct — exposure, target engagement and outcome are all covered.'),
            partial: en('Partly right. Which of the three questions is your panel unable to answer?'),
            incorrect: en('Think in three layers: exposure, target engagement, outcome.'),
          },
        },
      },
      {
        id: 'tb-5',
        kind: 'experiment',
        summaryLabel: en('Randomised controlled trial in the target species'),
        question: {
          id: 'w3-tb-q5',
          type: 'ordering',
          competency: 'therapy',
          points: 3,
          prompt: en('Order the validation steps from the earliest to the latest.'),
          items: [
            { id: 'e1', text: en('Confirm target engagement in a cell model at achievable concentrations') },
            { id: 'e2', text: en('Establish plasma exposure and tolerability in the target species') },
            { id: 'e3', text: en('Run a randomised, controlled trial with a pre-specified outcome') },
            { id: 'e4', text: en('Replicate independently before recommending routine use') },
          ],
          correctOrder: ['e1', 'e2', 'e3', 'e4'],
          explanation: en(
            'Each step is only worth running if the previous one succeeded. Skipping the exposure ' +
              'step is the most common reason a mechanistically sound compound fails in vivo.',
          ),
          feedback: {
            correct: en('Correct. Exposure is established before efficacy is tested.'),
            partial: en('Close. Note where exposure and tolerability have to sit.'),
            incorrect: en('Ask at each step what the previous result licenses you to do next.'),
          },
        },
      },
      {
        id: 'tb-6',
        kind: 'evidence',
        question: {
          id: 'w3-tb-q6',
          type: 'evidence_rating',
          competency: 'evidence',
          points: 7,
          prompt: en('How strong is the evidence for the intervention you have built?'),
          claim: en(
            'The compound activates Nrf2 in cell culture, raises HO-1 expression in rodents, and ' +
              'has not yet been tested in a controlled trial in the target species.',
          ),
          correctLevel: 3,
          tolerance: 1,
          explanation: en(
            'In vivo experimental evidence in a non-target species is level 3. It supports the ' +
              'hypothesis and justifies a trial, but it does not support a recommendation for ' +
              'routine use. This is the point of the whole module: mechanistic plausibility is not ' +
              'therapeutic efficacy.',
          ),
          feedback: {
            correct: en('Correct. In vivo experimental evidence — enough to justify a trial, not a recommendation.'),
            partial: en('One rung off. What has actually been demonstrated in a living animal?'),
            incorrect: en(
              'Separate what was shown in cells, in rodents, and in the species you intend to treat.',
            ),
          },
        },
      },
    ],
  },

  summaryPathway: [
    en('Stress phenotype'),
    en('Redox dysregulation'),
    en('Nrf2 / inflammatory signalling'),
    en('Candidate intervention'),
    en('Biomarker panel'),
    en('Experimental validation'),
    en('Evidence assessment'),
  ],

  takeHomeMessages: [
    en('Mechanistic plausibility is a hypothesis, not evidence of therapeutic efficacy.'),
    en('Bioavailability decides whether an in vitro effect can happen in a living animal at all.'),
    en('A biomarker change is not a clinical outcome until it is validated as a surrogate.'),
    en('Where the stressor itself can be reduced, that intervention usually beats compensating for it.'),
  ],
};
