/** System prompts that instruct LLMs to output c0 XML-DSL format. */

// ─── Artifact Type Spec ──────────────────────────────────

export interface ArtifactTypeSpec {
  name: string;
  component: string;
  schema: string;
  description?: string;
}

// ─── Default Artifact Types (21 WS-native types) ────────
//
// These match workflow-studio's artifact registry exactly.
// Schemas use direct data format (NOT { component, props } wrapper).
// When consumed as a library, callers can inject custom types via
// createSystemPrompt({ artifactTypes: [...] }).

export const DEFAULT_ARTIFACT_TYPES: ArtifactTypeSpec[] = [
  // ── Table ──
  {
    name: 'table',
    component: 'Table',
    description: 'Read-only data table with columns and rows. Use statusMap for badge colors, format for numbers.',
    schema: `{
  "columns": [
    { "key": "name", "label": "Name", "type": "text" },
    { "key": "amount", "label": "Amount", "type": "number", "format": "currency" },
    { "key": "status", "label": "Status", "type": "badge", "statusMap": { "match": "success", "mismatch": "error" } }
  ],
  "rows": [],
  "meta": { "rowCount": 0 }
}`,
  },
  {
    name: 'editable-table',
    component: 'EditableTable',
    description: 'Interactive table with inline editing.',
    schema: `{
  "columns": [
    { "key": "item", "label": "Item", "type": "text", "editable": true },
    { "key": "status", "label": "Status", "type": "select", "editable": true, "options": ["approved", "pending"] }
  ],
  "rows": []
}`,
  },
  {
    name: 'status-board',
    component: 'StatusBoard',
    description: 'Kanban-style board with columns and cards.',
    schema: `{
  "columns": [{ "key": "todo", "label": "To Do" }, { "key": "done", "label": "Done" }],
  "items": []
}`,
  },
  // ── Document ──
  {
    name: 'document',
    component: 'Document',
    description: 'Single document with metadata.',
    schema: `{ "filename": "", "mimeType": "" }`,
  },
  {
    name: 'document-collection',
    component: 'DocumentCollection',
    description: 'Multiple documents with metadata.',
    schema: `{ "documents": [], "totalSize": 0 }`,
  },
  {
    name: 'markdown',
    component: 'Markdown',
    description: 'Rich text content in Markdown.',
    schema: `{ "content": "" }`,
  },
  {
    name: 'report',
    component: 'Report',
    description: 'Generated report with sections.',
    schema: `{ "formats": ["pdf"], "sections": [{ "title": "", "summary": "" }] }`,
  },
  // ── File ──
  {
    name: 'file-download',
    component: 'FileDownload',
    description: 'Downloadable files.',
    schema: `{ "files": [] }`,
  },
  {
    name: 'file-upload',
    component: 'FileUpload',
    description: 'File upload input.',
    schema: `{ "multiple": true, "accept": "", "label": "Drop files here" }`,
  },
  {
    name: 'image',
    component: 'Image',
    description: 'Image display (single, grid, carousel).',
    schema: `{ "images": [], "display": "grid" }`,
  },
  // ── Structured ──
  {
    name: 'comparison',
    component: 'Comparison',
    description: 'Field-by-field comparison between sources.',
    schema: `{
  "sources": { "left": "Source A", "right": "Source B" },
  "summary": { "total": 0, "match": 0, "fail": 0 },
  "rows": []
}`,
  },
  {
    name: 'key-value',
    component: 'KeyValue',
    description: 'Label-value pairs with badges and confidence.',
    schema: `{ "entries": [{ "key": "field", "value": "", "confidence": 0.95 }] }`,
  },
  {
    name: 'summary',
    component: 'Summary',
    description: 'Metric cards with values, variants, and trend indicators.',
    schema: `{
  "items": [
    { "label": "Total", "value": 0, "variant": "default", "trend": "stable" }
  ],
  "gridCols": 2
}`,
  },
  {
    name: 'chart',
    component: 'Chart',
    description: 'Data visualization (bar, line, pie, sparkline).',
    schema: `{
  "chartType": "bar",
  "labels": ["Q1", "Q2", "Q3", "Q4"],
  "datasets": [{ "label": "Revenue", "values": [100, 200, 150, 250] }]
}`,
  },
  {
    name: 'diff',
    component: 'Diff',
    description: 'Before/after comparison of changes.',
    schema: `{ "mode": "structured", "changes": [] }`,
  },
  {
    name: 'form',
    component: 'Form',
    description: 'Input form with typed fields.',
    schema: `{
  "fields": [
    { "key": "email", "label": "Email", "type": "text", "required": true },
    { "key": "role", "label": "Role", "type": "select", "options": ["Admin", "User"] }
  ],
  "submitLabel": "Submit"
}`,
  },
  {
    name: 'approval-card',
    component: 'ApprovalCard',
    description: 'Approval request with summary and impact.',
    schema: `{ "title": "", "requester": "", "summary": [], "impact": "" }`,
  },
  // ── Text ──
  {
    name: 'notification',
    component: 'Notification',
    description: 'Sent/pending notification.',
    schema: `{ "channel": "email", "recipients": "", "preview": { "body": "" }, "status": "pending" }`,
  },
  {
    name: 'timeline',
    component: 'Timeline',
    description: 'Chronological event timeline.',
    schema: `{ "events": [] }`,
  },
  {
    name: 'progress-bar',
    component: 'ProgressBar',
    description: 'Step-by-step progress indicator.',
    schema: `{ "steps": [], "percentage": 0 }`,
  },
  // ── Composed ──
  {
    name: 'composed',
    component: 'Composed',
    description: 'Composite artifact from child artifact tree.',
    schema: `{ "composition": { "type": "row", "children": [] } }`,
  },
];

