import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultDocumentProps {
  filename?: string;
  mimeType?: string;
  onAction?: (action: C0Action) => void;
}

export function DefaultDocument({ filename, mimeType }: DefaultDocumentProps) {
  return (
    <div className="c0-document">
      <div className="c0-document-icon">{'\uD83D\uDCC4'}</div>
      <div className="c0-document-info">
        <div className="c0-document-name">{filename ?? 'Untitled'}</div>
        {mimeType && <div className="c0-document-type">{mimeType}</div>}
      </div>
    </div>
  );
}
