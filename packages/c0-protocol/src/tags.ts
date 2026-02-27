/**
 * XML tag builders for the c0 streaming protocol.
 *
 * These mirror C1's internal tag format:
 *   <content thesys="true">...</content>
 *   <artifact type="..." id="..." version="...">...</artifact>
 *   <thinkitem ephemeral="true|false">
 *     <thinkitemtitle>...</thinkitemtitle>
 *     <thinkitemcontent>...</thinkitemcontent>
 *   </thinkitem>
 *   <context>...</context>
 *   <custommarkdown>...</custommarkdown>
 */

// ─── Tag Names ────────────────────────────────────────────

export const TAGS = {
  CONTENT: 'content',
  ARTIFACT: 'artifact',
  ARTIFACT_DIFF: 'artifact_diff',
  CONTEXT: 'context',
  THINK_ITEM: 'thinkitem',
  THINK_TITLE: 'thinkitemtitle',
  THINK_CONTENT: 'thinkitemcontent',
  CUSTOM_MARKDOWN: 'custommarkdown',
} as const;

// ─── Helpers ──────────────────────────────────────────────

function openTag(
  name: string,
  attrs?: Record<string, string>,
): string {
  const attrStr = attrs
    ? ' ' + Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')
    : '';
  return `<${name}${attrStr}>`;
}

function closeTag(name: string): string {
  return `</${name}>`;
}

/**
 * Escape HTML entities for safe embedding in XML.
 * Matches lodash/escape behavior used by C1.
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function unescapeXml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// ─── Tag Builders ─────────────────────────────────────────

export function wrapContent(text: string): string {
  return `${openTag(TAGS.CONTENT, { thesys: 'true' })}${escapeXml(text)}${closeTag(TAGS.CONTENT)}`;
}

export function wrapArtifact(
  data: string,
  meta: { type: string; id: string; version: number },
): string {
  return `${openTag(TAGS.ARTIFACT, {
    type: meta.type,
    id: meta.id,
    version: String(meta.version),
  })}${escapeXml(data)}${closeTag(TAGS.ARTIFACT)}`;
}

export function wrapArtifactDiff(diff: string): string {
  return `${openTag(TAGS.ARTIFACT_DIFF)}${escapeXml(diff)}${closeTag(TAGS.ARTIFACT_DIFF)}`;
}

export function wrapContext(context: string): string {
  return `${openTag(TAGS.CONTEXT)}${escapeXml(context)}${closeTag(TAGS.CONTEXT)}`;
}

export function wrapThinkItem(
  title: string,
  content: string,
  ephemeral: boolean = true,
): string {
  const titleTag = `${openTag(TAGS.THINK_TITLE)}${escapeXml(title)}${closeTag(TAGS.THINK_TITLE)}`;
  const contentTag = `${openTag(TAGS.THINK_CONTENT)}${escapeXml(content)}${closeTag(TAGS.THINK_CONTENT)}`;
  const attrs = ephemeral ? { ephemeral: 'true' } : undefined;
  return `${openTag(TAGS.THINK_ITEM, attrs)}${titleTag}${contentTag}${closeTag(TAGS.THINK_ITEM)}`;
}

export function wrapCustomMarkdown(markdown: string): string {
  return `${openTag(TAGS.CUSTOM_MARKDOWN)}${escapeXml(markdown)}${closeTag(TAGS.CUSTOM_MARKDOWN)}`;
}
