"use client";

import { useCallback, useEffect, useRef } from "react";

// Stable callback identity that always sees the latest closure.
export function useCallbackRef<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: any[]) => ref.current(...args), []) as T;
}
