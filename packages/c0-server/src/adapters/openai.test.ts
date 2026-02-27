import { describe, expect, it } from 'vitest';
import { transformOpenAIStream, toOpenAIMessages } from './openai.js';

/** Simulate an OpenAI streaming response */
async function* mockOpenAIStream(
  chunks: string[],
): AsyncGenerator<{
  choices: Array<{ delta?: { content?: string }; finish_reason?: string | null }>;
}> {
  for (const content of chunks) {
    yield {
      choices: [{ delta: { content }, finish_reason: null }],
    };
  }
  yield {
    choices: [{ delta: {}, finish_reason: 'stop' }],
  };
}

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

describe('transformOpenAIStream', () => {
  it('transforms OpenAI chunks into a single stream', async () => {
    const llm = mockOpenAIStream(['<content>', 'Hello ', 'world', '</content>']);
    const stream = transformOpenAIStream(llm);
    const result = await consumeStream(stream);

    expect(result).toBe('<content>Hello world</content>');
  });

  it('calls onEnd with accumulated content', async () => {
    let accumulated = '';
    const llm = mockOpenAIStream(['Hello ', 'world']);

    const stream = transformOpenAIStream(llm, {
      onEnd: (msg) => {
        accumulated = msg;
      },
    });

    await consumeStream(stream);
    expect(accumulated).toBe('Hello world');
  });

  it('skips empty chunks', async () => {
    const llm = mockOpenAIStream(['A', '', 'B', '', 'C']);
    const stream = transformOpenAIStream(llm);
    const result = await consumeStream(stream);

    expect(result).toBe('ABC');
  });
});

describe('transformOpenAIStream callbacks', () => {
  it('calls onArtifact when artifact completes in stream', async () => {
    const artifacts: any[] = [];
    const llm = mockOpenAIStream([
      '<artifact type="chart" id="s-1" version="1">',
      '{"component":"Chart"}',
      '</artifact>',
    ]);

    const stream = transformOpenAIStream(llm, {
      onArtifact: (a) => artifacts.push(a),
    });

    await consumeStream(stream);
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0].artifactType).toBe('chart');
    expect(artifacts[0].id).toBe('s-1');
  });

  it('calls onThink when thinkitem completes in stream', async () => {
    const thinks: any[] = [];
    const llm = mockOpenAIStream([
      '<thinkitem ephemeral="true">',
      '<thinkitemtitle>Step 1</thinkitemtitle>',
      '<thinkitemcontent>Analyzing</thinkitemcontent>',
      '</thinkitem>',
    ]);

    const stream = transformOpenAIStream(llm, {
      onThink: (t) => thinks.push(t),
    });

    await consumeStream(stream);
    expect(thinks).toHaveLength(1);
    expect(thinks[0].title).toBe('Step 1');
    expect(thinks[0].content).toBe('Analyzing');
  });

  it('works without callbacks (backward compat)', async () => {
    const llm = mockOpenAIStream(['<content>', 'Hello', '</content>']);
    const stream = transformOpenAIStream(llm);
    const result = await consumeStream(stream);

    expect(result).toBe('<content>Hello</content>');
  });

  it('combines onEnd with onArtifact', async () => {
    let ended = '';
    const artifacts: any[] = [];

    const llm = mockOpenAIStream([
      '<content>Intro</content>',
      '<artifact type="table" id="t-1" version="1">',
      '{"component":"Table"}',
      '</artifact>',
    ]);

    const stream = transformOpenAIStream(llm, {
      onEnd: (acc) => { ended = acc; },
      onArtifact: (a) => artifacts.push(a),
    });

    await consumeStream(stream);
    expect(ended).toContain('<content>Intro</content>');
    expect(artifacts).toHaveLength(1);
  });
});

describe('toOpenAIMessages', () => {
  it('converts c0 messages to OpenAI format', () => {
    const messages = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: '<content>Hi</content>' },
    ];

    const result = toOpenAIMessages(messages);

    expect(result).toEqual([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: '<content>Hi</content>' },
    ]);
  });

  it('strips id field', () => {
    const messages = [{ id: 'abc', role: 'system', content: 'You are helpful' }];
    const result = toOpenAIMessages(messages);

    expect(result[0]).not.toHaveProperty('id');
    expect(result[0]).toEqual({ role: 'system', content: 'You are helpful' });
  });
});
