import { useState, useCallback, useEffect } from 'react';
import { FavoritesViewModel } from '../viewmodels/FavoritesViewModel';
import { container } from '../../infrastructure/di/Container';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Hook for Favorites ViewModel
 */
export function useFavoritesViewModel() {
  const { user } = useAuth();
  const [viewModel] = useState(
    () =>
      new FavoritesViewModel(
        container.getImagesUseCase,
        container.imageRepository,
        container.favoriteRepository
      )
  );
  const [state, setState] = useState(() => viewModel.getState());

  const updateState = useCallback(() => {
    setState(viewModel.getState());
  }, [viewModel]);

  const loadFavorites = useCallback(
    async (userId: string) => {
      await viewModel.loadFavorites(userId);
      updateState();
    },
    [viewModel, updateState]
  );

  const removeFavorite = useCallback(
    async (imageId: string, userId: string) => {
      await viewModel.removeFavorite(imageId, userId);
      updateState();
    },
    [viewModel, updateState]
  );

  useEffect(() => {
    if (user?.id) {
      loadFavorites(user.id);
    }
  }, [user?.id]);

  return {
    ...state,
    loadFavorites,
    removeFavorite,
  };
}
