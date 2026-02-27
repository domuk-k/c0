import React, { useCallback, useMemo } from 'react';

import { useThread } from '../hooks/useThread.js';
import { StreamingProvider } from '../hooks/useStreaming.js';
import { ActionProvider } from '../hooks/useAction.js';
import { C0ChatProvider } from './context.js';
import type { C0Action, C0ComponentLibrary, ProcessMessageParams } from '../types.js';
import type { ReactNode } from 'react';
import type { ArtifactPart, ThinkItem } from '@c0-ui/protocol';

export interface RootProps {
  /** API endpoint URL for message processing */
  apiUrl?: string;
  /** Custom message processor (alternative to apiUrl) */
  processMessage?: (params: ProcessMessageParams) => Promise<Response>;
  /** Custom component library for artifact rendering */
  components?: C0ComponentLibrary;
  /** Callback when user performs an action in a component */
  onAction?: (action: C0Action) => void;
  /** Custom artifact renderer */
  renderArtifact?: (artifact: ArtifactPart) => ReactNode;
  /** Custom think renderer */
  renderThink?: (items: ThinkItem[], isStreaming: boolean) => ReactNode;
  /** Theme mode */
  theme?: 'light' | 'dark';
  /** CSS class name */
  className?: string;
  children: ReactNode;
}

/**
 * Root provider for C0Chat compound components.
 * Manages thread state and provides context to child components.
 *
 * @example
 * ```tsx
 * import * as Chat from '@c0-ui/react/chat';
 *
 * <Chat.Root apiUrl="/api/chat" theme="dark">
 *   <Chat.Welcome title="Hello!" description="How can I help?" />
 *   <Chat.MessageList />
 *   <Chat.Input />
 * </Chat.Root>
 * ```
 */
export function Root({
  apiUrl,
  processMessage,
  components,
  onAction,
  renderArtifact,
  renderThink,
  theme = 'light',
  className,
  children,
}: RootProps) {
  const { thread, isStreaming, sendMessage, cancelStream, clearThread } =
    useThread({ apiUrl, processMessage });

  const handleAction = useCallback(
    (action: C0Action) => {
      onAction?.(action);
    },
    [onAction],
  );

  const contextValue = useMemo(
    () => ({
      thread,
      isStreaming,
      sendMessage,
      cancelStream,
      clearThread,
      components,
      onAction: handleAction,
      renderArtifact,
      renderThink,
    }),
    [
      thread,
      isStreaming,
      sendMessage,
      cancelStream,
      clearThread,
      components,
      handleAction,
      renderArtifact,
      renderThink,
    ],
  );

  return (
    <C0ChatProvider value={contextValue}>
      <StreamingProvider value={isStreaming}>
        <ActionProvider value={handleAction}>
          <div
            className={`c0-chat c0-theme-${theme} ${className ?? ''}`}
            data-theme={theme}
          >
            {children}
          </div>
        </ActionProvider>
      </StreamingProvider>
    </C0ChatProvider>
  );
}
