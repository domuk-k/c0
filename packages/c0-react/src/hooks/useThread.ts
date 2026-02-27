import { useCallback, useRef, useState } from 'react';

import type { C0Message, C0Thread, ProcessMessageParams } from '../types.js';

interface UseThreadOptions {
  apiUrl?: string;
  processMessage?: (params: ProcessMessageParams) => Promise<Response>;
}

interface UseThreadReturn {
  thread: C0Thread;
  isStreaming: boolean;
  sendMessage: (content: string) => Promise<void>;
  cancelStream: () => void;
  clearThread: () => void;
}

function createId(): string {
  return crypto.randomUUID();
}

function createThread(): C0Thread {
  return {
    id: createId(),
    title: 'New conversation',
    messages: [],
    createdAt: Date.now(),
    isRunning: false,
  };
}

export function useThread({
  apiUrl,
  processMessage,
}: UseThreadOptions): UseThreadReturn {
  const [thread, setThread] = useState<C0Thread>(createThread);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: C0Message = {
        id: createId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      const responseId = createId();
      const assistantMessage: C0Message = {
        id: responseId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      // Add user message + empty assistant placeholder
      setThread((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage, assistantMessage],
        isRunning: true,
      }));
      setIsStreaming(true);

      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        let response: Response;

        if (processMessage) {
          // Custom processor
          response = await processMessage({
            threadId: thread.id,
            messages: [...thread.messages, userMessage],
            responseId,
            abortController,
          });
        } else if (apiUrl) {
          // Default: POST to apiUrl
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: { role: 'user', content, id: userMessage.id },
              threadId: thread.id,
              responseId,
            }),
            signal: abortController.signal,
          });
        } else {
          throw new Error('Either apiUrl or processMessage must be provided');
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });

          // Update assistant message content progressively
          setThread((prev) => ({
            ...prev,
            messages: prev.messages.map((msg) =>
              msg.id === responseId
                ? { ...msg, content: accumulated }
                : msg,
            ),
          }));
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          // User cancelled — keep partial response
        } else {
          // Update assistant message with error
          setThread((prev) => ({
            ...prev,
            messages: prev.messages.map((msg) =>
              msg.id === responseId
                ? {
                    ...msg,
                    content: `Error: ${(err as Error).message}`,
                  }
                : msg,
            ),
          }));
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
        setThread((prev) => ({ ...prev, isRunning: false }));
      }
    },
    [apiUrl, processMessage, thread.id, thread.messages],
  );

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearThread = useCallback(() => {
    abortRef.current?.abort();
    setThread(createThread());
    setIsStreaming(false);
  }, []);

  return { thread, isStreaming, sendMessage, cancelStream, clearThread };
}
