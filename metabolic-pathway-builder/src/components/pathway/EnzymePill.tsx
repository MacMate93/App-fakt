import type { Enzyme } from '@/types/pathway';
import styles from './pathway.module.css';

export function EnzymePill({
  enzyme,
  onClick,
  selected,
  solved,
}: {
  enzyme: Enzyme;
  onClick?: () => void;
  selected?: boolean;
  solved?: boolean;
}) {
  const classes = [
    styles.enzyme,
    enzyme.regulatory ? styles.enzymeRegulatory : '',
    onClick ? styles.clickable : '',
    selected ? styles.selected : '',
    solved ? styles.solved : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {enzyme.regulatory ? (
        <span className={styles.regMark} title="Key regulatory step" aria-label="Key regulatory step">
          ⚡
        </span>
      ) : null}
      {enzyme.name}
      {solved ? <span className={styles.solvedMark}>✓</span> : null}
    </>
  );

  if (!onClick) return <span className={classes}>{content}</span>;
  return (
    <button type="button" className={classes} onClick={onClick} title={enzyme.role}>
      {content}
    </button>
  );
}
