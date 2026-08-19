import type { ChartSpec } from '../../types/content';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { ScatterPlot } from './ScatterPlot';
import { Heatmap } from './Heatmap';

/** Single entry point: content declares a spec, the renderer picks the chart. */
export function ChartRenderer({ spec }: { spec: ChartSpec }) {
  switch (spec.kind) {
    case 'bar':
      return <BarChart spec={spec} />;
    case 'line':
      return <LineChart spec={spec} />;
    case 'scatter':
    case 'pca':
      return <ScatterPlot spec={spec} />;
    case 'heatmap':
      return <Heatmap spec={spec} />;
  }
}
