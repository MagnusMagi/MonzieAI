import { useState, useCallback, useEffect, useRef } from 'react';
import { GeneratingViewModel, GeneratingState } from '../viewmodels/GeneratingViewModel';
import { container } from '../../infrastructure/di/Container';

/**
 * Hook for Generating ViewModel
 * Provides reactive state management for Generating screen
 */
export function useGeneratingViewModel() {
  const [viewModel] = useState(() => new GeneratingViewModel(container.generateImageUseCase));
  const [state, setState] = useState<GeneratingState>(() => viewModel.getState());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update state when ViewModel changes
  const updateState = useCallback(() => {
    setState(viewModel.getState());
  }, [viewModel]);

  // Cleanup interval on unmount or when component unmounts during generation
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Generate image
  const generateImage = useCallback(
    async (params: {
      gender: string;
      imageUri: string;
      sceneId?: string;
      sceneName?: string;
      scenePrompt?: string;
      sceneCategory?: string;
      userId?: string;
    }) => {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Update state periodically during generation
      intervalRef.current = setInterval(() => {
        updateState();
      }, 500);

      try {
        await viewModel.generateImage(params);
      } finally {
        // Always cleanup interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        updateState();
      }
    },
    [viewModel, updateState]
  );

  // Reset
  const reset = useCallback(() => {
    viewModel.reset();
    updateState();
  }, [viewModel, updateState]);

  return {
    ...state,
    generateImage,
    reset,
  };
}
