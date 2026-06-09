# @c0-ui/server

[![npm](https://img.shields.io/npm/v/@c0-ui/server.svg)](https://www.npmjs.com/package/@c0-ui/server)
[![license](https://img.shields.io/npm/l/@c0-ui/server.svg)](https://github.com/domuk-k/c0/blob/main/LICENSE)

Server-side runtime for **[c0](https://github.com/domuk-k/c0)** — the open-source generative UI pipeline. System prompts, an OpenAI-compatible stream adapter, and a response builder. **BYOK (Bring Your Own Key)** — works with any OpenAI-compatible LLM, including local models.

## Install

```bash
npm install @c0-ui/server
# openai is an optional peer dependency
npm install openai
```

## Quick Start

```ts
import { createSystemPrompt, transformOpenAIStream } from '@c0-ui/server';
import OpenAI from 'openai';

const openai = new OpenAI(); // or any OpenAI-compatible endpoint (BYOK)

const stream = await openai.chat.completions.create({
  model: process.env.LLM_MODEL!,
  stream: true,
  messages: [
    { role: 'system', content: createSystemPrompt({ modelTier: 'weak' }) },
    { role: 'user', content: 'Show me last quarter sales as a table' },
  ],
});

// Returns a ReadableStream<string> of the c0 XML-DSL — pipe to the client
return new Response(transformOpenAIStream(stream));
```

## Key exports

| Export | Purpose |
|--------|---------|
| `createSystemPrompt(options)` | Build the system prompt; `modelTier: 'weak'` tunes it for small models (7B–13B) |
| `transformOpenAIStream(stream)` | Adapt an OpenAI chat stream into the c0 DSL `ReadableStream<string>` |
| `toOpenAIMessages(...)` | Convert c0 thread state into OpenAI message format |
| `makeC0Response()` | Manually build a streamed response (`writeContent` / `writeArtifact` / `writeThink`) |
| `BASE_PROMPT`, `C0_SYSTEM_PROMPT`, `DEFAULT_ARTIFACT_TYPES`, `MODEL_COMPATIBILITY` | Prompt + artifact-type building blocks |

## Why c0 server (vs a closed Gen UI API)?

The entire pipeline — LLM routing, the component-selection prompt, quality filtering — is **open and runs in your process**. No black-box server, no model lock-in, debuggable in production.

## License

MIT © [domuk-k](https://github.com/domuk-k)
