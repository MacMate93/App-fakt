import type { HeatmapChartSpec } from '../../types/content';
import { ChartFrame, chartStyles as styles } from './ChartFrame';
import { extent } from './primitives';

const W = 640;
const M = { top: 28, right: 16, bottom: 16, left: 120 };
const CELL_H = 30;

/** Colour a value on a sequential or diverging ramp built from the tokens. */
function cellColor(value: number, min: number, max: number, diverging: boolean): string {
  if (diverging) {
    const limit = Math.max(Math.abs(min), Math.abs(max)) || 1;
    const ratio = Math.min(1, Math.abs(value) / limit);
    const color = value >= 0 ? 'var(--chart-2)' : 'var(--chart-1)';
    return `color-mix(in srgb, ${color} ${Math.round(ratio * 100)}%, var(--surface-2))`;
  }
  const ratio = max === min ? 0.5 : (value - min) / (max - min);
  return `color-mix(in srgb, var(--chart-1) ${Math.round(ratio * 100)}%, var(--surface-2))`;
}

export function Heatmap({ spec }: { spec: HeatmapChartSpec }) {
  const flat = spec.values.flat();
  const [min, max] = extent(flat);
  const diverging = spec.scale === 'diverging';
  const height = M.top + spec.rows.length * CELL_H + M.bottom;
  const cellW = (W - M.left - M.right) / spec.cols.length;

  return (
    <ChartFrame title={spec.title} caption={spec.caption} width={W} height={height}>
      {spec.cols.map((col, colIndex) => (
        <text
          key={col}
          className={styles.axisText}
          x={M.left + cellW * (colIndex + 0.5)}
          y={M.top - 10}
          textAnchor="middle"
        >
          {col}
        </text>
      ))}
      {spec.rows.map((row, rowIndex) => (
        <g key={row}>
          <text
            className={styles.axisText}
            x={M.left - 10}
            y={M.top + CELL_H * (rowIndex + 0.5)}
            textAnchor="end"
            dominantBaseline="middle"
          >
            {row}
          </text>
          {spec.cols.map((col, colIndex) => (
            <rect
              key={`${row}-${col}`}
              className={styles.heatCell}
              x={M.left + cellW * colIndex}
              y={M.top + CELL_H * rowIndex}
              width={cellW}
              height={CELL_H}
              fill={cellColor(spec.values[rowIndex]?.[colIndex] ?? 0, min, max, diverging)}
            >
              <title>{`${row} · ${col}: ${spec.values[rowIndex]?.[colIndex]}`}</title>
            </rect>
          ))}
        </g>
      ))}
    </ChartFrame>
  );
}
