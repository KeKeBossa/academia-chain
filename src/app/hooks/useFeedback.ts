'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type FeedbackKind = 'success' | 'error' | 'warning' | 'info';

export type Feedback = {
  kind: FeedbackKind;
  title: string;
  description?: string;
};

type Options = {
  autoHideMs?: number | null;
};

export function useFeedback(options: Options = {}) {
  const { autoHideMs = 5000 } = options;
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearFeedback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setFeedback(null);
  }, []);

  const showFeedback = useCallback(
    (next: Feedback) => {
      clearFeedback();
      setFeedback(next);

      if (autoHideMs && autoHideMs > 0) {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          setFeedback(null);
        }, autoHideMs);
      }
    },
    [autoHideMs, clearFeedback]
  );

  useEffect(() => clearFeedback, [clearFeedback]);

  return { feedback, showFeedback, clearFeedback };
}
