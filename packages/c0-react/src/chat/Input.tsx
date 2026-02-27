import React, { useCallback, useRef, useState } from 'react';

import { useC0Chat } from './context.js';

export interface InputProps {
  /** Placeholder text */
  placeholder?: string;
  /** CSS class name */
  className?: string;
}

/**
 * Chat input with send/cancel controls.
 * Must be used inside a `<Chat.Root>`.
 *
 * @example
 * ```tsx
 * <Chat.Input placeholder="Ask anything..." />
 * ```
 */
export function Input({ placeholder = 'Type a message...', className }: InputProps) {
  const { isStreaming, sendMessage, cancelStream } = useC0Chat();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isStreaming) return;

      setInput('');
      await sendMessage(trimmed);
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

  return (
    <form className={`c0-input-area ${className ?? ''}`} onSubmit={handleSubmit}>
      <div className="c0-input-wrapper">
        <textarea
          ref={inputRef}
          className="c0-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
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
  );
}
