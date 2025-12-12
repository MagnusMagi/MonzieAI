import { useState, useCallback } from 'react';
import { AuthViewModel } from '../viewmodels/AuthViewModel';

/**
 * Hook for Auth ViewModel
 * Provides reactive state management for Auth screen
 */
export function useAuthViewModel() {
  const [viewModel] = useState(() => new AuthViewModel());

  const [state, setState] = useState(() => viewModel.getState());

  // Update state when ViewModel changes
  const updateState = useCallback(() => {
    setState(viewModel.getState());
  }, [viewModel]);

  // Toggle mode
  const toggleMode = useCallback(() => {
    viewModel.toggleMode();
    updateState();
  }, [viewModel, updateState]);

  // Set email
  const setEmail = useCallback(
    (email: string) => {
      viewModel.setEmail(email);
      updateState();
    },
    [viewModel, updateState]
  );

  // Set password
  const setPassword = useCallback(
    (password: string) => {
      viewModel.setPassword(password);
      updateState();
    },
    [viewModel, updateState]
  );

  // Set name
  const setName = useCallback(
    (name: string) => {
      viewModel.setName(name);
      updateState();
    },
    [viewModel, updateState]
  );

  // Set loading
  const setLoading = useCallback(
    (loading: boolean) => {
      viewModel.setLoading(loading);
      updateState();
    },
    [viewModel, updateState]
  );

  // Set social loading
  const setSocialLoading = useCallback(
    (provider: 'google' | 'apple' | null) => {
      viewModel.setSocialLoading(provider);
      updateState();
    },
    [viewModel, updateState]
  );

  // Set error
  const setError = useCallback(
    (error: unknown) => {
      viewModel.setError(error);
      updateState();
    },
    [viewModel, updateState]
  );

  // Clear error
  const clearError = useCallback(() => {
    viewModel.clearError();
    updateState();
  }, [viewModel, updateState]);

  // Validate form
  const validateForm = useCallback(() => {
    return viewModel.validateForm();
  }, [viewModel]);

  // Get form data
  const getFormData = useCallback(() => {
    return viewModel.getFormData();
  }, [viewModel]);

  return {
    ...state,
    toggleMode,
    setEmail,
    setPassword,
    setName,
    setLoading,
    setSocialLoading,
    setError,
    clearError,
    validateForm,
    getFormData,
  };
}
