import { useState, useCallback } from 'react';
import { uploadResume } from '../lib/api';
import type { RoastResponse } from '../types';

export function useRoast() {
  const [roast, setRoast] = useState<RoastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitResume = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await uploadResume(file);
      setRoast(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to roast resume';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setRoast(null);
    setError(null);
  }, []);

  return {
    roast,
    isLoading,
    error,
    submitResume,
    reset,
  };
}
