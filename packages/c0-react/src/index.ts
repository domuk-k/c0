// Main component
export { C0Chat } from './C0Chat.js';

// Renderers (for building custom UIs)
export { StreamRenderer } from './renderer/StreamRenderer.js';
export { ContentRenderer } from './renderer/ContentRenderer.js';
export { ArtifactRenderer } from './renderer/ArtifactRenderer.js';
export { ThinkRenderer } from './renderer/ThinkRenderer.js';

// Hooks
export { useThread } from './hooks/useThread.js';
export { useIsStreaming } from './hooks/useStreaming.js';
export { useOnAction } from './hooks/useAction.js';
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
