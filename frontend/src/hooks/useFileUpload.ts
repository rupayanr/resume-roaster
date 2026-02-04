import { useState, useCallback } from 'react';
import type { UploadState } from '../types';

export function useFileUpload() {
  const [state, setState] = useState<UploadState>({
    file: null,
    isUploading: false,
    error: null,
  });

  const setFile = useCallback((file: File | null) => {
    setState({ file, isUploading: false, error: null });
  }, []);

  const setUploading = useCallback((isUploading: boolean) => {
    setState((prev) => ({ ...prev, isUploading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error, isUploading: false }));
  }, []);

  const reset = useCallback(() => {
    setState({ file: null, isUploading: false, error: null });
  }, []);

  return {
    ...state,
    setFile,
    setUploading,
    setError,
    reset,
  };
}
