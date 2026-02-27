// Response builder
export { makeC0Response, type C0ResponseWriter } from './response.js';

// Stream adapters
export { transformOpenAIStream, toOpenAIMessages } from './adapters/openai.js';
export type { TransformStreamOptions } from './adapters/openai.js';

// System prompts
export {
  BASE_PROMPT,
  C0_SYSTEM_PROMPT,
  C0_SIMPLE_PROMPT,
  DEFAULT_ARTIFACT_TYPES,
  MODEL_COMPATIBILITY,
  createSystemPrompt,
} from './prompts/system.js';
export type { ArtifactTypeSpec, ModelTier, SystemPromptOptions } from './prompts/system.js';
