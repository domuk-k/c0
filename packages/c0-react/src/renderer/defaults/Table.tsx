import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultTableProps {
  columns?: Array<{ key: string; label: string }>;
  rows?: Array<Record<string, unknown>>;
  onAction?: (action: C0Action) => void;
}

export function DefaultTable({ columns, rows }: DefaultTableProps) {
  if (!columns?.length) return <div className="c0-table-empty">No columns defined</div>;
  return (
    <div className="c0-table">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.length ? (
            rows.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key}>{String(row[col.key] ?? '')}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="c0-table-empty-row">
                No data yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
