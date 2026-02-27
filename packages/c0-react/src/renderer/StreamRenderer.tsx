import React, { useMemo } from 'react';
import { createStreamParser } from '@c0-ui/protocol';

import { ArtifactRenderer } from './ArtifactRenderer.js';
import { ContentRenderer } from './ContentRenderer.js';
import { ThinkRenderer } from './ThinkRenderer.js';
import type { StreamRendererProps } from '../types.js';
import type { ArtifactPart, CustomMarkdownPart } from '@c0-ui/protocol';

/**
 * Core renderer that parses XML-DSL content and renders the appropriate components.
 *
 * This is the c0 equivalent of C1's C1Component — the bridge between
 * the streaming XML protocol and React components.
 *
 * It re-parses the full content string on each update. This is intentional
 * and efficient because:
 * 1. htmlparser2 is very fast (~10ms for large responses)
 * 2. React's reconciliation handles the diff efficiently
 * 3. Maintaining parser state across renders would be more complex and error-prone
 */
export function StreamRenderer({
  content,
  isStreaming,
  components,
  onAction,
  renderArtifact,
  renderThink,
}: StreamRendererProps) {
  const parsed = useMemo(() => {
    if (!content) return null;
    const parser = createStreamParser();
    parser.write(content);
    return parser.getResult();
  }, [content]);

  if (!parsed) return null;

  return (
    <div className="c0-response" data-streaming={isStreaming}>
      {/* Think items */}
      {parsed.think.length > 0 && (
        renderThink
          ? renderThink(parsed.think, isStreaming)
          : <ThinkRenderer items={parsed.think} isStreaming={isStreaming} />
      )}

      {/* Message parts */}
      {parsed.parts.map((part, i) => {
        switch (part.type) {
          case 'content':
            return <ContentRenderer key={`content-${i}`} markdown={part.data} />;

          case 'artifact': {
            const artifact = part as ArtifactPart;
            if (renderArtifact) {
              return <React.Fragment key={artifact.id || `artifact-${i}`}>{renderArtifact(artifact)}</React.Fragment>;
            }
            return (
              <ArtifactRenderer
                key={artifact.id || `artifact-${i}`}
                data={artifact.data}
                artifactType={artifact.artifactType}
                id={artifact.id}
                components={components}
                onAction={onAction}
              />
            );
          }

          case 'customMarkdown': {
            const cm = part as CustomMarkdownPart;
            return (
              <ContentRenderer
                key={`custommd-${i}`}
                markdown={cm.data.content}
              />
            );
          }
        }
      })}

      {/* Streaming cursor */}
      {isStreaming && <span className="c0-cursor" />}
    </div>
  );
}
