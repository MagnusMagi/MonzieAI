import { useState, useCallback } from 'react';
import { ProfileViewModel } from '../viewmodels/ProfileViewModel';
import { SubscriptionRepository } from '../../data/repositories/SubscriptionRepository';

/**
 * Hook for Profile ViewModel
 * Provides reactive state management for Profile screen
 */
export function useProfileViewModel() {
  const subscriptionRepository = new SubscriptionRepository();
  const [viewModel] = useState(() => new ProfileViewModel(subscriptionRepository));

  const [state, setState] = useState(() => viewModel.getState());

  // Update state when ViewModel changes
  const updateState = useCallback(() => {
    setState(viewModel.getState());
  }, [viewModel]);

  // Load subscription
  const loadSubscription = useCallback(
    async (userId: string) => {
      await viewModel.loadSubscription(userId);
      updateState();
    },
    [viewModel, updateState]
  );

  return {
    ...state,
    loadSubscription,
  };
}
