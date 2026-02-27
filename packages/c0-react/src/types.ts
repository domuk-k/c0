import type { ComponentType, ReactNode } from 'react';
import type { ArtifactPart, ParsedResponse, ThinkItem } from '@c0-ui/protocol';

// ─── Message Types ────────────────────────────────────────

export interface C0Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

// ─── Thread Types ─────────────────────────────────────────

export interface C0Thread {
  id: string;
  title: string;
  messages: C0Message[];
  createdAt: number;
  isRunning: boolean;
}

// ─── Action Types ─────────────────────────────────────────

export interface C0Action {
  type: string;
  params?: Record<string, unknown>;
  humanLabel: string;
  llmContext: string;
}

// ─── Component Library ────────────────────────────────────

export type C0ComponentLibrary = Record<string, ComponentType<any>>;

// ─── Process Message ──────────────────────────────────────

export interface ProcessMessageParams {
  threadId: string;
  messages: C0Message[];
  responseId: string;
  abortController: AbortController;
}

// ─── C0Chat Props ─────────────────────────────────────────

export interface C0ChatProps {
  /** API endpoint URL for message processing */
  apiUrl?: string;

  /** Custom message processor (alternative to apiUrl) */
  processMessage?: (params: ProcessMessageParams) => Promise<Response>;

  /** Custom component library for artifact rendering */
  components?: C0ComponentLibrary;

  /** Theme mode */
  theme?: 'light' | 'dark';

  /** Welcome message shown on empty thread */
  welcomeMessage?: {
    title: string;
    description: string;
  };

  /** Conversation starters */
  starters?: Array<{ label: string; prompt: string }>;

  /** Callback when user performs an action in a component */
  onAction?: (action: C0Action) => void;

  /** Custom artifact renderer (overrides built-in ArtifactRenderer) */
  renderArtifact?: (artifact: ArtifactPart) => ReactNode;

  /** Custom think renderer (overrides built-in ThinkRenderer) */
  renderThink?: (items: ThinkItem[], isStreaming: boolean) => ReactNode;

  /** CSS class name */
  className?: string;
}

// ─── Renderer Props ───────────────────────────────────────

export interface StreamRendererProps {
  content: string;
  isStreaming: boolean;
  components?: C0ComponentLibrary;
  onAction?: (action: C0Action) => void;
  /** Custom artifact renderer (overrides built-in ArtifactRenderer) */
  renderArtifact?: (artifact: ArtifactPart) => ReactNode;
  /** Custom think renderer (overrides built-in ThinkRenderer) */
  renderThink?: (items: ThinkItem[], isStreaming: boolean) => ReactNode;
}

export interface ContentRendererProps {
  markdown: string;
}

export interface ArtifactRendererProps {
  data: string;
  artifactType: string;
  id: string;
  components?: C0ComponentLibrary;
  onAction?: (action: C0Action) => void;
}

export interface ThinkRendererProps {
  items: ParsedResponse['think'];
  isStreaming?: boolean;
}
