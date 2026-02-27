/**
 * Serialize ParsedResponse back to XML-DSL string.
 * Useful for message storage and conversation history.
 *
 * Mirrors C1's serialization (function U in xmlParser).
 */

import type { ArtifactPart, ParsedResponse } from './types.js';
import {
  wrapArtifact,
  wrapArtifactDiff,
  wrapContent,
  wrapContext,
  wrapCustomMarkdown,
  wrapThinkItem,
} from './tags.js';

export function serializeResponse(response: ParsedResponse): string {
  let result = '';

  // Think items first (matches C1 output order)
  for (const item of response.think) {
    result += wrapThinkItem(item.title, item.content, item.ephemeral);
  }

  // Message parts
  for (const part of response.parts) {
    switch (part.type) {
      case 'content':
        result += wrapContent(part.data);
        break;
      case 'customMarkdown':
        result += wrapCustomMarkdown(part.data.content);
        break;
      case 'artifact': {
        const artifact = part as ArtifactPart;
        result += wrapArtifact(artifact.data, {
          type: artifact.artifactType,
          id: artifact.id,
          version: artifact.version,
        });
        if (artifact.diff) {
          result += wrapArtifactDiff(artifact.diff);
        }
        break;
      }
    }
  }

  // Context last
  if (response.context) {
    result += wrapContext(response.context);
  }

  return result;
}

/**
 * Extract context from a raw c0 response string.
 * Returns the response without context tags and the extracted context.
 */
export function extractContext(raw: string): {
  response: string;
  context: string;
} {
  const openTag = '<context>';
  const closeTag = '</context>';
  const startIdx = raw.indexOf(openTag);
  const endIdx = raw.indexOf(closeTag);

  if (startIdx !== -1 && endIdx > startIdx) {
    const response =
      raw.slice(0, startIdx) + raw.slice(endIdx + closeTag.length);
    const context = raw.slice(startIdx + openTag.length, endIdx);
    return { response, context };
  }

  return { response: raw, context: '' };
}
