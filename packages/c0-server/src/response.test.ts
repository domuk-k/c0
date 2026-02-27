import { describe, expect, it } from 'vitest';
import { makeC0Response } from './response.js';
import { parseResponse } from '@c0-ui/protocol';

/** Helper to consume a ReadableStream<string> into a single string */
async function consumeStream(stream: ReadableStream<string>): Promise<string> {
  const reader = stream.getReader();
  const chunks: string[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return chunks.join('');
}

describe('makeC0Response', () => {
  it('streams content and accumulates correctly', async () => {
    const c0 = makeC0Response();

    // Write in background
    const writing = (async () => {
      await c0.writeContent('Hello world');
      await c0.close();
    })();

    const result = await consumeStream(c0.stream);
    await writing;

    expect(result).toContain('Hello world');
    expect(c0.getAccumulated().role).toBe('assistant');
    expect(c0.getAccumulated().content).toContain('Hello world');
  });

  it('streams think items + content', async () => {
    const c0 = makeC0Response();

    const writing = (async () => {
      await c0.writeThink({
        title: 'Analyzing',
        content: 'Looking at the data',
        ephemeral: true,
      });
      await c0.writeContent('Here is the result');
      await c0.close();
    })();

    const raw = await consumeStream(c0.stream);
    await writing;

    // Parse with c0-protocol parser
    const parsed = parseResponse(raw);

    expect(parsed.think).toHaveLength(1);
    expect(parsed.think[0].title).toBe('Analyzing');
    expect(parsed.think[0].ephemeral).toBe(true);
    expect(parsed.parts.length).toBeGreaterThanOrEqual(1);
  });

  it('streams artifacts with metadata', async () => {
    const c0 = makeC0Response();

    const writing = (async () => {
      await c0.writeContent('Check this chart:');
      await c0.writeArtifact(
        '{"component":"Chart","props":{"type":"bar"}}',
        { type: 'chart', id: 'test-chart', version: 1 },
      );
      await c0.close();
    })();

    const raw = await consumeStream(c0.stream);
    await writing;

    const parsed = parseResponse(raw);

    // Should have content + artifact
    const artifactPart = parsed.parts.find((p) => p.type === 'artifact');
    expect(artifactPart).toBeDefined();
    if (artifactPart?.type === 'artifact') {
      expect(artifactPart.artifactType).toBe('chart');
      expect(artifactPart.id).toBe('test-chart');
      expect(artifactPart.version).toBe(1);
    }
  });

  it('ephemeral think items are excluded from accumulated', async () => {
    const c0 = makeC0Response();

    const writing = (async () => {
      await c0.writeThink({
        title: 'Ephemeral step',
        content: 'Should not persist',
        ephemeral: true,
      });
      await c0.writeThink({
        title: 'Persistent step',
        content: 'Should persist',
        ephemeral: false,
      });
      await c0.writeContent('Final answer');
      await c0.close();
    })();

    await consumeStream(c0.stream);
    await writing;

    const accumulated = c0.getAccumulated().content;
    expect(accumulated).not.toContain('Ephemeral step');
    expect(accumulated).toContain('Persistent step');
    expect(accumulated).toContain('Final answer');
  });

  it('throws if content sent after content ended', async () => {
    const c0 = makeC0Response();

    // Must consume the stream to avoid backpressure blocking writes
    const consuming = consumeStream(c0.stream);

    await c0.writeContent('First');
    await c0.writeCustomMarkdown('Custom section');

    await expect(c0.writeContent('After custom')).rejects.toThrow(
      'Content cannot be sent after content streaming ended',
    );

    await c0.close();
    await consuming;
  });

  it('getAccumulated returns assistant role', () => {
    const c0 = makeC0Response();
    const msg = c0.getAccumulated();
    expect(msg.role).toBe('assistant');
    expect(msg.content).toBe('');
  });
});
