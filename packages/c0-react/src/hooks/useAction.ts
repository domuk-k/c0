import { createContext, useCallback, useContext } from 'react';

import type { C0Action } from '../types.js';

type ActionHandler = (action: C0Action) => void;

const ActionContext = createContext<ActionHandler | undefined>(undefined);

export const ActionProvider = ActionContext.Provider;

/**
 * Hook to dispatch user actions from custom components.
 *
 * Actions communicate user interactions back to the LLM,
 * providing both a human-readable label and LLM-oriented context.
 *
 * @example
 * ```tsx
 * const onAction = useOnAction();
 *
 * function handleClick() {
 *   onAction({
 *     type: 'select',
 *     humanLabel: 'Selected flight AA123',
 *     llmContext: 'User selected flight AA123, departing 10:30 AM, $299',
 *     params: { flightId: 'AA123' },
 *   });
 * }
 * ```
 */
export function useOnAction(): (action: C0Action) => void {
  const handler = useContext(ActionContext);

  return useCallback(
    (action: C0Action) => {
      handler?.(action);
    },
    [handler],
  );
}
