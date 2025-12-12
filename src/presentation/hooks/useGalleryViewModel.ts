import { useState, useEffect, useCallback } from 'react';
import { GalleryViewModel } from '../viewmodels/GalleryViewModel';
import { container } from '../../infrastructure/di/Container';

/**
 * Hook for Gallery ViewModel
 * Provides reactive state management for Gallery screen
 */
export function useGalleryViewModel() {
  const [viewModel] = useState(() => new GalleryViewModel(container.getImagesUseCase));

  const [state, setState] = useState(() => viewModel.getState());

  // Update state when ViewModel changes
  const updateState = useCallback(() => {
    setState(viewModel.getState());
  }, [viewModel]);

  // Load images
  const loadImages = useCallback(
    async (reset: boolean = false, limit: number = 20) => {
      await viewModel.loadImages(reset, limit);
      updateState();
    },
    [viewModel, updateState]
  );

  // Refresh
  const refresh = useCallback(async () => {
    await viewModel.refresh();
    updateState();
  }, [viewModel, updateState]);

  // Load more
  const loadMore = useCallback(async () => {
    await viewModel.loadMore();
    updateState();
  }, [viewModel, updateState]);

  // Set image loading
  const setImageLoading = useCallback(
    (id: string, loading: boolean) => {
      viewModel.setImageLoading(id, loading);
      updateState();
    },
    [viewModel, updateState]
  );

  // Set image error
  const setImageError = useCallback(
    (id: string, error: boolean) => {
      viewModel.setImageError(id, error);
      updateState();
    },
    [viewModel, updateState]
  );

  // Get image state
  const getImageState = useCallback(
    (id: string) => {
      return viewModel.getImageState(id);
    },
    [viewModel]
  );

  // Initial load
  useEffect(() => {
    loadImages(true);
  }, []);

  return {
    ...state,
    loadImages,
    refresh,
    loadMore,
    setImageLoading,
    setImageError,
    getImageState,
  };
}
