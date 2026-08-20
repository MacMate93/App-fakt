import { ZOOM_STEPS } from '@/components/layout/useFitZoom';
import styles from './game.module.css';

/** Escape hatch for small laptops: shrink the diagram until it fits. */
export function ZoomControl({
  zoom,
  onChange,
}: {
  zoom: number;
  onChange: (zoom: number) => void;
}) {
  const at = ZOOM_STEPS.indexOf(zoom);
  const step = (delta: number) => {
    const next = ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, at + delta))];
    if (next !== undefined) onChange(next);
  };

  return (
    <div className={styles.zoom} role="group" aria-label="Diagram size">
      <button type="button" onClick={() => step(1)} disabled={at >= ZOOM_STEPS.length - 1} aria-label="Smaller diagram">
        −
      </button>
      <span>{Math.round(zoom * 100)}%</span>
      <button type="button" onClick={() => step(-1)} disabled={at <= 0} aria-label="Larger diagram">
        +
      </button>
    </div>
  );
}
