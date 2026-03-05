# vercel-labs/json-render 분석

> **AI → JSON → UI** : AI가 JSON을 생성하고, 당신이 안전하게 렌더링한다.

## 1. 핵심 아이디어

json-render의 핵심 아이디어는 **"AI가 임의의 HTML/코드를 생성하는 대신, 사전 정의된 컴포넌트 카탈로그 내에서만 구조화된 JSON을 출력하게 제한하는 것"**이다.

```
사용자 프롬프트 → AI 모델 → 구조화된 JSON(Spec) → 렌더러 → UI
```

이 접근법이 해결하는 문제:
- **안전성**: AI가 임의 코드를 실행할 수 없음 (XSS, 인젝션 불가)
- **예측 가능성**: 출력이 항상 스키마에 부합
- **크로스 플랫폼**: 동일 카탈로그로 React, React Native, Vue, PDF, Email, Video 등 멀티 타겟 렌더링

## 2. 핵심 기능

### 2.1 카탈로그 시스템 (Guardrail)

AI가 사용할 수 있는 컴포넌트와 액션을 Zod 스키마로 정의한다.

```
defineSchema → defineCatalog → catalog.prompt() → AI 시스템 프롬프트
                              → catalog.validate() → Spec 검증
                              → catalog.zodSchema() → Zod 스키마 추출
                              → catalog.jsonSchema() → JSON Schema 추출
```

- **Schema**: builder 패턴으로 `string()`, `number()`, `array()`, `object()`, `map()` 등 프리미티브 제공
- **Catalog**: 스키마로부터 컴포넌트/액션 이름을 추출하고, AI용 프롬프트와 검증 스키마를 자동 생성

### 2.2 Flat Spec 포맷 (핵심 데이터 구조)

AI가 생성하는 JSON의 구조:

```json
{
  "root": "card-1",
  "elements": {
    "card-1": {
      "type": "Card",
      "props": { "title": "Hello" },
      "children": ["button-1"]
    },
    "button-1": {
      "type": "Button",
      "props": { "label": "Click me" },
      "children": []
    }
  },
  "state": {
    "count": 0,
    "user": { "name": "Alice" }
  }
}
```

**왜 Flat 구조인가?**
- 트리 구조 대신 플랫 맵을 사용하면 **스트리밍 시 점진적 렌더링**이 가능
- 각 element를 독립적으로 추가/수정/삭제 가능 (JSON Patch 활용)
- `nestedToFlat()` 유틸로 중첩 트리 → 플랫 맵 변환 지원

### 2.3 프로그레시브 스트리밍 (SpecStream)

RFC 6902 JSON Patch 기반으로 UI를 점진적으로 빌드한다:

```
AI 응답 스트림:
  {"op":"add","path":"/elements/card-1","value":{"type":"Card",...}}
  {"op":"add","path":"/elements/btn-1","value":{"type":"Button",...}}
  {"op":"replace","path":"/root","value":"card-1"}
```

- `createSpecStreamCompiler()`: 스트리밍 패치 데이터를 상태적으로 컴파일
- `createMixedStreamParser()`: 텍스트와 JSONL 패치가 혼합된 스트림 처리 (채팅 UI에 유용)
- Refinement 모드: 기존 Spec이 있으면 변경된 부분만 패치

### 2.4 Dynamic Values & 상태 바인딩

props 값이 리터럴이거나 상태 참조(`$state`)일 수 있다:

```typescript
// 리터럴 값
{ "label": "Hello" }

// 상태 참조 (Dynamic Value)
{ "label": { "$state": "user.name" } }
```

- `DynamicValue<T>`: `T | { $state: string }` - 리터럴 또는 상태 경로 참조
- `resolvePropValue()`: 동적 값을 런타임 상태에서 해석
- `resolveElementProps()`: 엘리먼트의 모든 props를 한번에 해석
- `createStateStore()`: 상태 저장소 생성 (Redux, Zustand, Jotai, XState 어댑터 지원)

### 2.5 조건부 가시성 (Visibility)

엘리먼트의 표시/숨김을 선언적으로 제어:

```typescript
// 단순 조건
{ "source": "state", "path": "isLoggedIn", "operator": "eq", "value": true }

// 복합 조건 (AND/OR)
{ "$and": [조건1, 조건2] }
{ "$or":  [조건1, 조건2] }
```

