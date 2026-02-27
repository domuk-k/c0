import { describe, expect, it } from 'vitest';

import {
  C0_SYSTEM_PROMPT,
  BASE_PROMPT,
  DEFAULT_ARTIFACT_TYPES,
  MODEL_COMPATIBILITY,
  createSystemPrompt,
} from './system.js';
import type { ArtifactTypeSpec } from './system.js';

describe('C0_SYSTEM_PROMPT backward compat', () => {
  it('matches createSystemPrompt() with no arguments', () => {
    const generated = createSystemPrompt();
    expect(generated).toBe(C0_SYSTEM_PROMPT);
  });

  it('contains all 21 WS-native artifact types', () => {
    for (const t of DEFAULT_ARTIFACT_TYPES) {
      expect(C0_SYSTEM_PROMPT).toContain(`**${t.name}**`);
    }
    expect(DEFAULT_ARTIFACT_TYPES.length).toBe(21);
  });

  it('starts with the base prompt', () => {
    expect(C0_SYSTEM_PROMPT.startsWith(BASE_PROMPT)).toBe(true);
  });
});

describe('createSystemPrompt with artifactTypes', () => {
  const customTypes: ArtifactTypeSpec[] = [
    {
      name: 'dashboard',
      component: 'Dashboard',
      description: 'Full-page dashboard layout',
      schema: '{ "component": "Dashboard", "props": { "panels": [] } }',
    },
    {
      name: 'workflow',
      component: 'WorkflowGraph',
      schema: '{ "component": "WorkflowGraph", "props": { "nodes": [] } }',
    },
  ];

  it('includes custom types instead of defaults', () => {
    const prompt = createSystemPrompt({ artifactTypes: customTypes });

    expect(prompt).toContain('**dashboard**');
    expect(prompt).toContain('**workflow**');
    expect(prompt).toContain('Full-page dashboard layout');
    expect(prompt).not.toContain('**chart** - Data visualization');
    expect(prompt).not.toContain('**table** - Read-only data table');
  });

  it('still includes base prompt and rules', () => {
    const prompt = createSystemPrompt({ artifactTypes: customTypes });

    expect(prompt).toContain(BASE_PROMPT);
    expect(prompt).toContain('## Rules');
    expect(prompt).toContain('## Example Response');
  });
});

describe('createSystemPrompt with locale', () => {
  it('adds Korean language instruction', () => {
    const prompt = createSystemPrompt({ locale: 'ko' });
    expect(prompt).toContain('한국어로 응답하세요.');
  });

  it('adds Japanese language instruction', () => {
    const prompt = createSystemPrompt({ locale: 'ja' });
    expect(prompt).toContain('日本語で応答してください。');
  });

  it('falls back to generic instruction for unknown locale', () => {
    const prompt = createSystemPrompt({ locale: 'pt' });
    expect(prompt).toContain('Respond in pt.');
  });
});

describe('createSystemPrompt with enableToolCalling', () => {
  it('adds tool calling section when enabled', () => {
    const prompt = createSystemPrompt({ enableToolCalling: true });
    expect(prompt).toContain('## Tool Calling');
    expect(prompt).toContain('tool calls');
  });

  it('does not add tool calling section by default', () => {
    const prompt = createSystemPrompt();
    expect(prompt).not.toContain('## Tool Calling');
  });
});

describe('createSystemPrompt combines all options', () => {
  it('handles all options together', () => {
    const prompt = createSystemPrompt({
      artifactTypes: [
        { name: 'custom', component: 'Custom', schema: '{}' },
      ],
      locale: 'ko',
      enableToolCalling: true,
      enabledComponents: ['custom'],
      customInstructions: 'Be concise.',
      includeThinking: false,
    });

    expect(prompt).toContain('**custom**');
    expect(prompt).toContain('한국어로 응답하세요.');
    expect(prompt).toContain('## Tool Calling');
    expect(prompt).toContain('Only use these component types: custom');
    expect(prompt).toContain('Be concise.');
    expect(prompt).toContain('Do not include <thinkitem> tags');
  });
});

// ─── modelTier ──────────────────────────────────────────

describe('createSystemPrompt with modelTier', () => {
  it('strong tier (default) includes thinking section', () => {
    const prompt = createSystemPrompt({ modelTier: 'strong' });
    expect(prompt).toContain('### Thinking Steps');
    expect(prompt).not.toContain('## Important Constraints');
  });

  it('standard tier disables thinking by default', () => {
    const prompt = createSystemPrompt({ modelTier: 'standard' });
    expect(prompt).toContain('Do not include <thinkitem> tags');
    expect(prompt).not.toContain('## Important Constraints');
  });

  it('standard tier can opt back into thinking', () => {
    const prompt = createSystemPrompt({ modelTier: 'standard', includeThinking: true });
    expect(prompt).toContain('### Thinking Steps');
    expect(prompt).not.toContain('Do not include <thinkitem> tags');
  });

  it('weak tier adds constraints section', () => {
    const prompt = createSystemPrompt({ modelTier: 'weak' });
    expect(prompt).toContain('## Important Constraints');
    expect(prompt).toContain('at most ONE artifact per message');
    expect(prompt).toContain('Do not include <thinkitem> tags');
  });

  it('weak tier simplifies known schemas', () => {
    const prompt = createSystemPrompt({ modelTier: 'weak' });
    // Simplified table schema: simple columns without type/format/statusMap
    expect(prompt).toContain('**table**');
    // "currency" only appears in the full table schema, never in examples
    expect(prompt).not.toContain('"format": "currency"');
    // "meta" only appears in the full table schema
    expect(prompt).not.toContain('"rowCount"');
    // Chart schema section should use simplified empty-labels version
    expect(prompt).toContain('**chart**');
    expect(prompt).toContain('"labels": []');
    // Multi-artifact example (Example 3) is excluded for weak tier
    expect(prompt).not.toContain('Example 3');
  });

  it('weak tier does not simplify custom types', () => {
    const custom: ArtifactTypeSpec[] = [
      { name: 'my-widget', component: 'MyWidget', schema: '{"complex": true}' },
    ];
    const prompt = createSystemPrompt({ modelTier: 'weak', artifactTypes: custom });
    expect(prompt).toContain('"complex": true');
  });

  it('all 3 example responses are included', () => {
    const prompt = createSystemPrompt();
    expect(prompt).toContain('Example 1');
    expect(prompt).toContain('Example 2');
    expect(prompt).toContain('Example 3');
  });
});

// ─── MODEL_COMPATIBILITY ────────────────────────────────

describe('MODEL_COMPATIBILITY', () => {
  it('has recommended, supported, and experimental tiers', () => {
    expect(MODEL_COMPATIBILITY.recommended.length).toBeGreaterThan(0);
    expect(MODEL_COMPATIBILITY.supported.length).toBeGreaterThan(0);
    expect(MODEL_COMPATIBILITY.experimental.length).toBeGreaterThan(0);
  });

  it('includes expected models', () => {
    expect(MODEL_COMPATIBILITY.recommended).toContain('gpt-4o');
    expect(MODEL_COMPATIBILITY.experimental).toContain('llama-3.1-8b');
  });
});
