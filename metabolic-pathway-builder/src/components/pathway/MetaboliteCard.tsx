import type { Metabolite } from '@/types/pathway';
import styles from './pathway.module.css';

export function MetaboliteCard({
  metabolite,
  onClick,
  selected,
  solved,
  multiplier,
}: {
  metabolite: Metabolite;
  onClick?: () => void;
  selected?: boolean;
  solved?: boolean;
  multiplier?: number;
}) {
  const classes = [
    styles.metabolite,
    onClick ? styles.clickable : '',
    selected ? styles.selected : '',
    solved ? styles.solved : '',
  ]
    .filter(Boolean)
    .join(' ');

  const meta = [
    metabolite.abbr,
    metabolite.carbons ? `C${metabolite.carbons}` : null,
    multiplier && multiplier > 1 ? `×${multiplier}` : null,
  ].filter(Boolean) as string[];

  const content = (
    <>
      <span className={styles.metaboliteName}>
        {metabolite.name} {solved ? <span className={styles.solvedMark}>✓</span> : null}
      </span>
      {meta.length > 0 ? (
        <span className={styles.metaboliteMeta}>
          {meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </span>
      ) : null}
    </>
  );

  if (!onClick) return <div className={classes}>{content}</div>;
  return (
    <button type="button" className={classes} onClick={onClick}>
      {content}
    </button>
  );
}