// ─── Base Prompt ─────────────────────────────────────────

export const BASE_PROMPT = `You are a UI-generating assistant. You create rich, interactive user interfaces by outputting structured XML-DSL responses.

## Response Format

Your responses use XML tags to structure different types of content:

### Text Content
Wrap explanatory text in <content> tags. Use markdown inside:
<content>Here is a **summary** of the data you requested.</content>

### Rich Components (Artifacts)
For interactive UI components, use <artifact> tags with a type, unique id, and version:
<artifact type="TYPE" id="UNIQUE_ID" version="1">
DATA_JSON
</artifact>

The DATA_JSON is the artifact's data object — its shape depends on the type.
The type attribute determines which renderer is used. Do NOT wrap data in { "component", "props" }.`;

const THINKING_SECTION = `

### Thinking Steps (Optional)
Show your reasoning with <thinkitem> tags:
<thinkitem ephemeral="true">
<thinkitemtitle>Step title</thinkitemtitle>
<thinkitemcontent>Detailed reasoning...</thinkitemcontent>
</thinkitem>

Set ephemeral="true" for steps that should fade after completion.
Set ephemeral="false" for persistent reasoning that stays visible.`;

const RULES_SECTION = `

## Rules
1. Always use <content> for text explanations between components
2. Use <artifact> for any interactive/visual element
3. Each artifact MUST have a unique id (use descriptive names like "sales-chart" or "user-table")
4. Generate valid JSON in artifacts — no trailing commas, no comments
5. Choose the most appropriate component type for the data
6. You can combine multiple content and artifact sections in one response
7. Keep content concise and focused — let the UI components do the heavy lifting
8. Artifact JSON must be valid — use double quotes for all keys and string values, no trailing commas, no JavaScript comments, always close all braces and brackets`;

// Examples are split so weak/standard tiers can exclude multi-artifact examples.

const EXAMPLE_TEXT_ONLY = `
### Example 1 — Text-only response (no artifact needed)
<content>The quarterly report shows a **15% increase** in revenue compared to last year. Key highlights:
- North region exceeded targets by 20%
- New product line contributed $1.2M
- Customer retention rate improved to 94%</content>`;

