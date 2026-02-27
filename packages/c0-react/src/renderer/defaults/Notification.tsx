import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultNotificationProps {
  channel?: string;
  recipients?: string;
  preview?: { subject?: string; body: string };
  status?: string;
  onAction?: (action: C0Action) => void;
}

export function DefaultNotification({ channel, recipients, preview, status }: DefaultNotificationProps) {
  return (
    <div className={`c0-notification c0-status-${status}`}>
      <div className="c0-notification-meta">
        {channel} {'\u2192'} {recipients} ({status})
      </div>
      {preview?.subject && <div className="c0-notification-subject">{preview.subject}</div>}
      {preview?.body && <div className="c0-notification-body">{preview.body}</div>}
    </div>
  );
}
