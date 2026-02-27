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
