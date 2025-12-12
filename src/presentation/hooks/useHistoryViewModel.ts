import { useState, useCallback, useEffect } from 'react';
import { HistoryViewModel } from '../viewmodels/HistoryViewModel';
import { container } from '../../infrastructure/di/Container';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Hook for History ViewModel
 */
export function useHistoryViewModel() {
  const { user } = useAuth();
  const [viewModel] = useState(() => new HistoryViewModel(container.imageRepository));
  const [state, setState] = useState(() => viewModel.getState());

  const updateState = useCallback(() => {
    setState(viewModel.getState());
  }, [viewModel]);

  const loadHistory = useCallback(
    async (userId: string) => {
      await viewModel.loadHistory(userId);
      updateState();
    },
    [viewModel, updateState]
  );

  const clearHistory = useCallback(() => {
    viewModel.clearHistory();
    updateState();
  }, [viewModel, updateState]);

  useEffect(() => {
    if (user?.id) {
      loadHistory(user.id);
    }
  }, [user?.id]);

  return {
    ...state,
    loadHistory,
    clearHistory,
  };
}
