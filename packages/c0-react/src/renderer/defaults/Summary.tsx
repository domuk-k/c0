import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultSummaryProps {
  items?: Array<{ label: string; value: string | number; variant?: string; trend?: string }>;
  gridCols?: number;
  onAction?: (action: C0Action) => void;
}

export function DefaultSummary({ items, gridCols = 2 }: DefaultSummaryProps) {
  if (!items?.length) return null;
  return (
    <div className="c0-summary" style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: '8px' }}>
      {items.map((item, i) => (
        <div key={i} className={`c0-summary-card c0-variant-${item.variant ?? 'default'}`}>
          <div className="c0-summary-label">{item.label}</div>
          <div className="c0-summary-value">
            {String(item.value)}
            {item.trend && <span className={`c0-trend-${item.trend}`}>{item.trend === 'up' ? '\u2191' : item.trend === 'down' ? '\u2193' : '\u2192'}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
