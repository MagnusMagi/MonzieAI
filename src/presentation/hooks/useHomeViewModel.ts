import { useState, useEffect, useCallback, useMemo } from 'react';
import { HomeViewModel } from '../viewmodels/HomeViewModel';
import { container } from '../../infrastructure/di/Container';

/**
 * Hook for Home ViewModel
 * Provides reactive state management for Home screen
 */
export function useHomeViewModel() {
  const [viewModel] = useState(
    () => new HomeViewModel(container.getScenesUseCase, container.getSceneCategoriesUseCase)
  );

  const [state, setState] = useState(() => viewModel.getState());

  // Update state when ViewModel changes
  const updateState = useCallback(() => {
    setState(viewModel.getState());
  }, [viewModel]);

  // Load scenes
  const loadScenes = useCallback(
    async (category?: string, limit: number = 50, offset: number = 0) => {
      await viewModel.loadScenes(category, limit, offset);
      updateState();
    },
    [viewModel, updateState]
  );

  // Load categories
  const loadCategories = useCallback(async () => {
    await viewModel.loadCategories();
    updateState();
  }, [viewModel, updateState]);

  // Set search query
  const setSearchQuery = useCallback(
    (query: string) => {
      viewModel.setSearchQuery(query);
      updateState();
    },
    [viewModel, updateState]
  );

  // Refresh
  const refresh = useCallback(async () => {
    await viewModel.refresh();
    updateState();
  }, [viewModel, updateState]);

  // Initial load
  useEffect(() => {
    loadScenes();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    loadScenes,
    loadCategories,
    setSearchQuery,
    refresh,
  };
}
