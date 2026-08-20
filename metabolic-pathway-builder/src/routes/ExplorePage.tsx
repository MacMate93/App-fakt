import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPlayablePathway } from '@/data';
import { indexPathway } from '@/engine/pathwayModel';
import { Badge } from '@/components/layout/Badge';
import { Button } from '@/components/layout/Button';
import { Card } from '@/components/layout/Card';
import { BalancePanel } from '@/components/explore/BalancePanel';
import { DetailPanel } from '@/components/explore/DetailPanel';
import { PathwayCanvas, type CanvasSelection } from '@/components/pathway/PathwayCanvas';
import styles from './routes.module.css';

export function ExplorePage() {
  const { pathwayId = '' } = useParams();
  const pathway = getPlayablePathway(pathwayId);
  const [selection, setSelection] = useState<CanvasSelection>(null);
  const index = useMemo(() => (pathway ? indexPathway(pathway) : null), [pathway]);

  if (!pathway || !index) {
    return (
      <Card className={styles.emptyState}>
        <h2>This pathway is not available yet</h2>
        <p className={styles.pathwaySummary}>
          Only pathways with a content file can be explored. Glycolysis is ready today.
        </p>
        <Link to="/">
          <Button variant="secondary">Back to the pathways</Button>
        </Link>
      </Card>
    );
  }

  return (
    <>
      <div className={styles.playHead}>
        <div className={styles.playTitle}>
          <h1 className={styles.pathwayName}>{pathway.name}</h1>
          {pathway.compartment ? <Badge tone="accent">{pathway.compartment}</Badge> : null}
          <Badge>{pathway.reactions.length} steps</Badge>
        </div>
        <div className={styles.inlineActions}>
          <Link to={`/play/${pathway.id}?mode=build&difficulty=beginner&game=learning`}>
            <Button size="small">Practise this pathway</Button>
          </Link>
        </div>
      </div>

      <div className={styles.exploreLayout}>
        <Card className={styles.canvasCard} padded={false}>
          <PathwayCanvas index={index} onSelect={setSelection} selection={selection} />
        </Card>

        <div className={styles.detail}>
          <DetailPanel index={index} selection={selection} />
          <BalancePanel index={index} />
          {pathway.references?.length ? (
            <Card>
              <span className={styles.detailLabel}>Sources</span>
              <ul className={styles.reviewList} style={{ marginTop: 'var(--space-2)' }}>
                {pathway.references.map((reference) => (
                  <li className={styles.detailText} key={reference}>
                    {reference}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
