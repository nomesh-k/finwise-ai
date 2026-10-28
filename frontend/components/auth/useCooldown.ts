'use client';

import { useCallback, useEffect, useState } from 'react';

/** Counts down in seconds; used to throttle "Resend code". */
export function useCooldown(initial = 0) {
  const [left, setLeft] = useState(initial);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const start = useCallback((s: number) => setLeft(s), []);
  return { left, start };
}
