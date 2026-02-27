import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultProgressBarProps {
  steps?: Array<{ label: string; status: string }>;
  percentage?: number;
  onAction?: (action: C0Action) => void;
}

export function DefaultProgressBar({ steps, percentage }: DefaultProgressBarProps) {
  return (
    <div className="c0-progress">
      {percentage != null && (
        <div className="c0-progress-bar">
          <div className="c0-progress-fill" style={{ width: `${percentage}%` }} />
        </div>
      )}
      {steps?.map((s, i) => (
        <div key={i} className={`c0-progress-step c0-status-${s.status}`}>
          {s.label}
        </div>
      ))}
    </div>
  );
}
