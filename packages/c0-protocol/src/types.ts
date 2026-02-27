// ─── Message Part Types ───────────────────────────────────

export interface ContentPart {
  type: 'content';
  data: string;
}

export interface ArtifactPart {
  type: 'artifact';
  artifactType: string;
  id: string;
  version: number;
  data: string;
  diff: string;
  isDiffClosed: boolean;
}

export interface CustomMarkdownPart {
  type: 'customMarkdown';
  data: { content: string };
}

export type MessagePart = ContentPart | ArtifactPart | CustomMarkdownPart;

// ─── Think Items ──────────────────────────────────────────

export interface ThinkItem {
  title: string;
  content: string;
  ephemeral: boolean;
}

// ─── Parsed Response ──────────────────────────────────────

export interface ParsedResponse {
  parts: MessagePart[];
  think: ThinkItem[];
  context: string;
  isContentClosed: boolean;
}

// ─── Parser Options ──────────────────────────────────────

export interface StreamParserOptions {
  onArtifact?: (artifact: ArtifactPart) => void;
  onThink?: (item: ThinkItem) => void;
  onContent?: (content: string) => void;
  /**
   * When true, attempt to repair malformed JSON in artifact data
   * before firing the onArtifact callback. Useful for weak/small models
   * that produce trailing commas, unclosed brackets, or single quotes.
   * Default: false.
   */
  repairJson?: boolean;
}

// ─── Parser Interface ─────────────────────────────────────

export interface StreamParser {
  /** Feed a chunk of XML-DSL into the parser */
  write(chunk: string): void;
  /** Get current parsed state (safe to call during streaming) */
  getResult(): ParsedResponse;
  /** Alias for getResult() */
  getState(): ParsedResponse;
  /** Reset parser to initial state */
  reset(): void;
}

// ─── Artifact Metadata ────────────────────────────────────

export interface ArtifactMeta {
  type: string;
  id: string;
  version: number;
}

// ─── Internal Parser State ────────────────────────────────

export type TagName =
  | 'content'
  | 'artifact'
  | 'artifact_diff'
  | 'context'
  | 'thinkitem'
  | 'thinkitemtitle'
  | 'thinkitemcontent'
  | 'custommarkdown';

export interface ParserState {
  currentTag: TagName | undefined;
  parts: MessagePart[];
  think: ThinkItem[];
  context: string;
  isContentClosed: boolean;
}
