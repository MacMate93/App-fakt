/*
 * Glycolysis — the Embden–Meyerhof–Parnas pathway, cytosol, ten steps.
 *
 * Standard textbook scheme (Lehninger, Stryer, Harper). Nothing here is
 * invented: where a detail is disputed or isoform-dependent it is either left
 * out or spelled out in the note. All downstream behaviour of the app — the
 * Explore view, every task mode, the hint ladder, the ATP/NADH balance sheet —
 * is derived from this object.
 */
import type { Pathway } from '@/types/pathway';
import {
  ADP_TO_ATP,
  ATP_TO_ADP,
  ATP_TO_AMP,
  FAD_TO_FADH2,
  GDP_TO_GTP,
  NADH_TO_NAD,
  NADP_TO_NADPH,
  NAD_TO_NADH,
  NO_ENERGY,
  NO_REDOX,
} from './common/couples';

export const glycolysis: Pathway = {
  id: 'glycolysis',
  name: 'Glycolysis',
  subtitle: 'Glucose → 2 Pyruvate · Embden–Meyerhof–Parnas pathway',
  status: 'available',
  compartment: 'Cytosol',
  input: 'Glucose (C6)',
  output: '2 × Pyruvate (C3)',
  summary:
    'Ten cytosolic steps that split one hexose into two molecules of pyruvate. ' +
    'The first five steps invest two ATP; the last five recover four ATP and two NADH. ' +
    'Three of the ten reactions are effectively irreversible and carry the regulation.',

  metabolites: [
    {
      id: 'glucose',
      name: 'Glucose',
      abbr: 'Glc',
      carbons: 6,
      phosphates: 0,
      note: 'Enters the cell through GLUT transporters. Until it is phosphorylated it can leave again just as easily.',
    },
    {
      id: 'g6p',
      name: 'Glucose-6-phosphate',
      abbr: 'G6P',
      carbons: 6,
      phosphates: 1,
      note: 'A branch point: it can continue in glycolysis, enter the pentose phosphate pathway, or be stored as glycogen.',
    },
    {
      id: 'f6p',
      name: 'Fructose-6-phosphate',
      abbr: 'F6P',
      carbons: 6,
      phosphates: 1,
      note: 'The ketose isomer. Moving the carbonyl to C-2 is what makes a symmetrical cleavage possible two steps later.',
    },
    {
      id: 'f16bp',
      name: 'Fructose-1,6-bisphosphate',
      abbr: 'F1,6BP',
      carbons: 6,
      phosphates: 2,
      note: 'The committed intermediate: once made, its only reasonable fate is to be split and run through the payoff phase.',
    },
    {
      id: 'dhap',
      name: 'Dihydroxyacetone phosphate',
      abbr: 'DHAP',
      carbons: 3,
      phosphates: 1,
      note: 'The ketose triose. It is also the link to glycerol-3-phosphate synthesis and to the glycerophosphate shuttle.',
    },
    {
      id: 'g3p',
      name: 'Glyceraldehyde-3-phosphate',
      abbr: 'G3P',
      carbons: 3,
      phosphates: 1,
      note: 'The aldose triose — the only one of the two that the next enzyme can use, which is why DHAP is isomerised into it.',
    },
    {
      id: 'bpg13',
      name: '1,3-Bisphosphoglycerate',
      abbr: '1,3-BPG',
      carbons: 3,
      phosphates: 2,
      note: 'An acyl phosphate with a very high phosphoryl-transfer potential — the energy captured from the oxidation step.',
    },
    {
      id: 'pg3',
      name: '3-Phosphoglycerate',
      abbr: '3-PG',
      carbons: 3,
      phosphates: 1,
      note: 'Also the precursor of serine, and from there of glycine and cysteine.',
    },
    {
      id: 'pg2',
      name: '2-Phosphoglycerate',
      abbr: '2-PG',
      carbons: 3,
      phosphates: 1,
      note: 'The phosphate has moved to C-2, which puts it next to the carbon that will lose water.',
    },
    {
      id: 'pep',
      name: 'Phosphoenolpyruvate',
      abbr: 'PEP',
      carbons: 3,
      phosphates: 1,
      note: 'The enol phosphate with the highest phosphoryl-transfer potential of any common metabolite.',
    },
    {
      id: 'pyruvate',
      name: 'Pyruvate',
      abbr: 'Pyr',
      carbons: 3,
      phosphates: 0,
      note: 'The end of glycolysis and a major crossroads: acetyl-CoA, lactate, alanine or oxaloacetate.',
    },
  ],

  enzymes: [
    {
      id: 'hexokinase',
      name: 'Hexokinase',
      abbr: 'HK',
      ec: '2.7.1.1',
      regulatory: true,
      alsoKnownAs: 'Hexokinase I–III in most tissues',
      role: 'Phosphorylates glucose at C-6 and thereby traps it inside the cell: the charged phosphate ester cannot travel back through a GLUT transporter.',
      activators: [],
      inhibitors: ['Glucose-6-phosphate (product inhibition)'],
      clinical:
        'Low Km (~0.1 mmol/l), so it is saturated at normal blood glucose — muscle and brain phosphorylate glucose even when supply is scarce.',
      confusedWith: ['glucokinase'],
    },
    {
      id: 'glucokinase',
      name: 'Glucokinase',
      abbr: 'GK',
      ec: '2.7.1.2',
      regulatory: true,
      alsoKnownAs: 'Hexokinase IV — hepatocytes and pancreatic β-cells',
      role: 'Does the same chemistry as hexokinase, but with a high Km (~10 mmol/l) and no product inhibition by glucose-6-phosphate.',
      activators: ['Insulin (increases gene transcription in the liver)'],
      inhibitors: ['Glucokinase regulatory protein (liver, promoted by fructose-6-phosphate)'],
      clinical:
        'Because its rate follows blood glucose, it acts as the glucose sensor of the β-cell. Inactivating GCK mutations cause MODY type 2.',
      confusedWith: ['hexokinase'],
    },
    {
      id: 'pgi',
      name: 'Phosphoglucose isomerase',
      abbr: 'PGI',
      ec: '5.3.1.9',
      alsoKnownAs: 'Glucose-6-phosphate isomerase',
      role: 'Converts the aldose glucose-6-phosphate into the ketose fructose-6-phosphate, moving the carbonyl group from C-1 to C-2.',
      clinical: 'Freely reversible — the same enzyme serves gluconeogenesis in the opposite direction.',
    },
    {
      id: 'pfk1',
      name: 'Phosphofructokinase-1',
      abbr: 'PFK-1',
      ec: '2.7.1.11',
      regulatory: true,
      role: 'The rate-limiting step and the main control point of glycolysis. Its product has only one sensible fate, so this is the committed step.',
      activators: ['AMP', 'ADP', 'Fructose-2,6-bisphosphate'],
      inhibitors: ['ATP (at high concentration)', 'Citrate', 'H⁺ (falling pH)'],
      clinical:
        'Deficiency of the muscle isoform (PFKM) causes Tarui disease, glycogen storage disease type VII, with exercise intolerance and cramping.',
      confusedWith: ['pfk2', 'fbpase1'],
    },
    {
      id: 'aldolase',
      name: 'Aldolase A',
      abbr: 'Aldolase',
      ec: '4.1.2.13',
      alsoKnownAs: 'Fructose-1,6-bisphosphate aldolase',
      role: 'Splits the six-carbon bisphosphate into two different three-carbon phosphates by a retro-aldol cleavage.',
      clinical:
        'The liver isoform aldolase B also handles fructose-1-phosphate; its deficiency causes hereditary fructose intolerance.',
    },
    {
      id: 'tpi',
      name: 'Triose phosphate isomerase',
      abbr: 'TPI',
      ec: '5.3.1.1',
      role: 'Isomerises DHAP into a second molecule of glyceraldehyde-3-phosphate, so that both halves of the original glucose continue through the payoff phase.',
      clinical:
        'One of the catalytically most efficient enzymes known — its rate is limited by how fast substrate diffuses in.',
    },
    {
      id: 'gapdh',
      name: 'Glyceraldehyde-3-phosphate dehydrogenase',
      abbr: 'GAPDH',
      ec: '1.2.1.12',
      role: 'Oxidises the aldehyde to a carboxylic acid and captures the energy released as an acyl phosphate, reducing NAD⁺ to NADH at the same time.',
      clinical:
        'Arsenate can replace inorganic phosphate here; the resulting acyl arsenate hydrolyses on its own, so glycolysis keeps running but the ATP of the next step is never made.',
    },
    {
      id: 'pgk',
      name: 'Phosphoglycerate kinase',
      abbr: 'PGK',
      ec: '2.7.2.3',
      role: 'The first substrate-level phosphorylation: hands the acyl phosphate of 1,3-BPG straight to ADP.',
      clinical: 'Reversible, and used in the same direction by gluconeogenesis.',
    },
    {
      id: 'pgam',
      name: 'Phosphoglycerate mutase',
      abbr: 'PGAM',
      ec: '5.4.2.11',
      role: 'Moves the phosphate from C-3 to C-2, which sets up the dehydration of the following step.',
      clinical:
        'The mammalian enzyme works through a phosphohistidine intermediate and needs catalytic amounts of 2,3-bisphosphoglycerate to stay primed.',
    },
    {
      id: 'enolase',
      name: 'Enolase',
      abbr: 'Enolase',
      ec: '4.2.1.11',
      role: 'Removes a molecule of water, creating the enol phosphate of phosphoenolpyruvate and redistributing the energy within the molecule.',
      clinical:
        'Inhibited by fluoride — the reason blood samples for glucose measurement are drawn into fluoride/oxalate tubes.',
    },
    {
      id: 'pk',
      name: 'Pyruvate kinase',
      abbr: 'PK',
      ec: '2.7.1.40',
      regulatory: true,
      role: 'The last and irreversible step: the second substrate-level phosphorylation, driven by the tautomerisation of enolpyruvate to pyruvate.',
      activators: ['Fructose-1,6-bisphosphate (feed-forward activation)'],
      inhibitors: [
        'ATP',
        'Alanine',
        'Phosphorylation by PKA (liver isoform, on the glucagon signal)',
      ],
      clinical:
        'Pyruvate kinase deficiency is the commonest glycolytic enzyme defect of the red cell and causes chronic haemolytic anaemia — the erythrocyte has no other way of making ATP.',
      confusedWith: ['pyruvate-carboxylase', 'pdh'],
    },
  ],

  couples: [ATP_TO_ADP, ADP_TO_ATP, NAD_TO_NADH, NO_ENERGY, NO_REDOX],

  reactions: [
    {
      id: 'r1',
      step: 1,
      substrates: ['glucose'],
      products: ['g6p'],
      enzymeId: 'hexokinase',
      acceptAlso: ['glucokinase'],
      coupleIds: ['atp-adp'],
      reversible: false,
      regulatory: true,
      reactionType: 'Phosphorylation',
      purpose: 'Traps glucose inside the cell and keeps the intracellular glucose concentration low, so more can flow in.',
      explanation:
        'Hexokinase (glucokinase in liver and β-cells) spends one ATP to phosphorylate C-6. The charged product cannot leave through the glucose transporter — this is glucose trapping, not yet a commitment to glycolysis.',
      factor: 1,
      hints: {
        generic: 'This reaction costs the cell energy rather than yielding any.',
        specific:
          'The enzyme is a kinase. Its job is to put a charge on glucose so the molecule can no longer escape the cell.',
      },
    },
    {
      id: 'r2',
      step: 2,
      substrates: ['g6p'],
      products: ['f6p'],
      enzymeId: 'pgi',
      coupleIds: [],
      reversible: true,
      reactionType: 'Aldose → ketose isomerisation',
      purpose: 'Moves the carbonyl group to C-2 so that the sugar can later be cleaved into two three-carbon units.',
      explanation:
        'An aldose becomes a ketose. No energy is spent and nothing is oxidised — the molecule is simply rearranged, and the reaction runs in either direction depending on concentrations.',
      factor: 1,
      hints: {
        generic: 'Nothing is gained or spent here; the atoms are only rearranged.',
        specific: 'An isomerase converts the six-carbon aldose into the corresponding ketose.',
      },
    },
    {
      id: 'r3',
      step: 3,
      substrates: ['f6p'],
      products: ['f16bp'],
      enzymeId: 'pfk1',
      coupleIds: ['atp-adp'],
      reversible: false,
      regulatory: true,
      reactionType: 'Phosphorylation',
      purpose: 'The committed step: after this, the molecule is destined for the payoff phase.',
      explanation:
        'Phosphofructokinase-1 spends the second ATP and catalyses the rate-limiting step of glycolysis. It is activated by AMP and fructose-2,6-bisphosphate and inhibited by ATP and citrate — that is, by signals of plenty.',
      factor: 1,
      hints: {
        generic: 'This reaction consumes ATP, and it is the step the cell regulates most tightly.',
        specific: 'The enzyme is the rate-limiting, committed step of glycolysis; citrate and ATP switch it off.',
        reveal: { enzyme: 'The enzyme is abbreviated PFK-1.' },
      },
    },
    {
      id: 'r4',
      step: 4,
      substrates: ['f16bp'],
      products: ['g3p', 'dhap'],
      enzymeId: 'aldolase',
      coupleIds: [],
      reversible: true,
      reactionType: 'Retro-aldol cleavage',
      purpose: 'Splits the hexose into two three-carbon phosphates — the point where one glucose becomes two.',
      explanation:
        'The six-carbon bisphosphate is cut in half, giving one aldose (G3P) and one ketose (DHAP). Each fragment carries one of the two phosphates added earlier, which is why both had to be invested.',
      factor: 1,
      hints: {
        generic: 'Here one molecule becomes two — no nucleotide is involved.',
        specific: 'A lyase cleaves the six-carbon bisphosphate into two different trioses.',
      },
    },
    {
      id: 'r5',
      step: 5,
      substrates: ['dhap'],
      products: ['g3p'],
      enzymeId: 'tpi',
      coupleIds: [],
      reversible: true,
      reactionType: 'Ketose → aldose isomerisation',
      purpose: 'Feeds the second three-carbon fragment into the payoff phase instead of letting it go to waste.',
      explanation:
        'Only glyceraldehyde-3-phosphate can be used by the next enzyme, so DHAP is isomerised into it. From here on every remaining step happens twice per molecule of glucose.',
      factor: 1,
      branch: true,
      hints: {
        generic: 'Without this step half of the carbon skeleton would sit in a dead end.',
        specific: 'An isomerase converts the ketose triose into the aldose triose.',
      },
    },
    {
      id: 'r6',
      step: 6,
      substrates: ['g3p'],
      products: ['bpg13'],
      enzymeId: 'gapdh',
      coupleIds: ['nad-nadh'],
      consumes: ['Pi'],
      reversible: true,
      reactionType: 'Oxidation and phosphorylation',
      purpose: 'The only oxidation of glycolysis: it captures energy both as NADH and as a high-energy phosphate bond.',
      explanation:
        'The aldehyde is oxidised to the level of a carboxylic acid, NAD⁺ takes up the hydride, and inorganic phosphate — not ATP — is attached to make the acyl phosphate 1,3-bisphosphoglycerate.',
      factor: 2,
      hints: {
        generic: 'Something is oxidised here, so an electron carrier has to be reduced.',
        specific:
          'A dehydrogenase oxidises the aldehyde and attaches inorganic phosphate; the phosphate does not come from ATP.',
      },
    },
    {
      id: 'r7',
      step: 7,
      substrates: ['bpg13'],
      products: ['pg3'],
      enzymeId: 'pgk',
      coupleIds: ['adp-atp'],
      reversible: true,
      reactionType: 'Substrate-level phosphorylation',
      purpose: 'Pays back the ATP invested at the start of the pathway.',
      explanation:
        'The acyl phosphate is transferred directly from the substrate to ADP. Because two trioses travel this route, this single step already returns the two ATP invested earlier.',
      factor: 2,
      hints: {
        generic: 'The cell gets energy back here.',
        specific:
          'A kinase transfers the high-energy phosphate of the substrate onto ADP — a substrate-level phosphorylation.',
      },
    },
    {
      id: 'r8',
      step: 8,
      substrates: ['pg3'],
      products: ['pg2'],
      enzymeId: 'pgam',
      coupleIds: [],
      reversible: true,
      reactionType: 'Intramolecular phosphate transfer',
      purpose: 'Positions the phosphate so that the following dehydration can create a high-energy compound.',
      explanation:
        'A mutase relocates the phosphate group from C-3 to C-2. Nothing is oxidised and no nucleotide is touched.',
      factor: 2,
      hints: {
        generic: 'The molecule keeps every atom it had; only a group moves.',
        specific: 'A mutase shifts the phosphate group from one carbon to its neighbour.',
      },
    },
    {
      id: 'r9',
      step: 9,
      substrates: ['pg2'],
      products: ['pep'],
      enzymeId: 'enolase',
      coupleIds: [],
      releases: ['H₂O'],
      reversible: true,
      reactionType: 'Dehydration',
      purpose: 'Redistributes the energy inside the molecule and creates the compound with the highest phosphoryl-transfer potential.',
      explanation:
        'Removing water produces an enol phosphate. The overall energy content hardly changes, but it is now concentrated in the phosphate bond — which is what makes the final step possible.',
      factor: 2,
      hints: {
        generic: 'A small molecule leaves the substrate; no cofactor is needed.',
        specific: 'The enzyme is a lyase that removes water and creates an enol phosphate.',
      },
    },
    {
      id: 'r10',
      step: 10,
      substrates: ['pep'],
      products: ['pyruvate'],
      enzymeId: 'pk',
      coupleIds: ['adp-atp'],
      reversible: false,
      regulatory: true,
      reactionType: 'Substrate-level phosphorylation',
      purpose: 'The second energy-yielding step and the final, irreversible commitment of the pathway.',
      explanation:
        'The phosphate is handed to ADP, and the enolpyruvate formed immediately tautomerises to pyruvate. That tautomerisation is what makes the step irreversible, and it is why gluconeogenesis needs a two-enzyme bypass.',
      factor: 2,
      hints: {
        generic: 'The cell gains energy here, and the step cannot run backwards.',
        specific:
          'This kinase catalyses the last step of glycolysis and is activated by fructose-1,6-bisphosphate coming down the pathway.',
      },
    },
  ],

  decoys: {
    metabolites: [
      { id: 'lactate', name: 'Lactate', abbr: 'Lac', carbons: 3, note: 'Made from pyruvate by lactate dehydrogenase — after glycolysis, not within it.' },
      { id: 'acetyl-coa', name: 'Acetyl-CoA', carbons: 2, note: 'The product of pyruvate dehydrogenase, already inside the mitochondrion.' },
      { id: 'oxaloacetate', name: 'Oxaloacetate', abbr: 'OAA', carbons: 4, note: 'Citric acid cycle intermediate; also the product of pyruvate carboxylase.' },
      { id: 'g1p', name: 'Glucose-1-phosphate', abbr: 'G1P', carbons: 6, note: 'The glycogen branch point, made by phosphoglucomutase.' },
      { id: 'r5p', name: 'Ribulose-5-phosphate', abbr: 'Ru5P', carbons: 5, note: 'Pentose phosphate pathway — the other fate of glucose-6-phosphate.' },
      { id: 'f26bp', name: 'Fructose-2,6-bisphosphate', abbr: 'F2,6BP', carbons: 6, note: 'A regulator of PFK-1, not an intermediate of the pathway.' },
      { id: 'bpg23', name: '2,3-Bisphosphoglycerate', abbr: '2,3-BPG', carbons: 3, note: 'A red-cell side branch that lowers haemoglobin oxygen affinity.' },
      { id: 'glycerol3p', name: 'Glycerol-3-phosphate', carbons: 3, note: 'Made from DHAP; the backbone for triacylglycerol synthesis.' },
    ],
    enzymes: [
      { id: 'pyruvate-carboxylase', name: 'Pyruvate carboxylase', abbr: 'PC', ec: '6.4.1.1', role: 'Carboxylates pyruvate to oxaloacetate in the mitochondrion — the first step of gluconeogenesis, not of glycolysis.' },
      { id: 'pepck', name: 'PEP carboxykinase', abbr: 'PEPCK', ec: '4.1.1.32', role: 'Converts oxaloacetate to phosphoenolpyruvate in gluconeogenesis, bypassing pyruvate kinase.' },
      { id: 'ldh', name: 'Lactate dehydrogenase', abbr: 'LDH', ec: '1.1.1.27', role: 'Reduces pyruvate to lactate and regenerates NAD⁺ when oxygen is short.' },
      { id: 'pdh', name: 'Pyruvate dehydrogenase complex', abbr: 'PDH', ec: '1.2.4.1', role: 'Oxidatively decarboxylates pyruvate to acetyl-CoA — the step after glycolysis.' },
      { id: 'g6pase', name: 'Glucose-6-phosphatase', abbr: 'G6Pase', ec: '3.1.3.9', role: 'Hydrolyses glucose-6-phosphate so the liver can release free glucose; the counterpart of hexokinase.' },
      { id: 'fbpase1', name: 'Fructose-1,6-bisphosphatase', abbr: 'FBPase-1', ec: '3.1.3.11', role: 'The gluconeogenic counterpart of PFK-1.' },
      { id: 'pfk2', name: 'Phosphofructokinase-2', abbr: 'PFK-2', ec: '2.7.1.105', role: 'Makes fructose-2,6-bisphosphate, the activator of PFK-1. A regulator, not a pathway enzyme.' },
      { id: 'g6pd', name: 'Glucose-6-phosphate dehydrogenase', abbr: 'G6PD', ec: '1.1.1.49', role: 'First and rate-limiting enzyme of the pentose phosphate pathway.' },
      { id: 'glycogen-phosphorylase', name: 'Glycogen phosphorylase', abbr: 'GP', ec: '2.4.1.1', role: 'Releases glucose-1-phosphate from glycogen.' },
    ],
    couples: [NADH_TO_NAD, NADP_TO_NADPH, FAD_TO_FADH2, ATP_TO_AMP, GDP_TO_GTP],
  },

  keyConcepts: [
    { id: 'investment', label: 'ATP investment phase', reactionIds: ['r1', 'r2', 'r3'] },
    { id: 'splitting', label: 'Splitting the six-carbon sugar', reactionIds: ['r4', 'r5'] },
    { id: 'nadh', label: 'NADH production', reactionIds: ['r6'] },
    { id: 'payoff', label: 'ATP payoff phase', reactionIds: ['r7', 'r8', 'r9', 'r10'] },
    { id: 'regulation', label: 'Regulatory, irreversible steps', reactionIds: ['r1', 'r3', 'r10'] },
  ],

  summaryQuiz: [
    {
      id: 'net-atp',
      question: 'What is the net ATP yield of glycolysis per molecule of glucose?',
      options: [
        { id: 'a', label: '0 ATP' },
        { id: 'b', label: '2 ATP' },
        { id: 'c', label: '4 ATP' },
        { id: 'd', label: '6 ATP' },
      ],
      answerId: 'b',
      explanation:
        'Two ATP are spent (hexokinase, PFK-1) and four are made (phosphoglycerate kinase and pyruvate kinase, each running twice): 4 − 2 = 2 ATP net.',
    },
    {
      id: 'nadh-yield',
      question: 'How much NADH is produced per molecule of glucose?',
      options: [
        { id: 'a', label: '1 NADH' },
        { id: 'b', label: '2 NADH' },
        { id: 'c', label: '3 NADH' },
        { id: 'd', label: '4 NADH' },
      ],
      answerId: 'b',
      explanation:
        'Only the GAPDH step reduces NAD⁺, but it runs twice per glucose — once for each triose phosphate. That gives 2 NADH.',
    },
    {
      id: 'rate-limiting',
      question: 'Which enzyme catalyses the rate-limiting, committed step?',
      options: [
        { id: 'a', label: 'Hexokinase' },
        { id: 'b', label: 'Phosphofructokinase-1' },
        { id: 'c', label: 'Phosphoglycerate kinase' },
        { id: 'd', label: 'Pyruvate kinase' },
      ],
      answerId: 'b',
      explanation:
        'Glucose-6-phosphate still has several possible fates, so hexokinase does not commit anything. Fructose-1,6-bisphosphate has essentially only one, which makes PFK-1 the committed and rate-limiting step.',
    },
    {
      id: 'oxygen',
      question: 'Which statement about glycolysis is correct?',
      options: [
        { id: 'a', label: 'It takes place in the mitochondrial matrix.' },
        { id: 'b', label: 'It runs in the cytosol and needs no oxygen.' },
        { id: 'c', label: 'It requires oxygen at the GAPDH step.' },
        { id: 'd', label: 'It takes place on the endoplasmic reticulum.' },
      ],
      answerId: 'b',
      explanation:
        'Every enzyme of the pathway is cytosolic and no step uses molecular oxygen. NAD⁺ does have to be regenerated, though — by the respiratory chain when oxygen is available, or by lactate dehydrogenase when it is not.',
    },
  ],

  references: [
    'Nelson & Cox, Lehninger Principles of Biochemistry — Glycolysis chapter',
    'Berg, Tymoczko & Stryer, Biochemistry — Glycolysis and Gluconeogenesis',
    'Rodwell et al., Harper’s Illustrated Biochemistry — Glycolysis and the oxidation of pyruvate',
  ],
};
