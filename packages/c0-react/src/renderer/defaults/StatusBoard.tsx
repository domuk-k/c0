import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultStatusBoardProps {
  columns?: Array<{ key: string; label: string }>;
  items?: Array<{ id?: string; title: string; column: string; description?: string }>;
  onAction?: (action: C0Action) => void;
}

export function DefaultStatusBoard({ columns, items }: DefaultStatusBoardProps) {
  if (!columns?.length) return <div className="c0-board-empty">No columns defined</div>;
  return (
    <div className="c0-board" style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
      {columns.map((col) => {
        const colItems = items?.filter((item) => item.column === col.key) ?? [];
        return (
          <div key={col.key} className="c0-board-column" style={{ flex: '1 0 200px', minWidth: 0 }}>
            <div className="c0-board-column-header">{col.label} ({colItems.length})</div>
            <div className="c0-board-cards">
              {colItems.map((item, i) => (
                <div key={item.id ?? i} className="c0-board-card">
                  <div className="c0-board-card-title">{item.title}</div>
                  {item.description && <div className="c0-board-card-desc">{item.description}</div>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
