import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../utils/logger';
import { errorLoggingService } from '../../services/errorLoggingService';

/**
 * OnboardingViewModel
 * Handles onboarding flow business logic and state management
 * Follows MVVM pattern for separation of concerns
 */

const ONBOARDING_COMPLETED_KEY = '@monzieai:onboarding_completed';
const ONBOARDING_STEPS_KEY = '@monzieai:onboarding_steps_viewed';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  image?: string;
}

interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  completed: boolean;
  loading: boolean;
  error: string | null;
  steps: OnboardingStep[];
}

const DEFAULT_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to MonzieAI',
    description: 'Create stunning AI-generated images with just a few taps',
  },
  {
    id: 'scenes',
    title: 'Choose Your Scene',
    description: 'Browse through hundreds of creative scenes and styles',
  },
  {
    id: 'upload',
    title: 'Upload Your Photo',
    description: 'Take a selfie or choose a photo from your gallery',
  },
  {
    id: 'generate',
    title: 'Generate Magic',
    description: 'Watch as AI transforms your photo into amazing artwork',
  },
  {
    id: 'share',
    title: 'Save & Share',
    description: 'Download your creations and share them with the world',
  },
];

export class OnboardingViewModel {
  private state: OnboardingState = {
    currentStep: 0,
    totalSteps: DEFAULT_ONBOARDING_STEPS.length,
    completed: false,
    loading: false,
    error: null,
    steps: DEFAULT_ONBOARDING_STEPS,
  };

