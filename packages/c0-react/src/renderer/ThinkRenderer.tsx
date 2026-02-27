import React, { useState } from 'react';

import type { ThinkRendererProps } from '../types.js';

/**
 * Renders chain-of-thought / thinking steps.
 * Ephemeral items fade after streaming completes.
 */
export function ThinkRenderer({ items, isStreaming }: ThinkRendererProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter: show ephemeral items only during streaming
  const visibleItems = items.filter(
    (item) => !item.ephemeral || isStreaming,
  );

  if (visibleItems.length === 0) return null;

  return (
    <div className="c0-think" data-streaming={isStreaming}>
      <button
        className="c0-think-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        <span className="c0-think-icon">{isStreaming ? '⟳' : '◆'}</span>
        <span>
          {isStreaming
            ? `Thinking... (${visibleItems.length} steps)`
            : `${visibleItems.length} reasoning steps`}
        </span>
      </button>

      {(isExpanded || isStreaming) && (
        <div className="c0-think-items">
          {visibleItems.map((item, i) => (
            <div
              key={i}
              className="c0-think-item"
              data-ephemeral={item.ephemeral}
            >
              <div className="c0-think-title">{item.title}</div>
              <div className="c0-think-content">{item.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
