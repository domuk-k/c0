// Main component
export { C0Chat } from './C0Chat.js';

// Compound components (Radix-style)
export {
  Root as ChatRoot,
  MessageList as ChatMessageList,
  Input as ChatInput,
  Welcome as ChatWelcome,
  useC0Chat,
} from './chat/index.js';

// Renderers (for building custom UIs)
export { StreamRenderer } from './renderer/StreamRenderer.js';
export { ContentRenderer } from './renderer/ContentRenderer.js';
export { ArtifactRenderer } from './renderer/ArtifactRenderer.js';
export { ThinkRenderer } from './renderer/ThinkRenderer.js';

// Default renderer registry
export { DEFAULT_RENDERERS } from './renderer/registry.js';

// Hooks
export { useThread } from './hooks/useThread.js';
export { useIsStreaming, StreamingProvider } from './hooks/useStreaming.js';
export { useOnAction, ActionProvider } from './hooks/useAction.js';
export { useC0State } from './hooks/useC0State.js';

// Types
export type {
  C0Action,
  C0ChatProps,
  C0ComponentLibrary,
  C0Message,
  C0Thread,
  ProcessMessageParams,
} from './types.js';

export type { C0ChatContextValue } from './chat/context.js';
