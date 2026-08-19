import { Fragment } from 'react';
import styles from './modules.module.css';

export interface PathwayNode {
  /** Small uppercase label above the node, e.g. "Pathway". */
  kind?: string;
  label: string;
  accent?: boolean;
}

/**
 * Vertical flow diagram used both by the Therapy Builder summary and by the
 * week summary. Plain flex + text so it stays readable on a phone.
 */
export function TranslationalPathway({ nodes }: { nodes: PathwayNode[] }) {
  return (
    <div className={styles.pathway}>
      {nodes.map((node, index) => (
        <Fragment key={`${node.label}-${index}`}>
          {index > 0 ? (
            <span className={styles.pathwayArrow} aria-hidden="true">
              ↓
            </span>
          ) : null}
          <div
            className={[styles.pathwayNode, node.accent ? styles.pathwayNodeAccent : '']
              .filter(Boolean)
              .join(' ')}
          >
            {node.kind ? <span className={styles.pathwayKind}>{node.kind}</span> : null}
            <span className={styles.pathwayLabel}>{node.label}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
