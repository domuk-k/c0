import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultComparisonProps {
  sources?: { left: string; right: string };
  rows?: Array<{ field: string; label: string; status: string }>;
  onAction?: (action: C0Action) => void;
}

export function DefaultComparison({ sources, rows }: DefaultComparisonProps) {
  return (
    <div className="c0-comparison">
      <div className="c0-comparison-header">
        <span>{sources?.left ?? 'Left'}</span>
        <span>vs</span>
        <span>{sources?.right ?? 'Right'}</span>
      </div>
      {rows?.length ? (
        <div className="c0-comparison-rows">
          {rows.map((r, i) => (
            <div key={i} className={`c0-comparison-row c0-status-${r.status}`}>
              {r.label}: {r.status}
            </div>
          ))}
        </div>
      ) : (
        <div className="c0-comparison-empty">No comparison data</div>
      )}
    </div>
  );
}