지원 연산자: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `not`

조건 소스:
- **StateCondition**: 전역 상태 참조 (`$state`)
- **ItemCondition**: 반복 렌더링의 현재 아이템 참조
- **IndexCondition**: 반복 렌더링의 현재 인덱스 참조

### 2.6 액션 시스템

사용자 인터랙션을 선언적으로 정의:

```typescript
// 카탈로그에서 액션 정의
actions: {
  export_report: { description: "Export dashboard to PDF" },
  refresh_data: { description: "Refresh all metrics" }
}

// 엘리먼트에서 액션 바인딩
{
  "type": "Button",
  "props": { "label": "Export" },
  "on": { "click": { "action": "export_report" } }
}
```

- `resolveAction()`: 액션 정의 해석
- `executeAction()`: 액션 실행
- `interpolateString()`: 액션 파라미터 내 문자열 보간

### 2.7 검증 시스템

폼 입력 등의 데이터 검증:

- `runValidation()`: 검증 실행
- `builtInValidationFunctions`: 내장 검증 함수들
- Zod 스키마 기반 자동 검증

## 3. 데이터 설계 핵심 요약

### UIElement 인터페이스

```typescript
interface UIElement<T, P> {
  type: T;           // 컴포넌트 타입 (카탈로그에서 정의)
  props: P;          // 컴포넌트 props (Zod 스키마로 타입 안전)
  children: string[];    // 자식 엘리먼트 키 배열
  visibility?: VisibilityCondition;  // 조건부 표시
  on?: EventBindings;    // 이벤트 → 액션 바인딩
  repeat?: RepeatDirective;  // 반복 렌더링
  watchers?: StateWatcher[]; // 상태 변경 감시
}
```

### Spec 인터페이스

```typescript
interface Spec {
  root: string;                      // 루트 엘리먼트 키
  elements: Record<string, FlatElement>;  // 플랫 엘리먼트 맵
  state?: Record<string, any>;       // 초기 상태
}
```

### 아키텍처 계층

```
┌─────────────────────────────────────────────┐
│  AI Model (GPT-4, Claude, Gemini, etc.)     │
│  - catalog.prompt()로 생성된 시스템 프롬프트  │
│  - JSON Spec 또는 JSON Patch 스트림 출력     │
└──────────────────┬──────────────────────────┘
                   │ JSON / JSONL Stream
┌──────────────────▼──────────────────────────┐
│  @json-render/core                          │
│  - Spec 검증 (catalog.validate)             │
│  - 스트림 컴파일 (SpecStreamCompiler)        │
│  - 상태 관리 (StateStore)                    │
│  - Props 해석, Visibility 평가, 액션 실행    │
└──────────────────┬──────────────────────────┘
                   │ Resolved UIElement Tree
┌──────────────────▼──────────────────────────┐
│  Renderer (@json-render/react, vue, etc.)   │
│  - Registry: 카탈로그 타입 → 실제 컴포넌트    │
│  - 재귀적 렌더링 엔진                         │
│  - Context Provider & Hooks                  │
└─────────────────────────────────────────────┘
```

## 4. 설계 인사이트

| 설계 결정 | 이유 |
|-----------|------|
| **Flat Map** (트리 대신) | 스트리밍 점진 렌더링 + JSON Patch 호환 |
| **Zod 스키마** | 타입 안전 + 런타임 검증 + AI 프롬프트 자동 생성 |
| **Schema ↔ Registry 분리** | 동일 스키마로 멀티 플랫폼 (Web/Mobile/PDF/Email) |
| **`$state` 참조** | 선언적 데이터 바인딩, AI가 상태 로직 생성 가능 |
| **RFC 6902 JSON Patch** | 표준 기반 점진적 업데이트, 기존 UI 수정 시 효율적 |
| **카탈로그 → 프롬프트 자동 생성** | AI가 사용 가능한 컴포넌트를 정확히 인지 |

---

Sources:
- [GitHub: vercel-labs/json-render](https://github.com/vercel-labs/json-render)
- [공식 사이트: json-render.dev](https://json-render.dev/)
- [npm: @json-render/core](https://www.npmjs.com/package/@json-render/core)
