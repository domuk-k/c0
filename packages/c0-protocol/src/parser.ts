/**
 * Streaming XML-DSL parser for c0.
 *
 * Reverse-engineered from C1's xmlParser-B5C8tiiX.js.
 * Uses htmlparser2 in XML mode for incremental parsing,
 * and immer for immutable state updates on each chunk.
 */

import { Parser } from 'htmlparser2';
import { produce } from 'immer';

import type {
  ArtifactPart,
  ContentPart,
  CustomMarkdownPart,
  MessagePart,
  ParsedResponse,
  ParserState,
  StreamParser,
  TagName,
  ThinkItem,
} from './types.js';

// ─── Initial State ────────────────────────────────────────

function initialState(): ParserState {
  return {
    currentTag: undefined,
    parts: [],
    think: [],
    context: '',
    isContentClosed: false,
  };
}

// ─── Index Helpers ────────────────────────────────────────

function findContentIndex(parts: MessagePart[]): number {
  return parts.findIndex((p) => p.type === 'content');
}

function findLastArtifactIndex(parts: MessagePart[]): number {
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i].type === 'artifact') return i;
  }
  return -1;
}

function findLastCustomMarkdownIndex(parts: MessagePart[]): number {
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i].type === 'customMarkdown') return i;
  }
  return -1;
}

// ─── Tag Open Handler ─────────────────────────────────────

function handleOpenTag(
  state: ParserState,
  name: string,
  attrs: Record<string, string>,
): void {
  state.currentTag = name as TagName;

  switch (name) {
    case 'content': {
      state.isContentClosed = false;
      const idx = findContentIndex(state.parts);
      if (idx !== -1) {
        (state.parts[idx] as ContentPart).data = '';
      } else {
        state.parts.push({ type: 'content', data: '' });
      }
      break;
    }

    case 'artifact': {
      const id = attrs.id ?? crypto.randomUUID();
      const version = attrs.version ? parseInt(attrs.version, 10) : 1;
      const existingIdx = state.parts.findIndex(
        (p) => p.type === 'artifact' && (p as ArtifactPart).id === id,
      );

      if (existingIdx === -1) {
        state.parts.push({
          type: 'artifact',
          artifactType: attrs.type || 'slides',
          data: '',
          diff: '',
          version,
          id,
          isDiffClosed: true,
        });
      } else {
        (state.parts[existingIdx] as ArtifactPart).data = '';
      }
      break;
    }

    case 'artifact_diff': {
      const idx = findLastArtifactIndex(state.parts);
      if (idx !== -1) {
        const artifact = state.parts[idx] as ArtifactPart;
        artifact.diff = '';
        artifact.isDiffClosed = false;
      }
      break;
    }

    case 'context':
      state.context = '';
      break;

    case 'thinkitem':
      state.think.push({
        title: '',
        content: '',
        ephemeral: attrs.ephemeral === 'true',
      });
      break;

    case 'custommarkdown':
      state.parts.push({
        type: 'customMarkdown',
        data: { content: '' },
      });
      break;
  }
}

// ─── Text Handler ─────────────────────────────────────────

function handleText(state: ParserState, text: string): void {
  switch (state.currentTag) {
    case 'content': {
      const idx = findContentIndex(state.parts);
      if (idx !== -1) {
        (state.parts[idx] as ContentPart).data += text;
      }
      break;
    }

    case 'artifact': {
      const idx = findLastArtifactIndex(state.parts);
      if (idx !== -1) {
        (state.parts[idx] as ArtifactPart).data += text;
      }
      break;
    }

    case 'artifact_diff': {
      const idx = findLastArtifactIndex(state.parts);
      if (idx !== -1) {
        (state.parts[idx] as ArtifactPart).diff += text;
      }
      break;
    }

    case 'context':
      state.context += text;
      break;

    case 'thinkitem':
      // Ignore text directly inside <thinkitem> (only children matter)
      break;

    case 'thinkitemtitle': {
      const item = state.think[state.think.length - 1];
      if (item) item.title += text;
      break;
    }

    case 'thinkitemcontent': {
      const item = state.think[state.think.length - 1];
      if (item) item.content += text;
      break;
    }

    case 'custommarkdown': {
      const idx = findLastCustomMarkdownIndex(state.parts);
      if (idx !== -1) {
        (state.parts[idx] as CustomMarkdownPart).data.content += text;
      }
      break;
    }

    default: {
      // Text outside any known tag → treat as content
      const idx = findContentIndex(state.parts);
      if (idx !== -1) {
        (state.parts[idx] as ContentPart).data += text;
      } else {
        state.parts.push({ type: 'content', data: text });
      }
    }
  }
}

// ─── Close Tag Handler ────────────────────────────────────

function handleCloseTag(state: ParserState): void {
  if (
    state.currentTag === 'content' ||
    state.currentTag === 'artifact' ||
    state.currentTag === 'artifact_diff'
  ) {
    state.isContentClosed = true;
  }

  if (state.currentTag === 'artifact_diff') {
    const idx = findLastArtifactIndex(state.parts);
    if (idx !== -1) {
      (state.parts[idx] as ArtifactPart).isDiffClosed = true;
    }
  }

  state.currentTag = undefined;
}

// ─── State → Response ─────────────────────────────────────

function toResponse(state: ParserState): ParsedResponse {
  return {
    parts: state.parts,
    think: state.think,
    context: state.context,
    isContentClosed: state.isContentClosed,
  };
}

// ─── Public API ───────────────────────────────────────────

/**
 * Create a streaming XML-DSL parser.
 *
 * Call `write(chunk)` for each streamed chunk.
 * Call `getResult()` at any time to get the current parsed state.
 *
 * @example
 * ```ts
 * const parser = createStreamParser();
 * parser.write('<content thesys="true">Hello');
 * parser.write(' world</content>');
 * const result = parser.getResult();
 * // result.parts[0] = { type: 'content', data: 'Hello world' }
 * ```
 */
export function createStreamParser(): StreamParser {
  let state = initialState();

  const parser = new Parser(
    {
      onopentag(name, attrs) {
        state = produce(state, (draft) => {
          handleOpenTag(draft, name, attrs);
        });
      },
      ontext(text) {
        state = produce(state, (draft) => {
          handleText(draft, text);
        });
      },
      onclosetag() {
        state = produce(state, (draft) => {
          handleCloseTag(draft);
        });
      },
    },
    { xmlMode: true, decodeEntities: true },
  );

  return {
    write(chunk: string) {
      parser.write(chunk);
    },
    getResult() {
      return toResponse(state);
    },
    reset() {
      state = initialState();
    },
  };
}

/**
 * Parse a complete XML-DSL string in one shot.
 * Convenience wrapper for non-streaming use cases.
 */
export function parseResponse(xml: string): ParsedResponse {
  const parser = createStreamParser();
  parser.write(xml);
  return parser.getResult();
}
