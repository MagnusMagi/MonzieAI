import { useState, useCallback } from 'react';
import { GeneratedViewModel } from '../viewmodels/GeneratedViewModel';
import { container } from '../../infrastructure/di/Container';

/**
 * Hook for Generated ViewModel
 */
export function useGeneratedViewModel() {
  const [viewModel] = useState(() => new GeneratedViewModel(container.likeImageUseCase));
  const [state, setState] = useState(() => viewModel.getState());

  const updateState = useCallback(() => {
    setState(viewModel.getState());
  }, [viewModel]);

  const initialize = useCallback(
    (imageUrl: string, imageId?: string) => {
      viewModel.initialize(imageUrl, imageId);
      updateState();
    },
    [viewModel, updateState]
  );

  const likeImage = useCallback(
    async (imageId: string) => {
      await viewModel.likeImage(imageId);
      updateState();
    },
    [viewModel, updateState]
  );

  const saveToHistory = useCallback(
    async (image: {
      id: string;
      imageUrl: string;
      prompt: string;
      gender: string;
      sceneName?: string;
      sceneCategory?: string;
      seed?: number;
    }) => {
      await viewModel.saveToHistory(image);
    },
    [viewModel]
  );

  return {
    ...state,
    initialize,
    likeImage,
    saveToHistory,
  };
}
