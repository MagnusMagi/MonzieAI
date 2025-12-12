import { useState, useEffect, useCallback } from 'react';
import { SettingsViewModel } from '../viewmodels/SettingsViewModel';

/**
 * Hook for Settings ViewModel
 * Provides reactive state management for Settings screen
 */
export function useSettingsViewModel() {
  const [viewModel] = useState(() => new SettingsViewModel());

  const [state, setState] = useState(() => viewModel.getState());

  // Update state when ViewModel changes
  const updateState = useCallback(() => {
    setState(viewModel.getState());
  }, [viewModel]);

  // Check notifications module
  const checkNotificationsModule = useCallback(() => {
    viewModel.checkNotificationsModule();
    updateState();
  }, [viewModel, updateState]);

  // Load preferences
  const loadPreferences = useCallback(async () => {
    await viewModel.loadPreferences();
    updateState();
  }, [viewModel, updateState]);

  // Update notifications
  const updateNotifications = useCallback(
    async (value: boolean) => {
      const result = await viewModel.updateNotifications(value);
      updateState();
      return result;
    },
    [viewModel, updateState]
  );

  // Update auto save
  const updateAutoSave = useCallback(
    async (value: boolean) => {
      await viewModel.updateAutoSave(value);
      updateState();
    },
    [viewModel, updateState]
  );

  // Initial load
  useEffect(() => {
    checkNotificationsModule();
    loadPreferences();
  }, []);

  return {
    ...state,
    checkNotificationsModule,
    loadPreferences,
    updateNotifications,
    updateAutoSave,
  };
}