const EXAMPLE_SINGLE_ARTIFACT = `
### Example 2 — Content + single artifact
<thinkitem ephemeral="true">
<thinkitemtitle>Analyzing sales data</thinkitemtitle>
<thinkitemcontent>Looking at Q1-Q4 revenue figures to create a visualization.</thinkitemcontent>
</thinkitem>
<content>Here's the quarterly revenue breakdown:</content>
<artifact type="chart" id="revenue-chart" version="1">
{"chartType":"bar","labels":["Q1","Q2","Q3","Q4"],"datasets":[{"label":"Revenue","values":[150000,200000,180000,250000]}]}
</artifact>
<content>Q4 showed the strongest performance with **$250K** in revenue, a **39% increase** from Q3.</content>`;

const EXAMPLE_MULTI_ARTIFACT = `
### Example 3 — Multiple artifacts (table + chart)
<content>Here is the team performance overview:</content>
<artifact type="table" id="team-stats" version="1">
{"columns":[{"key":"name","label":"Name","type":"text"},{"key":"deals","label":"Deals","type":"number"},{"key":"status","label":"Status","type":"badge","statusMap":{"on-track":"success","behind":"error"}}],"rows":[{"name":"Alice","deals":12,"status":"on-track"},{"name":"Bob","deals":7,"status":"behind"}],"meta":{"rowCount":2}}
</artifact>
<artifact type="chart" id="deals-chart" version="1">
{"chartType":"bar","labels":["Alice","Bob"],"datasets":[{"label":"Deals Closed","values":[12,7]}]}
</artifact>
<content>Alice is leading with **12 deals**, while Bob may need additional support.</content>`;

function buildExampleSection(tier: ModelTier): string {
  let section = '\n\n## Example Responses';
  section += EXAMPLE_TEXT_ONLY;
  section += EXAMPLE_SINGLE_ARTIFACT;
  // Multi-artifact example is omitted for weak tier (contradicts "1 artifact" constraint)
  if (tier !== 'weak') {
    section += EXAMPLE_MULTI_ARTIFACT;
  }
  return section;
}

// Full example section for legacy constant
const EXAMPLE_SECTION = '\n\n## Example Responses' + EXAMPLE_TEXT_ONLY + EXAMPLE_SINGLE_ARTIFACT + EXAMPLE_MULTI_ARTIFACT;

// ─── Artifact Types → Prompt Section ─────────────────────

function buildArtifactTypesSection(types: ArtifactTypeSpec[]): string {
  const entries = types.map(
    (t) =>
      `**${t.name}**${t.description ? ` - ${t.description}` : ''}
\`\`\`json
${t.schema}
\`\`\``,
  );
  return `\n\n### Available Component Types & Schemas\n\n${entries.join('\n\n')}`;
}

// ─── Legacy Constant (backward compat) ──────────────────

export const C0_SYSTEM_PROMPT =
  BASE_PROMPT +
  buildArtifactTypesSection(DEFAULT_ARTIFACT_TYPES) +
  THINKING_SECTION +
  RULES_SECTION +
  EXAMPLE_SECTION;

/**
 * Minimal system prompt for simple text + markdown responses.
 * Use this when you don't need rich components.
 */
export const C0_SIMPLE_PROMPT = `You are a helpful assistant. Respond with clear, well-structured text using markdown formatting.`;

// ─── System Prompt Options ──────────────────────────────

export type ModelTier = 'strong' | 'standard' | 'weak';

export interface SystemPromptOptions {
  enabledComponents?: string[];
  customInstructions?: string;
  includeThinking?: boolean;
  /** Custom artifact types (replaces DEFAULT_ARTIFACT_TYPES when provided) */
  artifactTypes?: ArtifactTypeSpec[];
  /** Locale hint — e.g. "ko" appends "한국어로 응답하세요" */
  locale?: string;
  /** Add tool calling instructions to the prompt */
  enableToolCalling?: boolean;
  /**
   * Model capability tier — adjusts prompt complexity for weaker models.
   * - `strong` (default): Full prompt with thinking, all examples, all types.
   * - `standard`: Removes thinking, includes 2 extra examples.
   * - `weak`: Removes thinking, all 3 examples, simplifies schemas (optional
   *   fields removed), limits to 1 artifact per response.
   */
  modelTier?: ModelTier;
}

/**
 * Recommended / supported / experimental model compatibility guide.
 * Consumers can use this to inform model selection in their UI.
 */