  private listeners: Set<(state: OnboardingState) => void> = new Set();

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: OnboardingState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  /**
   * Update state and notify listeners
   */
  private setState(updates: Partial<OnboardingState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state snapshot
   */
  getState(): OnboardingState {
    return { ...this.state };
  }

  /**
   * Initialize onboarding state
   */
  async initialize(): Promise<void> {
    try {
      this.setState({ loading: true, error: null });

      logger.debug('OnboardingViewModel: Initializing');

      // Check if onboarding was already completed
      const completedStatus = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      const isCompleted = completedStatus === 'true';

      // Load last viewed step
      const stepsViewed = await AsyncStorage.getItem(ONBOARDING_STEPS_KEY);
      const lastStep = stepsViewed ? parseInt(stepsViewed, 10) : 0;

      logger.debug('OnboardingViewModel: Initialization complete', {
        isCompleted,
        lastStep,
      });

      this.setState({
        completed: isCompleted,
        currentStep: isCompleted ? this.state.totalSteps - 1 : lastStep,
        loading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to initialize onboarding';

      logger.error('OnboardingViewModel: Initialization failed', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'ASYNC_STORAGE',
        operation: 'initialize',
      });

      this.setState({
        loading: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Move to next step
   */
  async goToNextStep(): Promise<boolean> {
    const { currentStep, totalSteps } = this.state;

    if (currentStep >= totalSteps - 1) {
      // Last step - complete onboarding
      return this.completeOnboarding();
    }

    try {
      const nextStep = currentStep + 1;

      logger.debug('OnboardingViewModel: Moving to next step', {
        currentStep,
        nextStep,
      });

      // Save progress
      await AsyncStorage.setItem(ONBOARDING_STEPS_KEY, nextStep.toString());

      this.setState({ currentStep: nextStep });

      return true;
    } catch (error) {
      logger.error('OnboardingViewModel: Failed to move to next step', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'ASYNC_STORAGE',
        operation: 'goToNextStep',
      });

      return false;
    }
  }

  /**
   * Move to previous step
   */
  goToPreviousStep(): boolean {
    const { currentStep } = this.state;

    if (currentStep <= 0) {
      return false;
    }

    const previousStep = currentStep - 1;

    logger.debug('OnboardingViewModel: Moving to previous step', {
      currentStep,
      previousStep,
    });

    this.setState({ currentStep: previousStep });

    return true;
  }

  /**
   * Jump to specific step
   */
  async goToStep(stepIndex: number): Promise<boolean> {
    const { totalSteps } = this.state;

    if (stepIndex < 0 || stepIndex >= totalSteps) {
      logger.warn('OnboardingViewModel: Invalid step index', { stepIndex, totalSteps });
      return false;
    }

    try {
      logger.debug('OnboardingViewModel: Jumping to step', { stepIndex });

      // Save progress
      await AsyncStorage.setItem(ONBOARDING_STEPS_KEY, stepIndex.toString());

      this.setState({ currentStep: stepIndex });

      return true;
    } catch (error) {
      logger.error('OnboardingViewModel: Failed to jump to step', error as Error);
      return false;
    }
  }

  /**
   * Skip onboarding
   */
  async skipOnboarding(): Promise<boolean> {
    try {
      logger.debug('OnboardingViewModel: Skipping onboarding');

      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      await AsyncStorage.setItem(ONBOARDING_STEPS_KEY, this.state.totalSteps.toString());

      this.setState({
        completed: true,
        currentStep: this.state.totalSteps - 1,
      });

      logger.info('OnboardingViewModel: Onboarding skipped');

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to skip onboarding';

      logger.error('OnboardingViewModel: Failed to skip onboarding', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'ASYNC_STORAGE',
        operation: 'skipOnboarding',
      });

      this.setState({ error: errorMessage });

      return false;
    }
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(): Promise<boolean> {
    try {
      this.setState({ loading: true, error: null });

      logger.debug('OnboardingViewModel: Completing onboarding');

      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      await AsyncStorage.setItem(ONBOARDING_STEPS_KEY, this.state.totalSteps.toString());

      this.setState({
        completed: true,
        currentStep: this.state.totalSteps - 1,
        loading: false,
      });

      logger.info('OnboardingViewModel: Onboarding completed', {
        totalStepsViewed: this.state.totalSteps,
      });

      // Track onboarding completion
      try {
        // Analytics tracking would go here
        logger.debug('OnboardingViewModel: Analytics tracked', {
          event: 'onboarding_completed',
          properties: {
            steps_viewed: this.state.totalSteps,
          },
        });
      } catch (analyticsError) {
        logger.warn('OnboardingViewModel: Analytics tracking failed', analyticsError as Error);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete onboarding';

      logger.error('OnboardingViewModel: Failed to complete onboarding', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'ASYNC_STORAGE',
        operation: 'completeOnboarding',
      });

      this.setState({
        loading: false,
        error: errorMessage,
      });

      return false;
    }
  }

  /**
   * Reset onboarding (for testing/debugging)
   */
  async resetOnboarding(): Promise<boolean> {
    try {
      logger.debug('OnboardingViewModel: Resetting onboarding');

      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      await AsyncStorage.removeItem(ONBOARDING_STEPS_KEY);

      this.setState({
        currentStep: 0,
        completed: false,
        error: null,
      });

      logger.info('OnboardingViewModel: Onboarding reset');

      return true;
    } catch (error) {
      logger.error('OnboardingViewModel: Failed to reset onboarding', error as Error);
      return false;
    }
  }

  /**
   * Get current step data
   */
  getCurrentStep(): OnboardingStep | null {
    const { currentStep, steps } = this.state;
    return steps[currentStep] || null;
  }

  /**
   * Get step by index
   */
  getStep(index: number): OnboardingStep | null {
    const { steps } = this.state;
    return steps[index] || null;
  }

  /**
   * Check if on first step
   */
  isFirstStep(): boolean {
    return this.state.currentStep === 0;
  }

  /**
   * Check if on last step
   */
  isLastStep(): boolean {
    return this.state.currentStep === this.state.totalSteps - 1;
  }

  /**
   * Get progress percentage (0-100)
   */
  getProgress(): number {
    const { currentStep, totalSteps } = this.state;
    return Math.round(((currentStep + 1) / totalSteps) * 100);
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.setState({ error: null });
  }

  /**
   * Set custom onboarding steps
   */
  setSteps(steps: OnboardingStep[]): void {
    if (steps.length === 0) {
      logger.warn('OnboardingViewModel: Cannot set empty steps array');
      return;
    }

    logger.debug('OnboardingViewModel: Setting custom steps', { count: steps.length });

    this.setState({
      steps,
      totalSteps: steps.length,
      currentStep: Math.min(this.state.currentStep, steps.length - 1),
    });
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.listeners.clear();
    logger.debug('OnboardingViewModel: Disposed');
  }
}

// Export singleton instance
export const onboardingViewModel = new OnboardingViewModel();
