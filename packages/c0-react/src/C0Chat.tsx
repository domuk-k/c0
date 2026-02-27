import React, { useCallback, useRef, useState } from 'react';

import { useThread } from './hooks/useThread.js';
import { StreamingProvider } from './hooks/useStreaming.js';
import { ActionProvider } from './hooks/useAction.js';
import { StreamRenderer } from './renderer/StreamRenderer.js';
import type { C0ChatProps, C0Action } from './types.js';

/**
 * Main chat component — the c0 equivalent of C1Chat.
 *
 * Drop-in replacement that connects to any LLM directly
 * (no thesys.dev proxy needed).
 *
 * @example
 * ```tsx
 * <C0Chat
 *   apiUrl="/api/chat"
 *   theme="dark"
 *   welcomeMessage={{
 *     title: "Hi! I'm c0 Assistant",
 *     description: "I can create charts, tables, and forms for you.",
 *   }}
 * />
 * ```
 */
export function C0Chat({
  apiUrl,
  processMessage,
  components,
  theme = 'light',
  welcomeMessage,
  starters,
  onAction,
  className,
}: C0ChatProps) {
  const { thread, isStreaming, sendMessage, cancelStream, clearThread } =
    useThread({ apiUrl, processMessage });
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isStreaming) return;

      setInput('');
      await sendMessage(trimmed);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    },
    [input, isStreaming, sendMessage],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit],
  );

  const handleStarterClick = useCallback(
    (prompt: string) => {
      sendMessage(prompt);
    },
    [sendMessage],
  );

  const handleAction = useCallback(
    (action: C0Action) => {
      onAction?.(action);
    },
    [onAction],
  );

  const isEmpty = thread.messages.length === 0;

  return (
    <StreamingProvider value={isStreaming}>
      <ActionProvider value={handleAction}>
        <div
          className={`c0-chat c0-theme-${theme} ${className ?? ''}`}
          data-theme={theme}
        >
          {/* Messages area */}
          <div className="c0-messages">
            {/* Welcome screen */}
            {isEmpty && welcomeMessage && (
              <div className="c0-welcome">
                <h1 className="c0-welcome-title">{welcomeMessage.title}</h1>
                <p className="c0-welcome-desc">
                  {welcomeMessage.description}
                </p>

                {starters && starters.length > 0 && (
                  <div className="c0-starters">
                    {starters.map((s, i) => (
                      <button
                        key={i}
                        className="c0-starter"
                        onClick={() => handleStarterClick(s.prompt)}
                        type="button"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Message list */}
            {thread.messages.map((msg) => (
              <div
                key={msg.id}
                className={`c0-message c0-message-${msg.role}`}
              >
                {msg.role === 'user' ? (
                  <div className="c0-user-content">{msg.content}</div>
                ) : (
                  <StreamRenderer
                    content={msg.content}
                    isStreaming={isStreaming && msg === thread.messages.at(-1)}
                    components={components}
                    onAction={handleAction}
                  />
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form className="c0-input-area" onSubmit={handleSubmit}>
            <div className="c0-input-wrapper">
              <textarea
                ref={inputRef}
                className="c0-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                disabled={isStreaming}
              />
              <div className="c0-input-actions">
                {isStreaming ? (
                  <button
                    className="c0-btn c0-btn-cancel"
                    onClick={cancelStream}
                    type="button"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    className="c0-btn c0-btn-send"
                    type="submit"
                    disabled={!input.trim()}
                  >
                    Send
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </ActionProvider>
    </StreamingProvider>
  );
}
