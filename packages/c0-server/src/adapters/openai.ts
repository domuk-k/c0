/**
 * OpenAI stream adapter for c0.
 *
 * Converts an OpenAI streaming chat completion into a c0 ReadableStream.
 * This is the "pass-through" pattern used in C1 playground's route.ts.
 */

export interface TransformStreamOptions {
  /** Called when the stream ends with all accumulated chunks */
  onEnd?: (accumulated: string) => void;
}

/**
 * Transform an OpenAI streaming response into a c0-compatible ReadableStream.
 *
 * The LLM is expected to output XML-DSL directly (via system prompt).
 * This adapter extracts the content delta from each chunk and forwards it.
 *
 * @example
 * ```ts
 * import OpenAI from 'openai';
 *
 * const client = new OpenAI();
 * const llmStream = await client.chat.completions.create({
 *   model: 'gpt-4o',
 *   messages: [{ role: 'system', content: C0_SYSTEM_PROMPT }, ...],
 *   stream: true,
 * });
 *
 * const responseStream = transformOpenAIStream(llmStream, {
 *   onEnd: (message) => { messageStore.save(message); },
 * });
 *
 * return new Response(responseStream);
 * ```
 */
export function transformOpenAIStream(
  llmStream: AsyncIterable<{ choices: Array<{ delta?: { content?: string | null }; finish_reason?: string | null }> }>,
  options?: TransformStreamOptions,
): ReadableStream<string> {
  const { readable, writable } = new TransformStream<string>();
  const writer = writable.getWriter();

  (async () => {
    const chunks: string[] = [];

    try {
      for await (const chunk of llmStream) {
        const content = chunk.choices?.[0]?.delta?.content ?? '';
        if (content) {
          chunks.push(content);
          await writer.write(content);
        }
      }
    } catch (err) {
      await writer.abort(err instanceof Error ? err : new Error(String(err)));
      return;
    }

    const accumulated = chunks.join('');
    options?.onEnd?.(accumulated);
    await writer.close();
  })();

  return readable;
}

/**
 * Convert c0 messages to OpenAI chat format.
 */
export function toOpenAIMessages(
  messages: Array<{ id?: string; role: string; content: string }>,
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  return messages.map(({ role, content }) => ({
    role: role as 'user' | 'assistant' | 'system',
    content,
  }));
}
