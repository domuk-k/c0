// Types
export type {
  ArtifactMeta,
  ArtifactPart,
  ContentPart,
  CustomMarkdownPart,
  MessagePart,
  ParsedResponse,
  StreamParser,
  StreamParserOptions,
  ThinkItem,
} from './types.js';

// Parser
export { createStreamParser, parseResponse } from './parser.js';

// Serializer
export { extractContext, serializeResponse } from './serializer.js';

// JSON repair
export { repairJson } from './repair.js';

// Tag builders
export {
  escapeXml,
  TAGS,
  unescapeXml,
  wrapArtifact,
  wrapArtifactDiff,
  wrapContent,
  wrapContext,
  wrapCustomMarkdown,
  wrapThinkItem,
} from './tags.js';
