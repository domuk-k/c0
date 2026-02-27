import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { ContentRendererProps } from '../types.js';

/**
 * Renders markdown content from <content> tags.
 * Supports GitHub-flavored markdown (tables, strikethrough, etc.)
 */
export function ContentRenderer({ markdown }: ContentRendererProps) {
  if (!markdown) return null;

  return (
    <div className="c0-content">
      <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
    </div>
  );
}
