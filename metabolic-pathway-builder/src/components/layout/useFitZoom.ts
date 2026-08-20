import { useEffect, type RefObject } from 'react';

export const ZOOM_STEPS = [1, 0.9, 0.8];

/**
 * Picks the largest diagram size that still fits the visible pane.
 *
 * A ten-step pathway is taller than a laptop screen even in two columns, and
 * asking the student to scroll for every placement is exactly the complaint
 * this is here to answer. The steps stop at 80% — past that the type stops
 * being comfortably readable, and a short scroll is the better trade.
 */
export function useFitZoom({
  paneRef,
  enabled,
  zoom,
  onZoom,
  deps = [],
}: {
  paneRef: RefObject<HTMLElement>;
  enabled: boolean;
  zoom: number;
  onZoom: (zoom: number) => void;
  deps?: unknown[];
}): void {
  useEffect(() => {
    if (!enabled) return;

    const measure = () => {
      const pane = paneRef.current;
      const content = pane?.querySelector<HTMLElement>('[data-canvas-content]');
      if (!pane || !content) return;

      // The pane grows with its content unless a max-height caps it, so the
      // cap is what "fits" means — reading clientHeight would always agree
      // with itself and the zoom could never come back up.
      const cap = Number.parseFloat(getComputedStyle(pane).maxHeight);
      const available = Number.isFinite(cap) ? cap - 8 : pane.clientHeight;
      const natural = content.getBoundingClientRect().height / (zoom || 1);
      if (!natural || !available) return;

      const next = ZOOM_STEPS.find((step) => natural * step <= available) ?? ZOOM_STEPS.at(-1);
      if (next !== undefined && next !== zoom) onZoom(next);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, zoom, onZoom, paneRef, ...deps]);
}
