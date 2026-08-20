import type { Couple } from '@/types/pathway';
import styles from './pathway.module.css';

export function CoupleChip({
  couple,
  onClick,
  solved,
}: {
  couple: Couple;
  onClick?: () => void;
  solved?: boolean;
}) {
  const classes = [
    styles.chip,
    couple.role === 'energy' ? styles.chipEnergy : '',
    couple.role === 'redox' ? styles.chipRedox : '',
    onClick ? styles.clickable : '',
    solved ? styles.solved : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {couple.label}
      {solved ? <span className={styles.solvedMark}>✓</span> : null}
    </>
  );

  if (!onClick) return <span className={classes}>{content}</span>;
  return (
    <button type="button" className={classes} onClick={onClick} title={couple.note}>
      {content}
    </button>
  );
}
