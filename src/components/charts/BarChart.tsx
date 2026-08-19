import type { BarChartSpec } from '../../types/content';
import { useLocale } from '../../state/LocaleProvider';
import { ChartFrame, XAxisTitle, YAxis, chartStyles as styles } from './ChartFrame';
import { formatTick, linearScale, niceTicks, seriesColor } from './primitives';

const W = 640;
const H = 320;
const M = { top: 12, right: 16, bottom: 46, left: 58 };

/** Grouped bar chart with optional symmetric error bars. */
export function BarChart({ spec }: { spec: BarChartSpec }) {
  const { text } = useLocale();
  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;

  const allValues = spec.series.flatMap((s) =>
    s.values.map((value, index) => value + (s.error?.[index] ?? 0)),
  );
  const max = Math.max(...allValues, spec.reference ?? 0);
  const ticks = niceTicks(0, max, 5);
  const y = linearScale([0, ticks[ticks.length - 1]], [M.top + plotH, M.top]);

  const groupWidth = plotW / spec.groups.length;
  const barWidth = Math.min(46, (groupWidth * 0.62) / spec.series.length);

  return (
    <ChartFrame
      title={spec.title}
      caption={spec.caption}
      legend={spec.series.map((s, index) => ({ label: text(s.name), colorIndex: index }))}
      width={W}
      height={H}
    >
      <YAxis
        ticks={ticks}
        scale={y}
        left={M.left}
        right={M.left + plotW}
        label={spec.yLabel ? text(spec.yLabel) : undefined}
        format={formatTick}
      />
      {spec.reference !== undefined ? (
        <line
          className={styles.reference}
          x1={M.left}
          x2={M.left + plotW}
          y1={y(spec.reference)}
          y2={y(spec.reference)}
        />
      ) : null}

      {spec.groups.map((group, groupIndex) => {
        const center = M.left + groupWidth * (groupIndex + 0.5);
        const offset = ((spec.series.length - 1) * barWidth) / 2;
        return (
          <g key={group}>
            {spec.series.map((series, seriesIndex) => {
              const value = series.values[groupIndex] ?? 0;
              const error = series.error?.[groupIndex];
              const x = center - offset + seriesIndex * barWidth - barWidth / 2;
              const top = y(value);
              return (
                <g key={`${group}-${seriesIndex}`}>
                  <rect
                    x={x}
                    y={top}
                    width={barWidth - 3}
                    height={Math.max(0, y(0) - top)}
                    fill={seriesColor(seriesIndex)}
                    rx={2}
                  />
                  {error !== undefined ? (
                    <g stroke={seriesColor(seriesIndex)} strokeWidth={1.4} opacity={0.85}>
                      <line
                        x1={x + (barWidth - 3) / 2}
                        x2={x + (barWidth - 3) / 2}
                        y1={y(value - error)}
                        y2={y(value + error)}
                      />
                      <line x1={x + 2} x2={x + barWidth - 5} y1={y(value + error)} y2={y(value + error)} />
                      <line x1={x + 2} x2={x + barWidth - 5} y1={y(value - error)} y2={y(value - error)} />
                    </g>
                  ) : null}
                </g>
              );
            })}
            <text
              className={styles.axisText}
              x={center}
              y={M.top + plotH + 18}
              textAnchor="middle"
            >
              {group}
            </text>
          </g>
        );
      })}

      <line className={styles.axisLine} x1={M.left} x2={M.left + plotW} y1={y(0)} y2={y(0)} />
      <XAxisTitle
        label={spec.xLabel ? text(spec.xLabel) : undefined}
        x={M.left + plotW / 2}
        y={H - 8}
      />
    </ChartFrame>
  );
}
