import type { ReactNode } from 'react';
import type { LocalizedText } from '../../types/i18n';
import { useLocale } from '../../state/LocaleProvider';
import { seriesColor } from './primitives';
import styles from './charts.module.css';

export interface LegendEntry {
  label: string;
  colorIndex: number;
}

interface ChartFrameProps {
  title?: LocalizedText;
  caption?: LocalizedText;
  legend?: LegendEntry[];
  children: ReactNode;
  /** SVG user-space size; the element itself scales to the container width. */
  width?: number;
  height?: number;
}

/** Shared chrome: title, responsive SVG canvas, legend and caption. */
export function ChartFrame({
  title,
  caption,
  legend,
  children,
  width = 640,
  height = 320,
}: ChartFrameProps) {
  const { text } = useLocale();
  return (
    <figure className={styles.figure}>
      {title ? <div className={styles.title}>{text(title)}</div> : null}
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        preserveAspectRatio="xMidYMid meet"
      >
        {children}
      </svg>
      {legend && legend.length > 0 ? (
        <div className={styles.legend}>
          {legend.map((entry) => (
            <span key={entry.label} className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: seriesColor(entry.colorIndex) }} />
              {entry.label}
            </span>
          ))}
        </div>
      ) : null}
      {caption ? <figcaption className={styles.caption}>{text(caption)}</figcaption> : null}
    </figure>
  );
}

interface YAxisProps {
  ticks: number[];
  scale: (value: number) => number;
  left: number;
  right: number;
  label?: string;
  format?: (value: number) => string;
}

export function YAxis({ ticks, scale, left, right, label, format = String }: YAxisProps) {
  return (
    <g>
      {ticks.map((tick) => (
        <g key={tick}>
          <line className={styles.grid} x1={left} x2={right} y1={scale(tick)} y2={scale(tick)} />
          <text className={styles.axisText} x={left - 8} y={scale(tick)} textAnchor="end" dominantBaseline="middle">
            {format(tick)}
          </text>
        </g>
      ))}
      {label ? (
        <text
          className={styles.axisTitle}
          transform={`translate(14 ${(scale(ticks[0]) + scale(ticks[ticks.length - 1])) / 2}) rotate(-90)`}
          textAnchor="middle"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

export function XAxisTitle({ label, x, y }: { label?: string; x: number; y: number }) {
  if (!label) return null;
  return (
    <text className={styles.axisTitle} x={x} y={y} textAnchor="middle">
      {label}
    </text>
  );
}

export const chartStyles = styles;
