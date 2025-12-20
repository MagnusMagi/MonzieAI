import { OnboardingViewModel } from '../OnboardingViewModel';
import { logger } from '../../../utils/logger';
import { errorLoggingService } from '../../../services/errorLoggingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('../../../utils/logger');
jest.mock('../../../services/errorLoggingService');
jest.mock('@react-native-async-storage/async-storage');

describe('OnboardingViewModel', () => {
  let viewModel: OnboardingViewModel;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create new ViewModel instance for each test
    viewModel = new OnboardingViewModel();
  });

  afterEach(() => {
    // Clean up
    viewModel.dispose();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const state = viewModel.getState();

      expect(state.currentStep).toBe(0);
      expect(state.totalSteps).toBe(5);
      expect(state.completed).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.steps).toHaveLength(5);
    });

    it('should load completed status on initialize', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@monzieai:onboarding_completed') return Promise.resolve('true');
        if (key === '@monzieai:onboarding_steps_viewed') return Promise.resolve('3');
        return Promise.resolve(null);
      });

      await viewModel.initialize();

      const state = viewModel.getState();
      expect(state.completed).toBe(true);
      expect(state.currentStep).toBe(4); // Last step when completed
      expect(state.loading).toBe(false);
    });

    it('should load last viewed step on initialize', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@monzieai:onboarding_completed') return Promise.resolve(null);
        if (key === '@monzieai:onboarding_steps_viewed') return Promise.resolve('2');
        return Promise.resolve(null);
      });

      await viewModel.initialize();

      const state = viewModel.getState();
      expect(state.completed).toBe(false);
      expect(state.currentStep).toBe(2);
      expect(state.loading).toBe(false);
    });

    it('should handle initialization error', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(error);

      await viewModel.initialize();

      const state = viewModel.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Storage error');
      expect(errorLoggingService.logError).toHaveBeenCalledWith(error, null, {
        service: 'ASYNC_STORAGE',
        operation: 'initialize',
      });
    });
  });

  describe('goToNextStep', () => {
    it('should move to next step successfully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await viewModel.goToNextStep();

      expect(result).toBe(true);
      expect(viewModel.getState().currentStep).toBe(1);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@monzieai:onboarding_steps_viewed',
        '1'
      );
    });

    it('should complete onboarding on last step', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Move to last step
      viewModel['setState']({ currentStep: 4 });

      const result = await viewModel.goToNextStep();

      expect(result).toBe(true);
      expect(viewModel.getState().completed).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@monzieai:onboarding_completed',
        'true'
      );
    });

    it('should handle next step error', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      const result = await viewModel.goToNextStep();

      expect(result).toBe(false);
      expect(errorLoggingService.logError).toHaveBeenCalled();
    });
  });

  describe('goToPreviousStep', () => {
    it('should move to previous step', () => {
      viewModel['setState']({ currentStep: 2 });

      const result = viewModel.goToPreviousStep();

      expect(result).toBe(true);
      expect(viewModel.getState().currentStep).toBe(1);
    });

    it('should not move before first step', () => {
      viewModel['setState']({ currentStep: 0 });

      const result = viewModel.goToPreviousStep();

      expect(result).toBe(false);
      expect(viewModel.getState().currentStep).toBe(0);
    });
  });

  describe('goToStep', () => {
    it('should jump to specific step', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await viewModel.goToStep(3);

      expect(result).toBe(true);
      expect(viewModel.getState().currentStep).toBe(3);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@monzieai:onboarding_steps_viewed',
        '3'
      );
    });

    it('should reject invalid step index (negative)', async () => {
      const result = await viewModel.goToStep(-1);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should reject invalid step index (too large)', async () => {
      const result = await viewModel.goToStep(10);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle jump error', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      const result = await viewModel.goToStep(2);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('skipOnboarding', () => {
    it('should skip onboarding successfully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await viewModel.skipOnboarding();

      expect(result).toBe(true);
      expect(viewModel.getState().completed).toBe(true);
      expect(viewModel.getState().currentStep).toBe(4);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@monzieai:onboarding_completed',
        'true'
      );
    });

    it('should handle skip error', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      const result = await viewModel.skipOnboarding();

      expect(result).toBe(false);
      expect(viewModel.getState().error).toBe('Storage error');
      expect(errorLoggingService.logError).toHaveBeenCalled();
    });
  });

  describe('completeOnboarding', () => {
    it('should complete onboarding successfully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await viewModel.completeOnboarding();

      expect(result).toBe(true);
      expect(viewModel.getState().completed).toBe(true);
      expect(viewModel.getState().loading).toBe(false);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@monzieai:onboarding_completed',
        'true'
      );
      expect(logger.info).toHaveBeenCalledWith(
        'OnboardingViewModel: Onboarding completed',
        expect.objectContaining({
          totalStepsViewed: 5,
        })
      );
    });

    it('should handle completion error', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      const result = await viewModel.completeOnboarding();

      expect(result).toBe(false);
      expect(viewModel.getState().error).toBe('Storage error');
      expect(viewModel.getState().loading).toBe(false);
      expect(errorLoggingService.logError).toHaveBeenCalled();
    });
  });

  describe('resetOnboarding', () => {
    it('should reset onboarding successfully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      viewModel['setState']({ currentStep: 3, completed: true });

      const result = await viewModel.resetOnboarding();

      expect(result).toBe(true);
      expect(viewModel.getState().currentStep).toBe(0);
      expect(viewModel.getState().completed).toBe(false);
      expect(viewModel.getState().error).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@monzieai:onboarding_completed');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@monzieai:onboarding_steps_viewed');
    });

    it('should handle reset error', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(error);

      const result = await viewModel.resetOnboarding();

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('state management', () => {
    it('should subscribe to state changes', () => {
      const listener = jest.fn();
      const unsubscribe = viewModel.subscribe(listener);

      viewModel['setState']({ currentStep: 2 });

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: 2,
        })
      );

      unsubscribe();
      viewModel['setState']({ currentStep: 3 });

      // Should not be called again after unsubscribe
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should clear error', () => {
      viewModel['setState']({ error: 'Test error' });
      expect(viewModel.getState().error).toBe('Test error');

      viewModel.clearError();
      expect(viewModel.getState().error).toBeNull();
    });
  });

  describe('helper methods', () => {
    it('should get current step data', () => {
      viewModel['setState']({ currentStep: 1 });

      const stepData = viewModel.getCurrentStep();

      expect(stepData).toEqual(
        expect.objectContaining({
          id: 'scenes',
          title: 'Choose Your Scene',
        })
      );
    });

    it('should get step by index', () => {
      const step = viewModel.getStep(2);

      expect(step).toEqual(
        expect.objectContaining({
          id: 'upload',
          title: 'Upload Your Photo',
        })
      );
    });

    it('should return null for invalid step index', () => {
      const step = viewModel.getStep(99);
      expect(step).toBeNull();
    });

    it('should check if on first step', () => {
      expect(viewModel.isFirstStep()).toBe(true);

      viewModel['setState']({ currentStep: 1 });
      expect(viewModel.isFirstStep()).toBe(false);
    });

    it('should check if on last step', () => {
      expect(viewModel.isLastStep()).toBe(false);

      viewModel['setState']({ currentStep: 4 });
      expect(viewModel.isLastStep()).toBe(true);
    });

    it('should calculate progress percentage', () => {
      expect(viewModel.getProgress()).toBe(20); // 1/5 = 20%

      viewModel['setState']({ currentStep: 2 });
      expect(viewModel.getProgress()).toBe(60); // 3/5 = 60%

      viewModel['setState']({ currentStep: 4 });
      expect(viewModel.getProgress()).toBe(100); // 5/5 = 100%
    });
  });

  describe('setSteps', () => {
    it('should set custom onboarding steps', () => {
      const customSteps = [
        { id: 'step1', title: 'Step 1', description: 'Description 1' },
        { id: 'step2', title: 'Step 2', description: 'Description 2' },
        { id: 'step3', title: 'Step 3', description: 'Description 3' },
      ];

      viewModel.setSteps(customSteps);

      const state = viewModel.getState();
      expect(state.steps).toEqual(customSteps);
      expect(state.totalSteps).toBe(3);
    });

    it('should adjust current step if exceeds new total', () => {
      viewModel['setState']({ currentStep: 4 });

      const customSteps = [
        { id: 'step1', title: 'Step 1', description: 'Description 1' },
        { id: 'step2', title: 'Step 2', description: 'Description 2' },
      ];

      viewModel.setSteps(customSteps);

      expect(viewModel.getState().currentStep).toBe(1); // Adjusted to last step
    });

    it('should reject empty steps array', () => {
      viewModel.setSteps([]);

      expect(logger.warn).toHaveBeenCalledWith(
        'OnboardingViewModel: Cannot set empty steps array'
      );
      expect(viewModel.getState().totalSteps).toBe(5); // Should remain unchanged
    });
  });

  describe('edge cases', () => {
    it('should handle non-Error objects in catch blocks', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue('String error');

      await viewModel.initialize();

      expect(viewModel.getState().error).toBe('Failed to initialize onboarding');
    });

    it('should dispose and clear listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      viewModel.subscribe(listener1);
      viewModel.subscribe(listener2);

      viewModel.dispose();

      viewModel['setState']({ currentStep: 2 });

      // Listeners should not be called after dispose
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should handle undefined stored values', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await viewModel.initialize();

      const state = viewModel.getState();
      expect(state.completed).toBe(false);
      expect(state.currentStep).toBe(0);
    });

    it('should handle invalid step number in storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@monzieai:onboarding_steps_viewed') return Promise.resolve('invalid');
        return Promise.resolve(null);
      });

      await viewModel.initialize();

      const state = viewModel.getState();
      expect(state.currentStep).toBe(0); // Should default to 0 for NaN
    });
  });
});
