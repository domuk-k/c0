import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultApprovalCardProps {
  title?: string;
  requester?: string;
  summary?: Array<{ key: string; value: string }>;
  impact?: string;
  onAction?: (action: C0Action) => void;
}

export function DefaultApprovalCard({ title, requester, summary, impact }: DefaultApprovalCardProps) {
  return (
    <div className="c0-approval">
      <h3 className="c0-approval-title">{title}</h3>
      {requester && <div className="c0-approval-requester">From: {requester}</div>}
      {summary?.map((s, i) => (
        <div key={i} className="c0-approval-item">
          <span>{s.key}:</span> <span>{s.value}</span>
        </div>
      ))}
      {impact && <div className="c0-approval-impact">{impact}</div>}
    </div>
  );
}
