import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultKeyValueProps {
  entries?: Array<{ key: string; value: string | number; confidence?: number }>;
  onAction?: (action: C0Action) => void;
}

export function DefaultKeyValue({ entries }: DefaultKeyValueProps) {
  if (!entries?.length) return null;
  return (
    <dl className="c0-kv">
      {entries.map((e, i) => (
        <React.Fragment key={i}>
          <dt>{e.key}</dt>
          <dd>
            {String(e.value)}
            {e.confidence != null && (
              <span className="c0-kv-confidence">{Math.round(e.confidence * 100)}%</span>
            )}
          </dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
