import { PaywallViewModel } from '../PaywallViewModel';
import { revenueCatService } from '../../../services/revenueCatService';
import { logger } from '../../../utils/logger';
import { errorLoggingService } from '../../../services/errorLoggingService';
import { Alert } from 'react-native';
import type { PurchasesPackage, PurchasesOfferings, CustomerInfo } from 'react-native-purchases';

// Mock dependencies
jest.mock('../../../services/revenueCatService');
jest.mock('../../../utils/logger');
jest.mock('../../../services/errorLoggingService');
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe('PaywallViewModel', () => {
  let viewModel: PaywallViewModel;
  let mockOfferings: PurchasesOfferings;
  let mockPackage: PurchasesPackage;
  let mockCustomerInfo: CustomerInfo;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create new ViewModel instance for each test
    viewModel = new PaywallViewModel();

    // Setup mock data
    mockPackage = {
      identifier: '$rc_monthly',
      packageType: 'MONTHLY',
      product: {
        identifier: 'premium_monthly',
        priceString: '$9.99',
        price: 9.99,
        currencyCode: 'USD',
        title: 'Premium Monthly',
        description: 'Premium subscription',
      },
      offeringIdentifier: 'default',
    } as PurchasesPackage;

    mockOfferings = {
      current: {
        identifier: 'default',
        serverDescription: 'Default offering',
        availablePackages: [mockPackage],
        monthly: mockPackage,
      },
      all: {},
    } as PurchasesOfferings;

    mockCustomerInfo = {
      activeSubscriptions: ['premium_monthly'],
      entitlements: {
        active: {
          premium: {
            identifier: 'premium',
            isActive: true,
            productIdentifier: 'premium_monthly',
          },
        },
        all: {},
      },
    } as unknown as CustomerInfo;
  });

  afterEach(() => {
    // Clean up
    viewModel.dispose();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const state = viewModel.getState();

      expect(state.offerings).toBeNull();
      expect(state.selectedPackage).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.purchaseInProgress).toBe(false);
      expect(state.isPremium).toBe(false);
    });
  });

  describe('loadOfferings', () => {
    it('should load offerings successfully', async () => {
      (revenueCatService.getOfferings as jest.Mock).mockResolvedValue(mockOfferings);
      (revenueCatService.getCustomerInfo as jest.Mock).mockResolvedValue(mockCustomerInfo);
      (revenueCatService.hasPremiumAccess as jest.Mock).mockReturnValue(false);

      await viewModel.loadOfferings();

      const state = viewModel.getState();

      expect(state.offerings).toEqual(mockOfferings);
      expect(state.selectedPackage).toEqual(mockPackage);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(revenueCatService.getOfferings).toHaveBeenCalledTimes(1);
    });

    it('should handle offerings with no current offering', async () => {
      const emptyOfferings = { ...mockOfferings, current: null };
      (revenueCatService.getOfferings as jest.Mock).mockResolvedValue(emptyOfferings);

      await expect(viewModel.loadOfferings()).rejects.toThrow(
        'No offerings available. Please check your RevenueCat configuration.'
      );

      const state = viewModel.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBeTruthy();
      expect(errorLoggingService.logError).toHaveBeenCalled();
    });

    it('should handle loading error', async () => {
      const error = new Error('Network error');
      (revenueCatService.getOfferings as jest.Mock).mockRejectedValue(error);

      await expect(viewModel.loadOfferings()).rejects.toThrow('Network error');

      const state = viewModel.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
      expect(errorLoggingService.logError).toHaveBeenCalledWith(error, null, {
        service: 'REVENUECAT',
        operation: 'loadOfferings',
      });
    });
  });

  describe('checkPremiumStatus', () => {
    it('should check premium status successfully', async () => {
      (revenueCatService.getCustomerInfo as jest.Mock).mockResolvedValue(mockCustomerInfo);
      (revenueCatService.hasPremiumAccess as jest.Mock).mockReturnValue(true);

      const isPremium = await viewModel.checkPremiumStatus();

      expect(isPremium).toBe(true);
      expect(viewModel.getState().isPremium).toBe(true);
      expect(revenueCatService.getCustomerInfo).toHaveBeenCalledTimes(1);
      expect(revenueCatService.hasPremiumAccess).toHaveBeenCalledWith(mockCustomerInfo);
    });

    it('should handle check premium status error', async () => {
      const error = new Error('Failed to get customer info');
      (revenueCatService.getCustomerInfo as jest.Mock).mockRejectedValue(error);

      const isPremium = await viewModel.checkPremiumStatus();

      expect(isPremium).toBe(false);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('selectPackage', () => {
    it('should select a package', () => {
      viewModel.selectPackage(mockPackage);

      const state = viewModel.getState();
      expect(state.selectedPackage).toEqual(mockPackage);
      expect(logger.debug).toHaveBeenCalledWith('PaywallViewModel: Package selected', {
        packageId: mockPackage.identifier,
        productId: mockPackage.product.identifier,
      });
    });
  });

  describe('purchasePackage', () => {
    beforeEach(() => {
      // Pre-select a package
      viewModel.selectPackage(mockPackage);
    });

    it('should purchase package successfully', async () => {
      (revenueCatService.purchasePackage as jest.Mock).mockResolvedValue({
        customerInfo: mockCustomerInfo,
        productIdentifier: 'premium_monthly',
      });
      (revenueCatService.hasPremiumAccess as jest.Mock).mockReturnValue(true);

      const success = await viewModel.purchasePackage();

      expect(success).toBe(true);
      expect(viewModel.getState().isPremium).toBe(true);
      expect(viewModel.getState().purchaseInProgress).toBe(false);
      expect(revenueCatService.purchasePackage).toHaveBeenCalledWith(mockPackage);
    });

    it('should handle no selected package', async () => {
      const freshViewModel = new PaywallViewModel();

      const success = await freshViewModel.purchasePackage();

      expect(success).toBe(false);
      expect(freshViewModel.getState().error).toBe('Please select a subscription plan');
      expect(revenueCatService.purchasePackage).not.toHaveBeenCalled();

      freshViewModel.dispose();
    });

    it('should handle purchase error', async () => {
      const error = new Error('Purchase failed');
      (revenueCatService.purchasePackage as jest.Mock).mockRejectedValue(error);

      const success = await viewModel.purchasePackage();

      expect(success).toBe(false);
      expect(viewModel.getState().purchaseInProgress).toBe(false);
      expect(viewModel.getState().error).toBe('Purchase failed');
      expect(Alert.alert).toHaveBeenCalledWith('Purchase Failed', 'Purchase failed', [
        { text: 'OK' },
      ]);
      expect(errorLoggingService.logError).toHaveBeenCalled();
    });

    it('should handle user cancelled purchase', async () => {
      const error = new Error('User cancelled purchase');
      (revenueCatService.purchasePackage as jest.Mock).mockRejectedValue(error);

      const success = await viewModel.purchasePackage();

      expect(success).toBe(false);
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  describe('restorePurchases', () => {
    it('should restore purchases successfully with premium', async () => {
      (revenueCatService.restorePurchases as jest.Mock).mockResolvedValue(mockCustomerInfo);
      (revenueCatService.hasPremiumAccess as jest.Mock).mockReturnValue(true);

      const success = await viewModel.restorePurchases();

      expect(success).toBe(true);
      expect(viewModel.getState().isPremium).toBe(true);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Your purchases have been restored!',
        [{ text: 'OK' }]
      );
    });

    it('should restore purchases with no premium found', async () => {
      (revenueCatService.restorePurchases as jest.Mock).mockResolvedValue(mockCustomerInfo);
      (revenueCatService.hasPremiumAccess as jest.Mock).mockReturnValue(false);

      const success = await viewModel.restorePurchases();

      expect(success).toBe(false);
      expect(viewModel.getState().isPremium).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith(
        'No Purchases Found',
        'No active subscriptions were found.',
        [{ text: 'OK' }]
      );
    });

    it('should handle restore error', async () => {
      const error = new Error('Restore failed');
      (revenueCatService.restorePurchases as jest.Mock).mockRejectedValue(error);

      const success = await viewModel.restorePurchases();

      expect(success).toBe(false);
      expect(viewModel.getState().error).toBe('Restore failed');
      expect(Alert.alert).toHaveBeenCalledWith('Restore Failed', 'Restore failed', [
        { text: 'OK' },
      ]);
      expect(errorLoggingService.logError).toHaveBeenCalled();
    });
  });

  describe('helper methods', () => {
    it('should get package price', () => {
      const price = viewModel.getPackagePrice(mockPackage);
      expect(price).toBe('$9.99');
    });

    it('should get package duration for monthly', () => {
      const duration = viewModel.getPackageDuration(mockPackage);
      expect(duration).toBe('per month');
    });

    it('should get package duration for annual', () => {
      const annualPackage = {
        ...mockPackage,
        identifier: '$rc_annual',
      } as PurchasesPackage;

      const duration = viewModel.getPackageDuration(annualPackage);
      expect(duration).toBe('per year');
    });

    it('should get package duration for weekly', () => {
      const weeklyPackage = {
        ...mockPackage,
        identifier: '$rc_weekly',
      } as PurchasesPackage;

      const duration = viewModel.getPackageDuration(weeklyPackage);
      expect(duration).toBe('per week');
    });

    it('should get package duration for lifetime', () => {
      const lifetimePackage = {
        ...mockPackage,
        identifier: '$rc_lifetime',
      } as PurchasesPackage;

      const duration = viewModel.getPackageDuration(lifetimePackage);
      expect(duration).toBe('one-time payment');
    });
  });

  describe('state management', () => {
    it('should subscribe to state changes', () => {
      const listener = jest.fn();
      const unsubscribe = viewModel.subscribe(listener);

      viewModel.selectPackage(mockPackage);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedPackage: mockPackage,
        })
      );

      unsubscribe();
      viewModel.clearError();

      // Should not be called again after unsubscribe
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should clear error', () => {
      // Set an error first
      viewModel['setState']({ error: 'Test error' });
      expect(viewModel.getState().error).toBe('Test error');

      viewModel.clearError();
      expect(viewModel.getState().error).toBeNull();
    });

    it('should dispose and clear listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      viewModel.subscribe(listener1);
      viewModel.subscribe(listener2);

      viewModel.dispose();

      viewModel.selectPackage(mockPackage);

      // Listeners should not be called after dispose
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle offerings with empty packages array', async () => {
      const emptyPackagesOfferings = {
        ...mockOfferings,
        current: {
          ...mockOfferings.current!,
          availablePackages: [],
        },
      };

      (revenueCatService.getOfferings as jest.Mock).mockResolvedValue(emptyPackagesOfferings);
      (revenueCatService.getCustomerInfo as jest.Mock).mockResolvedValue(mockCustomerInfo);
      (revenueCatService.hasPremiumAccess as jest.Mock).mockReturnValue(false);

      await viewModel.loadOfferings();

      const state = viewModel.getState();
      expect(state.selectedPackage).toBeNull();
    });

    it('should handle non-Error objects in catch blocks', async () => {
      (revenueCatService.getOfferings as jest.Mock).mockRejectedValue('String error');

      await expect(viewModel.loadOfferings()).rejects.toThrow();

      const state = viewModel.getState();
      expect(state.error).toBe('Failed to load subscription plans');
    });
  });
});
