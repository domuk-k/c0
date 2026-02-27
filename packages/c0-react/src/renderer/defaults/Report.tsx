import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultReportProps {
  formats?: string[];
  sections?: Array<{ title: string; summary: string }>;
  onAction?: (action: C0Action) => void;
}

export function DefaultReport({ formats, sections }: DefaultReportProps) {
  return (
    <div className="c0-report">
      {formats?.length && (
        <div className="c0-report-formats">
          {formats.map((f) => (
            <span key={f} className="c0-report-format-badge">{f.toUpperCase()}</span>
          ))}
        </div>
      )}
      {sections?.length ? (
        <div className="c0-report-sections">
          {sections.map((s, i) => (
            <div key={i} className="c0-report-section">
              <h4 className="c0-report-section-title">{s.title}</h4>
              <p className="c0-report-section-summary">{s.summary}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="c0-report-empty">No sections</div>
      )}
    </div>
  );
}
