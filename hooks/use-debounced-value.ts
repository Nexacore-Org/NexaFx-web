"use client";

import { useState, useEffect } from "react";

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms of
 * no new changes. Useful for deferring search / filter API calls until the
 * user pauses typing.
 *
 * @example
 * const debouncedQuery = useDebouncedValue(inputValue, 300);
 * // debouncedQuery will lag behind inputValue by 300 ms of inactivity.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
