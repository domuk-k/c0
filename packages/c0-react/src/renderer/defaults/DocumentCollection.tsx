import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultDocumentCollectionProps {
  documents?: Array<{ filename: string; mimeType?: string; size?: number }>;
  totalSize?: number;
  onAction?: (action: C0Action) => void;
}

export function DefaultDocumentCollection({ documents, totalSize }: DefaultDocumentCollectionProps) {
  if (!documents?.length) return <div className="c0-docs-empty">No documents</div>;
  return (
    <div className="c0-docs">
      <div className="c0-docs-list">
        {documents.map((doc, i) => (
          <div key={i} className="c0-docs-item">
            <span className="c0-docs-icon">{'\uD83D\uDCC4'}</span>
            <span className="c0-docs-name">{doc.filename}</span>
            {doc.mimeType && <span className="c0-docs-type">{doc.mimeType}</span>}
            {doc.size != null && <span className="c0-docs-size">{formatBytes(doc.size)}</span>}
          </div>
        ))}
      </div>
      {totalSize != null && <div className="c0-docs-total">Total: {formatBytes(totalSize)}</div>}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