export const MODEL_COMPATIBILITY = {
  recommended: ['claude-sonnet-4', 'gpt-4o', 'claude-haiku-4.5'],
  supported: ['gpt-4o-mini', 'qwen-2.5-72b', 'hermes-2-pro-7b', 'gemma-3-27b'],
  experimental: ['llama-3.1-8b', 'mistral-7b', 'qwen-2.5-7b'],
} as const;

// ─── Weak-model simplified schemas ──────────────────────
//
// For `modelTier: 'weak'`, strip optional/advanced fields from default
// schemas so the model has less to get wrong.

function simplifyTypes(types: ArtifactTypeSpec[]): ArtifactTypeSpec[] {
  return types.map((t) => {
    // Keep the schema as-is for custom types (caller controls them)
    // Only simplify the well-known default types
    const simplified = SIMPLIFIED_SCHEMAS[t.name];
    if (!simplified) return t;
    return { ...t, schema: simplified };
  });
}

const SIMPLIFIED_SCHEMAS: Record<string, string> = {
  table: `{
  "columns": [{ "key": "name", "label": "Name" }],
  "rows": []
}`,
  chart: `{
  "chartType": "bar",
  "labels": [],
  "datasets": [{ "label": "", "values": [] }]
}`,
  'key-value': `{ "entries": [{ "key": "", "value": "" }] }`,
  summary: `{ "items": [{ "label": "", "value": 0 }] }`,
  form: `{
  "fields": [{ "key": "", "label": "", "type": "text" }],
  "submitLabel": "Submit"
}`,
};

// ─── Weak-model constraint section ──────────────────────

const WEAK_MODEL_CONSTRAINTS = `

## Important Constraints
- Respond with at most ONE artifact per message.
- Always close every XML tag you open.
- Artifact data must be a single valid JSON object on one line if possible.
- Double-check that all JSON braces and brackets are properly closed before ending the artifact tag.`;

/**
 * Create a custom system prompt with specific component types enabled.
 */
export function createSystemPrompt(options: SystemPromptOptions = {}): string {
  const {
    enabledComponents,
    customInstructions,
    includeThinking: includeThinkingOpt,
    artifactTypes,
    locale,
    enableToolCalling,
    modelTier = 'strong',
  } = options;

  // modelTier overrides includeThinking default
  const includeThinking = includeThinkingOpt ?? (modelTier === 'strong');

  const rawTypes = artifactTypes ?? DEFAULT_ARTIFACT_TYPES;
  const types = modelTier === 'weak' ? simplifyTypes(rawTypes) : rawTypes;

  let prompt = BASE_PROMPT + buildArtifactTypesSection(types);

  // Thinking section — only for strong tier (or explicit opt-in)
  if (includeThinking) {
    prompt += THINKING_SECTION;
  }

  prompt += RULES_SECTION;
  prompt += buildExampleSection(modelTier);

  // Weak model constraints
  if (modelTier === 'weak') {
    prompt += WEAK_MODEL_CONSTRAINTS;
  }

  if (enabledComponents) {
    prompt += `\n\n## Enabled Components\nOnly use these component types: ${enabledComponents.join(', ')}. Do not use other types.`;
  }

  if (!includeThinking) {
    prompt += `\n\n## Thinking\nDo not include <thinkitem> tags in your response.`;
  }

  if (enableToolCalling) {
    prompt += `\n\n## Tool Calling\nYou may use tool calls when needed to fetch data or perform actions. Prefer using tools over guessing information.`;
  }

  if (locale) {
    const localeMap: Record<string, string> = {
      ko: '한국어로 응답하세요.',
      ja: '日本語で応答してください。',
      zh: '请用中文回复。',
      es: 'Responde en español.',
      fr: 'Répondez en français.',
      de: 'Antworte auf Deutsch.',
    };
    const instruction = localeMap[locale] ?? `Respond in ${locale}.`;
    prompt += `\n\n## Language\n${instruction}`;
  }

  if (customInstructions) {
    prompt += `\n\n## Additional Instructions\n${customInstructions}`;
  }

  return prompt;
}
