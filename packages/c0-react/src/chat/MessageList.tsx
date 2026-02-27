import React, { useEffect, useRef } from 'react';

import { StreamRenderer } from '../renderer/StreamRenderer.js';
import { useC0Chat } from './context.js';
import type { ReactNode } from 'react';
import type { C0ComponentLibrary } from '../types.js';
import type { ArtifactPart, ThinkItem } from '@c0-ui/protocol';

export interface MessageListProps {
  /** Override component library (defaults to Root's components) */
  components?: C0ComponentLibrary;
  /** Override artifact renderer (defaults to Root's renderArtifact) */
  renderArtifact?: (artifact: ArtifactPart) => ReactNode;
  /** Override think renderer (defaults to Root's renderThink) */
  renderThink?: (items: ThinkItem[], isStreaming: boolean) => ReactNode;
  /** Custom user message renderer */
  renderUserMessage?: (content: string) => ReactNode;
  /** CSS class name */
  className?: string;
}

/**
 * Renders the message list from C0Chat context.
 * Must be used inside a `<Chat.Root>`.
 *
 * @example
 * ```tsx
 * <Chat.MessageList
 *   renderArtifact={(artifact) => <CustomArtifact artifact={artifact} />}
 *   renderUserMessage={(content) => <UserBubble>{content}</UserBubble>}
 * />
 * ```
 */
export function MessageList({
  components: componentsProp,
  renderArtifact: renderArtifactProp,
  renderThink: renderThinkProp,
  renderUserMessage,
  className,
}: MessageListProps) {
  const ctx = useC0Chat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Local props override Root-level context
  const components = componentsProp ?? ctx.components;
  const renderArtifact = renderArtifactProp ?? ctx.renderArtifact;
  const renderThink = renderThinkProp ?? ctx.renderThink;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ctx.thread.messages]);

  return (
    <div className={`c0-messages ${className ?? ''}`}>
      {ctx.thread.messages.map((msg) => (
        <div key={msg.id} className={`c0-message c0-message-${msg.role}`}>
          {msg.role === 'user' ? (
            renderUserMessage ? (
              renderUserMessage(msg.content)
            ) : (
              <div className="c0-user-content">{msg.content}</div>
            )
          ) : (
            <StreamRenderer
              content={msg.content}
              isStreaming={
                ctx.isStreaming && msg === ctx.thread.messages.at(-1)
              }
              components={components}
              onAction={ctx.onAction}
              renderArtifact={renderArtifact}
              renderThink={renderThink}
            />
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
