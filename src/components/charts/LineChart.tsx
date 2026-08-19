import type { LineChartSpec } from '../../types/content';
import { useLocale } from '../../state/LocaleProvider';
import { ChartFrame, XAxisTitle, YAxis, chartStyles as styles } from './ChartFrame';
import { extent, formatTick, linearScale, niceTicks, padDomain, seriesColor } from './primitives';

const W = 640;
const H = 320;
const M = { top: 12, right: 16, bottom: 46, left: 58 };

export function LineChart({ spec }: { spec: LineChartSpec }) {
  const { text } = useLocale();
  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;

  const values = spec.series.flatMap((s) => s.values);
  const [minY, maxY] = extent(values);
  const ticks = niceTicks(Math.min(0, minY), maxY, 5);
  const y = linearScale([ticks[0], ticks[ticks.length - 1]], [M.top + plotH, M.top]);
  const x = linearScale(padDomain(extent(spec.x), 0.02), [M.left, M.left + plotW]);

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
      {spec.series.map((series, seriesIndex) => {
        const path = series.values
          .map((value, index) => `${index === 0 ? 'M' : 'L'} ${x(spec.x[index])} ${y(value)}`)
          .join(' ');
        return (
          <g key={seriesIndex}>
            <path d={path} fill="none" stroke={seriesColor(seriesIndex)} strokeWidth={2} />
            {series.values.map((value, index) => (
              <circle
                key={index}
                cx={x(spec.x[index])}
                cy={y(value)}
                r={3}
                fill={seriesColor(seriesIndex)}
              />
            ))}
          </g>
        );
      })}
      {spec.x.map((value) => (
        <text
          key={value}
          className={styles.axisText}
          x={x(value)}
          y={M.top + plotH + 18}
          textAnchor="middle"
        >
          {formatTick(value)}
        </text>
      ))}
      <line
        className={styles.axisLine}
        x1={M.left}
        x2={M.left + plotW}
        y1={M.top + plotH}
        y2={M.top + plotH}
      />
      <XAxisTitle label={spec.xLabel ? text(spec.xLabel) : undefined} x={M.left + plotW / 2} y={H - 8} />
    </ChartFrame>
  );
}
