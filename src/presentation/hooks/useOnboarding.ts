import { useState, useEffect, useCallback } from 'react';
import { onboardingViewModel, OnboardingViewModel } from '../viewmodels/OnboardingViewModel';

/**
 * useOnboarding Hook
 * React hook for accessing OnboardingViewModel state and methods
 * Provides automatic state updates and cleanup
 */

interface UseOnboardingResult {
  // State
  currentStep: number;
  totalSteps: number;
  completed: boolean;
  loading: boolean;
  error: string | null;
  steps: ReturnType<OnboardingViewModel['getState']>['steps'];
  currentStepData: ReturnType<OnboardingViewModel['getCurrentStep']>;

  // Actions
  initialize: () => Promise<void>;
  goToNextStep: () => Promise<boolean>;
  goToPreviousStep: () => boolean;
  goToStep: (stepIndex: number) => Promise<boolean>;
  skipOnboarding: () => Promise<boolean>;
  completeOnboarding: () => Promise<boolean>;
  resetOnboarding: () => Promise<boolean>;
  clearError: () => void;

  // Helpers
  isFirstStep: () => boolean;
  isLastStep: () => boolean;
  getProgress: () => number;
  getStep: (index: number) => ReturnType<OnboardingViewModel['getStep']>;
}

export function useOnboarding(): UseOnboardingResult {
  // Subscribe to ViewModel state
  const [state, setState] = useState(onboardingViewModel.getState());
  const [currentStepData, setCurrentStepData] = useState(onboardingViewModel.getCurrentStep());

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = onboardingViewModel.subscribe(newState => {
      setState(newState);
      setCurrentStepData(onboardingViewModel.getCurrentStep());
    });

    // Initial state sync
    setState(onboardingViewModel.getState());
    setCurrentStepData(onboardingViewModel.getCurrentStep());

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Memoized action handlers
  const initialize = useCallback(async () => {
    return onboardingViewModel.initialize();
  }, []);

  const goToNextStep = useCallback(async () => {
    return onboardingViewModel.goToNextStep();
  }, []);

  const goToPreviousStep = useCallback(() => {
    return onboardingViewModel.goToPreviousStep();
  }, []);

  const goToStep = useCallback(async (stepIndex: number) => {
    return onboardingViewModel.goToStep(stepIndex);
  }, []);

  const skipOnboarding = useCallback(async () => {
    return onboardingViewModel.skipOnboarding();
  }, []);

  const completeOnboarding = useCallback(async () => {
    return onboardingViewModel.completeOnboarding();
  }, []);

  const resetOnboarding = useCallback(async () => {
    return onboardingViewModel.resetOnboarding();
  }, []);

  const clearError = useCallback(() => {
    onboardingViewModel.clearError();
  }, []);

  const isFirstStep = useCallback(() => {
    return onboardingViewModel.isFirstStep();
  }, []);

  const isLastStep = useCallback(() => {
    return onboardingViewModel.isLastStep();
  }, []);

  const getProgress = useCallback(() => {
    return onboardingViewModel.getProgress();
  }, []);

  const getStep = useCallback((index: number) => {
    return onboardingViewModel.getStep(index);
  }, []);

  return {
    // State
    currentStep: state.currentStep,
    totalSteps: state.totalSteps,
    completed: state.completed,
    loading: state.loading,
    error: state.error,
    steps: state.steps,
    currentStepData,

    // Actions
    initialize,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    skipOnboarding,
    completeOnboarding,
    resetOnboarding,
    clearError,

    // Helpers
    isFirstStep,
    isLastStep,
    getProgress,
    getStep,
  };
}
