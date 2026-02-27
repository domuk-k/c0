import { useCallback, useRef, useSyncExternalStore } from 'react';

type StateStore = Map<string, unknown>;

const globalStore: StateStore = new Map();
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Hook for managing named component state.
 * State persists across re-renders and is accessible from any component.
 *
 * Mirrors C1's useC1State hook behavior.
 *
 * @example
 * ```tsx
 * const { getValue, setValue } = useC0State('filter');
 * const currentFilter = getValue() || 'all';
 *
 * return (
 *   <select value={currentFilter} onChange={(e) => setValue(e.target.value)}>
 *     <option value="all">All</option>
 *     <option value="active">Active</option>
 *   </select>
 * );
 * ```
 */
export function useC0State(name: string): {
  getValue: () => unknown;
  setValue: (value: unknown) => void;
} {
  const nameRef = useRef(name);
  nameRef.current = name;

  // Subscribe to store changes
  useSyncExternalStore(
    useCallback((onStoreChange: () => void) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    }, []),
    () => globalStore.get(nameRef.current),
    () => globalStore.get(nameRef.current),
  );

  const getValue = useCallback(() => {
    return globalStore.get(nameRef.current);
  }, []);

  const setValue = useCallback((value: unknown) => {
    globalStore.set(nameRef.current, value);
    emitChange();
  }, []);

  return { getValue, setValue };
}
