// Response builder
export { makeC0Response, type C0ResponseWriter } from './response.js';

// Stream adapters
export { transformOpenAIStream, toOpenAIMessages } from './adapters/openai.js';

// System prompts
export {
  C0_SYSTEM_PROMPT,
  C0_SIMPLE_PROMPT,
  createSystemPrompt,
} from './prompts/system.js';
