# @c0-ui/protocol

[![npm](https://img.shields.io/npm/v/@c0-ui/protocol.svg)](https://www.npmjs.com/package/@c0-ui/protocol)
[![license](https://img.shields.io/npm/l/@c0-ui/protocol.svg)](https://github.com/domuk-k/c0/blob/main/LICENSE)

Framework-agnostic core of **[c0](https://github.com/domuk-k/c0)** — an open-source generative UI pipeline. Streaming XML-DSL parser, serializer, and JSON repair for turning an LLM's token stream into structured, renderable UI parts.

This package has **zero UI framework dependencies** — it's the shared core that `@c0-ui/react` (and future `@c0-ui/vue`, `@c0-ui/svelte`) build on.

## Install

```bash
npm install @c0-ui/protocol
```

## Quick Start

```ts
import { createStreamParser } from '@c0-ui/protocol';

const parser = createStreamParser({
  repairJson: true, // auto-repair broken JSON from weak/local models
  onContent: (part) => console.log('content', part),
  onArtifact: (part) => console.log('artifact', part),
});

// Feed the LLM token stream chunk by chunk
parser.write('<content>Here is your data</content>');
parser.write('<artifact type="Table">{"rows":[...]}</artifact>');

const response = parser.getResult(); // ParsedResponse
```

## What it does

The LLM emits an **XML-DSL**: `<content>`, `<artifact>`, and `<thinkitem>` tags. `createStreamParser()` parses this incrementally (via `htmlparser2`) and produces an immutable `ParsedResponse` on every event (via `immer`), so it plugs straight into reactive rendering.

## Key exports

| Export | Purpose |
|--------|---------|
| `createStreamParser(options)` | Incremental streaming parser with `onContent` / `onArtifact` / `onThink` callbacks |
| `parseResponse(text)` | Parse a complete (non-streamed) response |
| `serializeResponse` / `extractContext` | Serialize parsed state back to the DSL / extract context |
| `repairJson(text)` | Standalone JSON repair for malformed model output |
| `wrapArtifact` / `wrapContent` / `wrapThinkItem` / `TAGS` | Tag builders for producing the DSL server-side |

### Why `repairJson`?

Unlike closed alternatives that assume a top-tier model, c0 targets **any OpenAI-compatible LLM**. Small models (7B–13B) frequently emit broken JSON inside artifacts; `repairJson: true` recovers it on the fly.

## License

MIT © [domuk-k](https://github.com/domuk-k)
