import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultFileDownloadProps {
  files?: Array<{ name: string; url?: string; size?: number; mimeType?: string }>;
  onAction?: (action: C0Action) => void;
}

export function DefaultFileDownload({ files }: DefaultFileDownloadProps) {
  if (!files?.length) return <div className="c0-files-empty">No files available</div>;
  return (
    <div className="c0-files">
      {files.map((file, i) => (
        <div key={i} className="c0-files-item">
          <span className="c0-files-icon">{'\u2B07'}</span>
          <span className="c0-files-name">{file.name}</span>
          {file.mimeType && <span className="c0-files-type">{file.mimeType}</span>}
        </div>
      ))}
    </div>
  );
}
