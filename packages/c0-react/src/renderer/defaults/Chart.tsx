import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultChartProps {
  chartType?: string;
  labels?: string[];
  datasets?: Array<{ label: string; values: number[] }>;
  onAction?: (action: C0Action) => void;
}

export function DefaultChart({ chartType, labels, datasets }: DefaultChartProps) {
  if (!datasets?.length || !labels?.length) return <div className="c0-chart-empty">No chart data</div>;
  const allValues = datasets.flatMap((d) => d.values);
  const maxValue = Math.max(...allValues, 1);

  return (
    <div className="c0-chart">
      <div className="c0-chart-type">{chartType ?? 'bar'}</div>
      <div className="c0-chart-bars">
        {labels.map((label, i) => (
          <div key={i} className="c0-chart-bar-row">
            <span className="c0-chart-label">{label}</span>
            <div className="c0-chart-bar-container">
              <div
                className="c0-chart-bar"
                style={{ width: `${((datasets[0]?.values[i] ?? 0) / maxValue) * 100}%` }}
              />
            </div>
            <span className="c0-chart-value">{(datasets[0]?.values[i] ?? 0).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
