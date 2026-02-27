import { createContext, useContext } from 'react';

const StreamingContext = createContext(false);

export const StreamingProvider = StreamingContext.Provider;

/**
 * Hook to check if the assistant is currently streaming a response.
 * Useful for disabling inputs or showing loading indicators.
 *
 * @example
 * ```tsx
 * const isStreaming = useIsStreaming();
 * return <button disabled={isStreaming}>Send</button>;
 * ```
 */
export function useIsStreaming(): boolean {
  return useContext(StreamingContext);
}
