import { useState, useEffect, useCallback } from 'react';
import { enhanceViewModel, EnhanceViewModel } from '../viewmodels/EnhanceViewModel';

/**
 * useEnhance Hook
 * React hook for accessing EnhanceViewModel state and methods
 * Provides automatic state updates and cleanup
 */

interface UseEnhanceResult {
  // State
  sourceImage: string | null;
  enhancedImage: string | null;
  loading: boolean;
  progress: number;
  error: string | null;
  enhancing: boolean;

  // Actions
  selectImage: () => Promise<boolean>;
  takePhoto: () => Promise<boolean>;
  enhanceImage: () => Promise<boolean>;
  saveEnhancedImage: () => Promise<boolean>;
  shareEnhancedImage: () => Promise<boolean>;
  clearError: () => void;
  reset: () => void;

  // Helpers
  canEnhance: () => boolean;
  canSaveOrShare: () => boolean;
}

export function useEnhance(): UseEnhanceResult {
  // Subscribe to ViewModel state
  const [state, setState] = useState(enhanceViewModel.getState());

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = enhanceViewModel.subscribe(newState => {
      setState(newState);
    });

    // Initial state sync
    setState(enhanceViewModel.getState());

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Memoized action handlers
  const selectImage = useCallback(async () => {
    return enhanceViewModel.selectImage();
  }, []);

  const takePhoto = useCallback(async () => {
    return enhanceViewModel.takePhoto();
  }, []);

  const enhanceImage = useCallback(async () => {
    return enhanceViewModel.enhanceImage();
  }, []);

  const saveEnhancedImage = useCallback(async () => {
    return enhanceViewModel.saveEnhancedImage();
  }, []);

  const shareEnhancedImage = useCallback(async () => {
    return enhanceViewModel.shareEnhancedImage();
  }, []);

  const clearError = useCallback(() => {
    enhanceViewModel.clearError();
  }, []);

  const reset = useCallback(() => {
    enhanceViewModel.reset();
  }, []);

  const canEnhance = useCallback(() => {
    return enhanceViewModel.canEnhance();
  }, []);

  const canSaveOrShare = useCallback(() => {
    return enhanceViewModel.canSaveOrShare();
  }, []);

  return {
    // State
    sourceImage: state.sourceImage,
    enhancedImage: state.enhancedImage,
    loading: state.loading,
    progress: state.progress,
    error: state.error,
    enhancing: state.enhancing,

    // Actions
    selectImage,
    takePhoto,
    enhanceImage,
    saveEnhancedImage,
    shareEnhancedImage,
    clearError,
    reset,

    // Helpers
    canEnhance,
    canSaveOrShare,
  };
}
