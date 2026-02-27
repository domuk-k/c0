import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultDiffProps {
  changes?: Array<{ label?: string; before: string; after: string }>;
  onAction?: (action: C0Action) => void;
}

export function DefaultDiff({ changes }: DefaultDiffProps) {
  if (!changes?.length) return <div className="c0-diff-empty">No changes</div>;
  return (
    <div className="c0-diff">
      {changes.map((c, i) => (
        <div key={i} className="c0-diff-row">
          {c.label && <span className="c0-diff-label">{c.label}</span>}
          <span className="c0-diff-before">{c.before}</span>
          <span className="c0-diff-arrow">{'\u2192'}</span>
          <span className="c0-diff-after">{c.after}</span>
        </div>
      ))}
    </div>
  );
}
