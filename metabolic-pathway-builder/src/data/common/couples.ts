/*
 * Co-substrate pairs shared by every pathway.
 *
 * Keeping them in one place means ATP, NADH and friends look and behave the
 * same in glycolysis, the citric acid cycle and beta oxidation, and that the
 * Energy / Cofactor challenges can offer the same familiar option set.
 */
import type { Couple } from '@/types/pathway';

export const ATP_TO_ADP: Couple = {
  id: 'atp-adp',
  role: 'energy',
  label: 'ATP → ADP',
  from: 'ATP',
  to: 'ADP',
  direction: 'consumes',
  atpEquivalents: -1,
  note: 'The γ-phosphate of ATP is transferred onto the substrate.',
};

export const ADP_TO_ATP: Couple = {
  id: 'adp-atp',
  role: 'energy',
  label: 'ADP → ATP',
  from: 'ADP',
  to: 'ATP',
  direction: 'produces',
  atpEquivalents: 1,
  note: 'Substrate-level phosphorylation: a high-energy phosphate on the substrate is handed to ADP.',
};

export const NAD_TO_NADH: Couple = {
  id: 'nad-nadh',
  role: 'redox',
  label: 'NAD⁺ → NADH + H⁺',
  from: 'NAD⁺',
  to: 'NADH + H⁺',
  direction: 'produces',
  yields: { nadh: 1 },
  note: 'NAD⁺ accepts a hydride ion; the substrate is oxidised.',
};

/* ---- Off-pathway options, used as distractors ---- */

export const NADH_TO_NAD: Couple = {
  id: 'nadh-nad',
  role: 'redox',
  label: 'NADH → NAD⁺',
  from: 'NADH',
  to: 'NAD⁺',
  direction: 'consumes',
  note: 'Reduction of a substrate — this is the direction used by lactate dehydrogenase, not by glycolysis proper.',
};

export const NADP_TO_NADPH: Couple = {
  id: 'nadp-nadph',
  role: 'redox',
  label: 'NADP⁺ → NADPH',
  from: 'NADP⁺',
  to: 'NADPH',
  direction: 'produces',
  note: 'NADPH is the currency of reductive biosynthesis, not of catabolic energy release.',
};

export const FAD_TO_FADH2: Couple = {
  id: 'fad-fadh2',
  role: 'redox',
  label: 'FAD → FADH₂',
  from: 'FAD',
  to: 'FADH₂',
  direction: 'produces',
  yields: { fadh2: 1 },
  note: 'FAD is the acceptor when a C–C single bond is oxidised to a double bond.',
};

export const ATP_TO_AMP: Couple = {
  id: 'atp-amp',
  role: 'energy',
  label: 'ATP → AMP + PPi',
  from: 'ATP',
  to: 'AMP + PPi',
  direction: 'consumes',
  atpEquivalents: -2,
  note: 'Cleavage to AMP costs two phosphoanhydride bonds — used for activation steps such as fatty acyl-CoA synthesis.',
};

export const GDP_TO_GTP: Couple = {
  id: 'gdp-gtp',
  role: 'energy',
  label: 'GDP → GTP',
  from: 'GDP',
  to: 'GTP',
  direction: 'produces',
  atpEquivalents: 1,
  note: 'The nucleotide of choice for the succinyl-CoA synthetase step of the citric acid cycle.',
};

/** "Nothing happens here" answers — deliberately correct for many steps. */
export const NO_ENERGY: Couple = {
  id: 'no-energy',
  role: 'energy',
  label: 'No ATP involved',
  from: '—',
  to: '—',
  direction: 'consumes',
  atpEquivalents: 0,
  virtual: true,
  note: 'Isomerisations, cleavages and dehydrations rearrange the molecule without touching the adenine nucleotide pool.',
};

export const NO_REDOX: Couple = {
  id: 'no-redox',
  role: 'redox',
  label: 'No redox cofactor',
  from: '—',
  to: '—',
  direction: 'consumes',
  virtual: true,
  note: 'No oxidation or reduction takes place in this step, so no electron carrier is needed.',
};

export const STANDARD_COUPLES: Couple[] = [
  ATP_TO_ADP,
  ADP_TO_ATP,
  NAD_TO_NADH,
  NADH_TO_NAD,
  NADP_TO_NADPH,
  FAD_TO_FADH2,
  ATP_TO_AMP,
  GDP_TO_GTP,
  NO_ENERGY,
  NO_REDOX,
];
