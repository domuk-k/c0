# @c0-ui/react

[![npm](https://img.shields.io/npm/v/@c0-ui/react.svg)](https://www.npmjs.com/package/@c0-ui/react)
[![license](https://img.shields.io/npm/l/@c0-ui/react.svg)](https://github.com/domuk-k/c0/blob/main/LICENSE)

React bindings for **[c0](https://github.com/domuk-k/c0)** — the open-source generative UI pipeline. Renders an LLM's streamed XML-DSL into live UI: tables, charts, forms, documents, and more. A drop-in chat component plus low-level renderers and hooks for custom UIs.

An open-source, BYOK alternative to closed generative-UI SDKs — bring any OpenAI-compatible LLM, own every component.

## Install

```bash
npm install @c0-ui/react @c0-ui/server @c0-ui/protocol
```

`react` and `react-dom` (^18 || ^19) are peer dependencies.

## Quick Start

```tsx
import { C0Chat } from '@c0-ui/react';

export default function App() {
  return <C0Chat endpoint="/api/chat" />; // points at a @c0-ui/server route
}
```

### Override any default component

```tsx
import { C0Chat, DEFAULT_RENDERERS } from '@c0-ui/react';
import MyFancyTable from './MyFancyTable';

const components = { ...DEFAULT_RENDERERS, Table: MyFancyTable };

<C0Chat endpoint="/api/chat" components={components} />;
```

You own the components — like shadcn/ui, the framework doesn't hold them hostage. Don't like a default renderer? Replace it.

## Key exports

| Export | Purpose |
|--------|---------|
| `C0Chat` | Batteries-included streaming chat UI |
| `ChatRoot` / `ChatMessageList` / `ChatInput` / `ChatWelcome` / `useC0Chat` | Radix-style compound components for custom layouts |
| `StreamRenderer` / `ContentRenderer` / `ArtifactRenderer` / `ThinkRenderer` | Low-level renderers to build your own UI |
| `DEFAULT_RENDERERS` | The 21 built-in artifact renderers (Table, Chart, Form, Timeline, …) |
| `useThread` / `useIsStreaming` / `useOnAction` / `useC0State` | Hooks for thread state, streaming status, and actions |

## License

MIT © [domuk-k](https://github.com/domuk-k)
