import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultFileUploadProps {
  multiple?: boolean;
  accept?: string;
  label?: string;
  onAction?: (action: C0Action) => void;
}

export function DefaultFileUpload({ multiple, accept, label }: DefaultFileUploadProps) {
  return (
    <div className="c0-upload">
      <div className="c0-upload-dropzone">
        <div className="c0-upload-icon">{'\uD83D\uDCC1'}</div>
        <div className="c0-upload-label">{label ?? 'Drop files here'}</div>
        <div className="c0-upload-meta">
          {accept && <span>Accepts: {accept}</span>}
          {multiple && <span> (multiple files)</span>}
        </div>
      </div>
    </div>
  );
}
