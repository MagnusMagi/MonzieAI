import { useState, useCallback } from 'react';
import { SceneDetailViewModel } from '../viewmodels/SceneDetailViewModel';
import { container } from '../../infrastructure/di/Container';

/**
 * Hook for Scene Detail ViewModel
 * Provides reactive state management for Scene Detail screen
 */
export function useSceneDetailViewModel(sceneId: string | undefined) {
  const [viewModel] = useState(() => new SceneDetailViewModel(container.getSceneByIdUseCase));
  const [state, setState] = useState(() => viewModel.getState());

  // Update state when ViewModel changes
  const updateState = useCallback(() => {
    setState(viewModel.getState());
  }, [viewModel]);

  // Load scene
  const loadScene = useCallback(
    async (id: string) => {
      await viewModel.loadScene(id);
      updateState();
    },
    [viewModel, updateState]
  );

  // Get formatted prompt
  const getFormattedPrompt = useCallback(
    (gender: string) => {
      return viewModel.getFormattedPrompt(gender);
    },
    [viewModel]
  );

  // Load scene if ID provided
  if (sceneId && !state.scene && !state.loading) {
    loadScene(sceneId);
  }

  return {
    ...state,
    loadScene,
    getFormattedPrompt,
  };
}
