/*
 * The Explore side panel: click anything on the canvas and read what it does.
 * Every field is optional in the data model, so a thinly authored pathway
 * degrades to a shorter card rather than to empty headings.
 */
import type { ReactNode } from 'react';
import type { CanvasSelection } from '@/components/pathway/PathwayCanvas';
import { Badge } from '@/components/layout/Badge';
import { Card } from '@/components/layout/Card';
import { reactionEquation, type PathwayIndex } from '@/engine/pathwayModel';
import styles from '@/routes/routes.module.css';

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.detailBlock}>
      <span className={styles.detailLabel}>{label}</span>
      {children}
    </div>
  );
}

export function DetailPanel({
  index,
  selection,
}: {
  index: PathwayIndex;
  selection: CanvasSelection;
}) {
  if (!selection) {
    return (
      <Card>
        <h3 className={styles.detailTitle}>Explore the pathway</h3>
        <p className={styles.detailText} style={{ marginTop: 'var(--space-2)' }}>
          Tap any metabolite, enzyme or cofactor chip to see its reaction, its role and — for the
          regulated enzymes — what switches it on and off.
        </p>
      </Card>
    );
  }

  if (selection.kind === 'metabolite') {
    const metabolite = index.metabolites.get(selection.id);
    if (!metabolite) return null;
    const producedBy = index.pathway.reactions.find((r) => r.products.includes(metabolite.id));
    const usedBy = index.pathway.reactions.find((r) => r.substrates.includes(metabolite.id));
    return (
      <Card>
        <h3 className={styles.detailTitle}>{metabolite.name}</h3>
        <div className={styles.detailList} style={{ marginTop: 'var(--space-2)' }}>
          {metabolite.abbr ? <Badge tone="metabolite">{metabolite.abbr}</Badge> : null}
          {metabolite.carbons ? <Badge>C{metabolite.carbons}</Badge> : null}
          {metabolite.phosphates ? <Badge>{metabolite.phosphates} × Pi</Badge> : null}
        </div>
        {metabolite.note ? (
          <Block label="Why it matters">
            <p className={styles.detailText}>{metabolite.note}</p>
          </Block>
        ) : null}
        {producedBy ? (
          <Block label={`Formed in step ${producedBy.step}`}>
            <p className={styles.equation}>{reactionEquation(index, producedBy)}</p>
          </Block>
        ) : null}
        {usedBy ? (
          <Block label={`Used in step ${usedBy.step}`}>
            <p className={styles.equation}>{reactionEquation(index, usedBy)}</p>
          </Block>
        ) : null}
      </Card>
    );
  }

  if (selection.kind === 'enzyme') {
    const enzyme = index.enzymes.get(selection.id);
    if (!enzyme) return null;
    const reaction = index.pathway.reactions.find(
      (r) => r.enzymeId === enzyme.id || r.acceptAlso?.includes(enzyme.id),
    );
    return (
      <Card>
        <h3 className={styles.detailTitle}>{enzyme.name}</h3>
        <div className={styles.detailList} style={{ marginTop: 'var(--space-2)' }}>
          {enzyme.abbr && enzyme.abbr !== enzyme.name ? <Badge tone="enzyme">{enzyme.abbr}</Badge> : null}
          {enzyme.ec ? <Badge>EC {enzyme.ec}</Badge> : null}
          {enzyme.regulatory ? <Badge tone="regulatory">⚡ Key regulatory step</Badge> : null}
          {reaction ? (
            <Badge tone={reaction.reversible ? 'neutral' : 'regulatory'}>
              {reaction.reversible ? 'Reversible' : 'Irreversible'}
            </Badge>
          ) : null}
        </div>
        {enzyme.alsoKnownAs ? (
          <Block label="Also known as">
            <p className={styles.detailText}>{enzyme.alsoKnownAs}</p>
          </Block>
        ) : null}
        {reaction ? (
          <Block label="Reaction">
            <p className={styles.equation}>{reactionEquation(index, reaction)}</p>
          </Block>
        ) : null}
        {enzyme.role ? (
          <Block label="Role">
            <p className={styles.detailText}>{enzyme.role}</p>
          </Block>
        ) : null}
        {enzyme.activators?.length ? (
          <Block label="Activated by">
            <div className={styles.detailList}>
              {enzyme.activators.map((item) => (
                <Badge tone="correct" key={item}>
                  ↑ {item}
                </Badge>
              ))}
            </div>
          </Block>
        ) : null}
        {enzyme.inhibitors?.length ? (
          <Block label="Inhibited by">
            <div className={styles.detailList}>
              {enzyme.inhibitors.map((item) => (
                <Badge tone="regulatory" key={item}>
                  ↓ {item}
                </Badge>
              ))}
            </div>
          </Block>
        ) : null}
        {reaction ? (
          <Block label="What happens here">
            <p className={styles.detailText}>{reaction.explanation}</p>
          </Block>
        ) : null}
        {enzyme.clinical ? (
          <Block label="Clinical note">
            <p className={styles.detailText}>{enzyme.clinical}</p>
          </Block>
        ) : null}
      </Card>
    );
  }

  const couple = index.couples.get(selection.id);
  if (!couple) return null;
  return (
    <Card>
      <h3 className={styles.detailTitle}>{couple.label}</h3>
      <div className={styles.detailList} style={{ marginTop: 'var(--space-2)' }}>
        <Badge tone={couple.role === 'energy' ? 'energy' : 'redox'}>
          {couple.role === 'energy' ? 'Energy carrier' : 'Redox cofactor'}
        </Badge>
        <Badge>{couple.direction === 'consumes' ? 'Consumed' : 'Produced'}</Badge>
      </div>
      {couple.note ? (
        <Block label="What it means">
          <p className={styles.detailText}>{couple.note}</p>
        </Block>
      ) : null}
    </Card>
  );
}
