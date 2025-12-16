import { useState, useEffect, useCallback } from 'react';
import { HomeViewModel } from '../viewmodels/HomeViewModel';
import { container } from '../../infrastructure/di/Container';
import { useRealtimeScenes } from '../../hooks/useRealtimeScenes';

/**
 * Hook for Home ViewModel
 * Provides reactive state management for Home screen
 * Includes real-time subscription for scenes updates
 */
export function useHomeViewModel() {
  const [viewModel] = useState(
    () => new HomeViewModel(container.getScenesUseCase, container.getSceneCategoriesUseCase)
  );

  const [state, setState] = useState(() => viewModel.getState());

  // Real-time subscription for scenes
  const {
    scenes: realtimeScenes,
    isSubscribed,
    updateScenes: updateRealtimeScenes,
  } = useRealtimeScenes({
    isActive: true,
  });

  // Update state when ViewModel changes
  const updateState = useCallback(() => {
    setState(viewModel.getState());
  }, [viewModel]);

  // Load scenes - Load all scenes (200 limit to cover all 150+ scenes)
  const loadScenes = useCallback(
    async (category?: string, limit: number = 200, offset: number = 0) => {
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

  // Sync real-time scenes with ViewModel
  useEffect(() => {
    if (realtimeScenes.length > 0 && isSubscribed) {
      // Update ViewModel's scenes with real-time data
      viewModel.updateScenes(realtimeScenes);
      updateState();
    }
  }, [realtimeScenes, isSubscribed, viewModel, updateState]);

  // Initial load
  useEffect(() => {
    loadScenes();
    loadCategories();
  }, [loadScenes, loadCategories]);

  // Sync initial load with real-time subscription
  useEffect(() => {
    if (state.scenes.length > 0 && !isSubscribed) {
      // Update real-time hook with initial scenes
      updateRealtimeScenes(state.scenes);
    }
  }, [state.scenes, isSubscribed, updateRealtimeScenes]);

  return {
    ...state,
    loadScenes,
    loadCategories,
    setSearchQuery,
    refresh,
    isRealtimeSubscribed: isSubscribed,
  };
}
