# c0

LLM이 리치 UI를 생성하도록 하는 XML-DSL 프로토콜 + 런타임.

> Inspired by [Thesys C1](https://thesys.tech) — open-source reimplementation of the XML-DSL protocol for BYOK (Bring Your Own Key) use cases.

## Packages

| Package | Description |
|---------|-------------|
| `@c0-ui/protocol` | XML-DSL 스트리밍 파서, 시리얼라이저, JSON repair |
| `@c0-ui/server` | 시스템 프롬프트, OpenAI 스트림 어댑터, 응답 빌더 |
| `@c0-ui/react` | React 컴포넌트 렌더러, hooks, 채팅 UI |

## Quick Start

```bash
pnpm install
pnpm -r build
```

### Playground

```bash
cd apps/playground
cp .env.local.example .env.local  # LLM_API_KEY, LLM_MODEL 설정
pnpm dev
```

## Architecture

```
LLM (XML-DSL output)
  ↓ stream
@c0-ui/server (transformOpenAIStream)
  ↓ ReadableStream<string>
@c0-ui/protocol (createStreamParser)
  ↓ ParsedResponse
@c0-ui/react (C0Chat → ArtifactRenderer)
  ↓
Browser UI
```

LLM 응답은 `<content>`, `<artifact>`, `<thinkitem>` 태그로 구조화되며, 각 artifact는 type에 따라 테이블, 차트, 폼 등의 컴포넌트로 렌더링됨.

## Weak Model Support

`modelTier` 옵션으로 소형 모델(7B-13B)도 지원:

```ts
import { createSystemPrompt } from '@c0-ui/server';

const prompt = createSystemPrompt({ modelTier: 'weak' });
```

클라이언트에서는 `repairJson` 옵션으로 깨진 JSON 자동 복구:

```ts
import { createStreamParser } from '@c0-ui/protocol';

const parser = createStreamParser({ repairJson: true });
```

## License

MIT
