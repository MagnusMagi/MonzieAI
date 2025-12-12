import { useState, useCallback, useEffect } from 'react';
import { SceneSelectionViewModel } from '../viewmodels/SceneSelectionViewModel';
import { container } from '../../infrastructure/di/Container';

/**
 * Hook for Scene Selection ViewModel
 */
export function useSceneSelectionViewModel(initialCategory?: string) {
  const [viewModel] = useState(
    () =>
      new SceneSelectionViewModel(container.getScenesUseCase, container.getSceneCategoriesUseCase)
  );
  const [state, setState] = useState(() => viewModel.getState());

  const updateState = useCallback(() => {
    setState(viewModel.getState());
  }, [viewModel]);

  const loadScenes = useCallback(
    async (category?: string) => {
      await viewModel.loadScenes(category);
      updateState();
    },
    [viewModel, updateState]
  );

  const selectCategory = useCallback(
    (category: string) => {
      viewModel.selectCategory(category);
      updateState();
    },
    [viewModel, updateState]
  );

  const selectScene = useCallback(
    (scene: any) => {
      viewModel.selectScene(scene);
      updateState();
    },
    [viewModel, updateState]
  );

  useEffect(() => {
    loadScenes(initialCategory);
  }, []);

  return {
    ...state,
    loadScenes,
    selectCategory,
    selectScene,
  };
}
