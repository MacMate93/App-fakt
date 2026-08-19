import type { PcaChartSpec, ScatterChartSpec } from '../../types/content';
import { useLocale } from '../../state/LocaleProvider';
import { ChartFrame, XAxisTitle, YAxis, chartStyles as styles } from './ChartFrame';
import { extent, formatTick, linearScale, niceTicks, padDomain, seriesColor } from './primitives';

const W = 640;
const H = 320;
const M = { top: 12, right: 16, bottom: 46, left: 58 };

/**
 * Shared implementation for scatter and PCA plots: a PCA score plot is a
 * scatter plot whose axes carry explained-variance labels.
 */
export function ScatterPlot({ spec }: { spec: ScatterChartSpec | PcaChartSpec }) {
  const { text } = useLocale();
  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;

  const groups = Array.from(new Set(spec.points.map((p) => p.group ?? '')));
  const yTicks = niceTicks(...extent(spec.points.map((p) => p.y)), 5);
  const y = linearScale(padDomain(extent(spec.points.map((p) => p.y))), [M.top + plotH, M.top]);
  const xDomain = padDomain(extent(spec.points.map((p) => p.x)));
  const x = linearScale(xDomain, [M.left, M.left + plotW]);
  const xTicks = niceTicks(xDomain[0], xDomain[1], 5);

  const variance = spec.kind === 'pca' ? spec.variance : undefined;
  const xLabel = spec.xLabel
    ? text(spec.xLabel)
    : variance
      ? `PC1 (${variance[0]}%)`
      : undefined;
  const yLabel = spec.yLabel
    ? text(spec.yLabel)
    : variance
      ? `PC2 (${variance[1]}%)`
      : undefined;

  return (
    <ChartFrame
      title={spec.title}
      caption={spec.caption}
      legend={groups.filter(Boolean).map((group, index) => ({ label: group, colorIndex: index }))}
      width={W}
      height={H}
    >
      <YAxis ticks={yTicks} scale={y} left={M.left} right={M.left + plotW} label={yLabel} format={formatTick} />
      {spec.points.map((point, index) => (
        <circle
          key={index}
          cx={x(point.x)}
          cy={y(point.y)}
          r={4.5}
          fill={seriesColor(Math.max(0, groups.indexOf(point.group ?? '')))}
          fillOpacity={0.75}
        >
          {point.label ? <title>{point.label}</title> : null}
        </circle>
      ))}
      {xTicks.map((tick) => (
        <text key={tick} className={styles.axisText} x={x(tick)} y={M.top + plotH + 18} textAnchor="middle">
          {formatTick(tick)}
        </text>
      ))}
      <line className={styles.axisLine} x1={M.left} x2={M.left + plotW} y1={M.top + plotH} y2={M.top + plotH} />
      <XAxisTitle label={xLabel} x={M.left + plotW / 2} y={H - 8} />
    </ChartFrame>
  );
}
