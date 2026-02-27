import { createContext, useContext } from 'react';

import type { C0Thread, C0Action, C0ComponentLibrary } from '../types.js';
import type { ReactNode } from 'react';
import type { ArtifactPart, ThinkItem } from '@c0-ui/protocol';

// ─── Context Value ───────────────────────────────────────

export interface C0ChatContextValue {
  thread: C0Thread;
  isStreaming: boolean;
  sendMessage: (content: string) => Promise<void>;
  cancelStream: () => void;
  clearThread: () => void;
  // Renderer customization passed through from Root
  components?: C0ComponentLibrary;
  onAction?: (action: C0Action) => void;
  renderArtifact?: (artifact: ArtifactPart) => ReactNode;
  renderThink?: (items: ThinkItem[], isStreaming: boolean) => ReactNode;
}

// ─── Context ─────────────────────────────────────────────

const C0ChatContext = createContext<C0ChatContextValue | null>(null);
C0ChatContext.displayName = 'C0ChatContext';

export const C0ChatProvider = C0ChatContext.Provider;

// ─── Hook ────────────────────────────────────────────────

/**
 * Access the C0Chat compound context.
 * Must be used inside a `<Chat.Root>` or `<C0Chat>`.
 *
 * @example
 * ```tsx
 * function CustomControls() {
 *   const { isStreaming, cancelStream, clearThread } = useC0Chat();
 *   return (
 *     <div>
 *       {isStreaming && <button onClick={cancelStream}>Stop</button>}
 *       <button onClick={clearThread}>New Chat</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useC0Chat(): C0ChatContextValue {
  const ctx = useContext(C0ChatContext);
  if (!ctx) {
    throw new Error(
      'useC0Chat must be used inside <Chat.Root> or <C0Chat>. ' +
        'Wrap your component tree with a Root provider.',
    );
  }
  return ctx;
}
