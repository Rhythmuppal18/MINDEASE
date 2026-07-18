import { useEffect, useRef, useState } from 'react';

/**
 * A useState-compatible hook that syncs its value to localStorage.
 * Falls back gracefully if localStorage is unavailable (e.g. private browsing).
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const isFirstRun = useRef(true);

  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    // Avoid an unnecessary write on mount when nothing has changed yet.
    if (isFirstRun.current) {
      isFirstRun.current = false;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage might be full or disabled — fail silently, gameplay continues.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
