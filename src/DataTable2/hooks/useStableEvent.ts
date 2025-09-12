// src/DataTable2/hooks/useStableEvent.ts
import * as React from "react";

// Avoid SSR warnings: useLayoutEffect on client, useEffect on server
const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function useStableEvent<T extends (...args: any[]) => any>(fn: T): T {
  const ref = React.useRef(fn);
  useIsoLayoutEffect(() => {
    ref.current = fn;
  }, [fn]);

  // Stable identity; always calls the latest implementation
  return React.useCallback(((...args: any[]) => ref.current(...args)) as T, []);
}
