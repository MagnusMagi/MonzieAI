import { useState, useEffect, useCallback } from 'react';
import {
  privacySettingsViewModel,
  PrivacySettingsViewModel,
  PrivacySettings,
} from '../viewmodels/PrivacySettingsViewModel';

/**
 * usePrivacySettings Hook
 * React hook for accessing PrivacySettingsViewModel state and methods
 * Provides automatic state updates and cleanup
 */

interface UsePrivacySettingsResult {
  // State
  settings: PrivacySettings;
  loading: boolean;
  saving: boolean;
  error: string | null;

  // Actions
  loadSettings: () => Promise<void>;
  updateSetting: (key: keyof PrivacySettings, value: boolean) => Promise<boolean>;
  saveAllSettings: () => Promise<boolean>;
  requestDataDeletion: () => Promise<boolean>;
  exportUserData: () => Promise<boolean>;
  clearCache: () => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  clearError: () => void;

  // Helpers
  getSetting: (key: keyof PrivacySettings) => boolean;
}

export function usePrivacySettings(): UsePrivacySettingsResult {
  // Subscribe to ViewModel state
  const [state, setState] = useState(privacySettingsViewModel.getState());

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = privacySettingsViewModel.subscribe(newState => {
      setState(newState);
    });

    // Initial state sync
    setState(privacySettingsViewModel.getState());

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Memoized action handlers
  const loadSettings = useCallback(async () => {
    return privacySettingsViewModel.loadSettings();
  }, []);

  const updateSetting = useCallback(async (key: keyof PrivacySettings, value: boolean) => {
    return privacySettingsViewModel.updateSetting(key, value);
  }, []);

  const saveAllSettings = useCallback(async () => {
    return privacySettingsViewModel.saveAllSettings();
  }, []);

  const requestDataDeletion = useCallback(async () => {
    return privacySettingsViewModel.requestDataDeletion();
  }, []);

  const exportUserData = useCallback(async () => {
    return privacySettingsViewModel.exportUserData();
  }, []);

  const clearCache = useCallback(async () => {
    return privacySettingsViewModel.clearCache();
  }, []);

  const resetToDefaults = useCallback(async () => {
    return privacySettingsViewModel.resetToDefaults();
  }, []);

  const clearError = useCallback(() => {
    privacySettingsViewModel.clearError();
  }, []);

  const getSetting = useCallback((key: keyof PrivacySettings) => {
    return privacySettingsViewModel.getSetting(key);
  }, []);

  return {
    // State
    settings: state.settings,
    loading: state.loading,
    saving: state.saving,
    error: state.error,

    // Actions
    loadSettings,
    updateSetting,
    saveAllSettings,
    requestDataDeletion,
    exportUserData,
    clearCache,
    resetToDefaults,
    clearError,

    // Helpers
    getSetting,
  };
}
