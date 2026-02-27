import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { C0_SYSTEM_PROMPT } from '@c0-ui/server';
import { transformOpenAIStream } from '@c0-ui/server';

/**
 * Message store — in-memory for the playground.
 * Same pattern as C1 playground's messageStore.ts.
 */
type StoredMessage = { role: string; content: string; id?: string };
const threadMessages = new Map<string, StoredMessage[]>();

function getMessages(threadId: string): StoredMessage[] {
  if (!threadMessages.has(threadId)) {
    threadMessages.set(threadId, []);
  }
  return threadMessages.get(threadId)!;
}

export async function POST(req: NextRequest) {
  const { prompt, threadId, responseId } = (await req.json()) as {
    prompt: { role: string; content: string; id: string };
    threadId: string;
    responseId: string;
  };

  // BYOK: Bring Your Own Key — works with any OpenAI-compatible API
  // OpenRouter, Together, Groq, Anthropic proxy, local Ollama, etc.
  const client = new OpenAI({
    apiKey: process.env.LLM_API_KEY,
    baseURL: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
  });

  const messages = getMessages(threadId);
  messages.push({ role: prompt.role, content: prompt.content, id: prompt.id });

  const systemMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: C0_SYSTEM_PROMPT },
  ];
  const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = messages.map(
    ({ role, content }) => ({
      role: role as 'user' | 'assistant',
      content,
    }),
  );

  const llmStream = await client.chat.completions.create({
    model: process.env.LLM_MODEL || 'gpt-4o',
    messages: [...systemMessages, ...chatMessages],
    stream: true,
  });

  const responseStream = transformOpenAIStream(llmStream, {
    onEnd: (accumulated) => {
      messages.push({
        role: 'assistant',
        content: accumulated,
        id: responseId,
      });
    },
  });

  return new NextResponse(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
