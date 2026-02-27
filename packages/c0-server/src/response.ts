/**
 * Server-side stream response builder.
 *
 * Reverse-engineered from C1's makeC1Response() in server.js.
 * Creates a TransformStream and provides helpers to write
 * structured XML-DSL content incrementally.
 */

import {
  wrapContent,
  wrapThinkItem,
  wrapArtifact,
  wrapCustomMarkdown,
  type ArtifactMeta,
} from '@c0/protocol';

export interface C0ResponseWriter {
  /** The readable stream to return as the HTTP response */
  stream: ReadableStream<string>;

  /** Write a thinking/reasoning step */
  writeThink(item: {
    title: string;
    content: string;
    ephemeral?: boolean;
  }): Promise<void>;

  /** Write main content (text/markdown) */
  writeContent(content: string): Promise<void>;

  /** Write a rich artifact (chart, table, form, etc.) */
  writeArtifact(data: string, meta: ArtifactMeta): Promise<void>;

  /** Write custom markdown content */
  writeCustomMarkdown(content: string): Promise<void>;

  /** Close the stream */
  close(): Promise<void>;

  /** Get accumulated message for storage in conversation history */
  getAccumulated(): { role: 'assistant'; content: string };
}

/**
 * Create a c0 response stream builder.
 *
 * @example
 * ```ts
 * // In a Next.js API route:
 * export async function POST(req: Request) {
 *   const c0 = makeC0Response();
 *
 *   // Stream from your LLM
 *   (async () => {
 *     await c0.writeThink({ title: 'Analyzing', content: '...', ephemeral: true });
 *     await c0.writeContent('Here is your chart:');
 *     await c0.writeArtifact(chartJson, { type: 'chart', id: 'c1', version: 1 });
 *     await c0.close();
 *   })();
 *
 *   return new Response(c0.stream, {
 *     headers: { 'Content-Type': 'text/event-stream' },
 *   });
 * }
 * ```
 */
export function makeC0Response(): C0ResponseWriter {
  const { readable, writable } = new TransformStream<string>();
  const writer = writable.getWriter();

  let contentStarted = false;
  let contentEnded = false;
  let customMarkdownUsed = false;
  let accumulated = '';

  return {
    stream: readable,

    async writeThink({ title, content, ephemeral = true }) {
      if (customMarkdownUsed) {
        throw new Error('Think items cannot be sent after custom markdown');
      }
      const xml = wrapThinkItem(title, content, ephemeral);
      if (!ephemeral) accumulated += xml;
      await writer.write(xml);
    },

    async writeContent(content: string) {
      if (contentEnded) {
        throw new Error('Content cannot be sent after content streaming ended');
      }
      accumulated += content;
      contentStarted = true;
      await writer.write(content);
    },

    async writeArtifact(data: string, meta: ArtifactMeta) {
      const xml = wrapArtifact(data, meta);
      accumulated += xml;
      await writer.write(xml);
    },

    async writeCustomMarkdown(content: string) {
      if (contentStarted) contentEnded = true;
      const xml = wrapCustomMarkdown(content);
      accumulated += xml;
      customMarkdownUsed = true;
      await writer.write(xml);
    },

    async close() {
      await writer.close();
    },

    getAccumulated() {
      return { role: 'assistant', content: accumulated };
    },
  };
}
