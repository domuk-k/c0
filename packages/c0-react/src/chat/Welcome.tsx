import React, { useCallback } from 'react';

import { useC0Chat } from './context.js';

export interface WelcomeProps {
  /** Welcome title */
  title: string;
  /** Welcome description */
  description: string;
  /** Conversation starters */
  starters?: Array<{ label: string; prompt: string }>;
  /** CSS class name */
  className?: string;
}

/**
 * Welcome screen shown when the thread has no messages.
 * Automatically hides when the conversation starts.
 * Must be used inside a `<Chat.Root>`.
 *
 * @example
 * ```tsx
 * <Chat.Welcome
 *   title="Hello!"
 *   description="I can help you with data analysis."
 *   starters={[
 *     { label: "Summarize data", prompt: "Summarize this dataset..." },
 *   ]}
 * />
 * ```
 */
export function Welcome({ title, description, starters, className }: WelcomeProps) {
  const { thread, sendMessage } = useC0Chat();

  const handleStarterClick = useCallback(
    (prompt: string) => {
      sendMessage(prompt);
    },
    [sendMessage],
  );

  if (thread.messages.length > 0) return null;

  return (
    <div className={`c0-welcome ${className ?? ''}`}>
      <h1 className="c0-welcome-title">{title}</h1>
      <p className="c0-welcome-desc">{description}</p>

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
  );
}
