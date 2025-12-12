import { useState, useEffect, useCallback } from 'react';
import { SubscriptionViewModel } from '../viewmodels/SubscriptionViewModel';
import { SubscriptionRepository } from '../../data/repositories/SubscriptionRepository';

/**
 * Hook for Subscription ViewModel
 * Provides reactive state management for Subscription screen
 */
export function useSubscriptionViewModel() {
  const subscriptionRepository = new SubscriptionRepository();
  const [viewModel] = useState(() => new SubscriptionViewModel(subscriptionRepository));

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
