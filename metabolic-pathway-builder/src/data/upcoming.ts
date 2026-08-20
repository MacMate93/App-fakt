/*
 * Placeholder entries for pathways that are planned but not yet authored.
 *
 * They render as locked cards on the home screen. Turning one of them into a
 * playable module means filling in metabolites, enzymes and reactions in a file
 * of its own — no component and no route has to change.
 */
import type { Pathway } from '@/types/pathway';

const soon = (
  id: string,
  name: string,
  subtitle: string,
  compartment: string,
  summary: string,
): Pathway => ({ id, name, subtitle, status: 'coming-soon', compartment, summary });

export const upcomingPathways: Pathway[] = [
  soon(
    'tca-cycle',
    'Citric Acid Cycle',
    'Acetyl-CoA → 2 CO₂ · Krebs cycle',
    'Mitochondrial matrix',
    'Eight steps, three NADH, one FADH₂ and one GTP per turn, with three regulated dehydrogenases.',
  ),
  soon(
    'beta-oxidation',
    'Beta Oxidation',
    'Fatty acyl-CoA → Acetyl-CoA',
    'Mitochondrial matrix',
    'The four-step spiral that shortens a fatty acid by two carbons per round.',
  ),
  soon(
    'ppp',
    'Pentose Phosphate Pathway',
    'Glucose-6-phosphate → NADPH + Ribose-5-phosphate',
    'Cytosol',
    'The oxidative and non-oxidative branches, and why G6PD deficiency matters.',
  ),
  soon(
    'gluconeogenesis',
    'Gluconeogenesis',
    'Pyruvate → Glucose',
    'Cytosol and mitochondrion',
    'Glycolysis run backwards, with four enzymes that bypass the three irreversible steps.',
  ),
  soon(
    'urea-cycle',
    'Urea Cycle',
    'NH₄⁺ + CO₂ → Urea',
    'Liver — mitochondrion and cytosol',
    'Five enzymes across two compartments, and the hyperammonaemias that follow when one fails.',
  ),
  soon(
    'glycogen',
    'Glycogen Metabolism',
    'Glycogenesis and glycogenolysis',
    'Cytosol',
    'Synthesis and breakdown under opposite hormonal control, plus the glycogen storage diseases.',
  ),
];
