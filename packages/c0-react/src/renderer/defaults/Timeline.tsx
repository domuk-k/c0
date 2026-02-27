import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultTimelineProps {
  events?: Array<{ time: string; event: string; status: string }>;
  onAction?: (action: C0Action) => void;
}

export function DefaultTimeline({ events }: DefaultTimelineProps) {
  if (!events?.length) return <div className="c0-timeline-empty">No events</div>;
  return (
    <div className="c0-timeline">
      {events.map((e, i) => (
        <div key={i} className={`c0-timeline-event c0-status-${e.status}`}>
          <span className="c0-timeline-time">{e.time}</span>
          <span className="c0-timeline-text">{e.event}</span>
        </div>
      ))}
    </div>
  );
}
