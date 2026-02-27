import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultMarkdownProps {
  content?: string;
  onAction?: (action: C0Action) => void;
}

export function DefaultMarkdown({ content }: DefaultMarkdownProps) {
  return <div className="c0-markdown">{content ?? ''}</div>;
}
