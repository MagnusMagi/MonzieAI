import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { revenueCatService } from '../../services/revenueCatService';
import { logger } from '../../utils/logger';
import { errorLoggingService } from '../../services/errorLoggingService';
import type {
  RevenueCatPackage,
  RevenueCatOfferingsResponse,
} from '../../services/revenueCatService';

/**
 * PaywallViewModel
 * Handles paywall business logic and state management
 * Follows MVVM pattern for separation of concerns
 */

interface PaywallState {
  offerings: RevenueCatOfferingsResponse | null;
  selectedPackage: RevenueCatPackage | null;
  loading: boolean;
  error: string | null;
  purchaseInProgress: boolean;
  isPremium: boolean;
}

export class PaywallViewModel {
  private state: PaywallState = {
    offerings: null,
    selectedPackage: null,
    loading: false,
    error: null,
    purchaseInProgress: false,
    isPremium: false,
  };

  private listeners: Set<(state: PaywallState) => void> = new Set();

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: PaywallState) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
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
  private setState(updates: Partial<PaywallState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state snapshot
   */
  getState(): PaywallState {
    return { ...this.state };
  }

  /**
   * Initialize and load offerings from RevenueCat
   */
  async loadOfferings(): Promise<void> {
    try {
      this.setState({ loading: true, error: null });

      logger.debug('PaywallViewModel: Loading offerings');

      // Get current offerings from RevenueCat
      const offerings = await revenueCatService.getOfferings();

      if (!offerings.current) {
        throw new Error('No offerings available. Please check your RevenueCat configuration.');
      }

      logger.debug('PaywallViewModel: Offerings loaded', {
        offeringId: offerings.current.identifier,
        packagesCount: offerings.current.availablePackages.length,
      });

      // Auto-select the first package if available
      const defaultPackage = offerings.current.availablePackages[0] || null;

      this.setState({
        offerings,
        selectedPackage: defaultPackage,
        loading: false,
      });

      // Check premium status
      await this.checkPremiumStatus();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load subscription plans';

      logger.error('PaywallViewModel: Failed to load offerings', error as Error);
      errorLoggingService.logError(error, null, {
        service: 'REVENUECAT',
        operation: 'loadOfferings',
      });

      this.setState({
        loading: false,
        error: errorMessage,
      });

      throw error;
    }
  }

  /**
   * Check if user has premium access
   */
  async checkPremiumStatus(): Promise<boolean> {
    try {
      const customerInfo = await revenueCatService.getCustomerInfo();
      const isPremium = revenueCatService.hasPremiumAccess(customerInfo);

      this.setState({ isPremium });

      logger.debug('PaywallViewModel: Premium status checked', { isPremium });

      return isPremium;
    } catch (error) {
      logger.warn('PaywallViewModel: Failed to check premium status', error as Error);
      return false;
    }
  }

  /**
   * Select a package for purchase
   */
  selectPackage(pkg: PurchasesPackage): void {
    logger.debug('PaywallViewModel: Package selected', {
      packageId: pkg.identifier,
      productId: pkg.product.identifier,
    });

    this.setState({ selectedPackage: pkg });
  }

  /**
   * Purchase the selected package
   */
  async purchasePackage(): Promise<boolean> {
    const { selectedPackage } = this.state;

    if (!selectedPackage) {
      this.setState({ error: 'Please select a subscription plan' });
      return false;
    }

    try {
      this.setState({ purchaseInProgress: true, error: null });

      logger.debug('PaywallViewModel: Starting purchase', {
        packageId: selectedPackage.identifier,
        productId: selectedPackage.product.identifier,
      });

      const { customerInfo } = await revenueCatService.purchasePackage(selectedPackage);

      const isPremium = revenueCatService.hasPremiumAccess(customerInfo);

      logger.info('PaywallViewModel: Purchase successful', {
        isPremium,
        productId: selectedPackage.product.identifier,
      });

      this.setState({
        purchaseInProgress: false,
        isPremium,
      });

      return isPremium;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Purchase failed. Please try again.';

      logger.error('PaywallViewModel: Purchase failed', error as Error, {
        packageId: selectedPackage.identifier,
        productId: selectedPackage.product.identifier,
      });

      errorLoggingService.logError(error, null, {
        service: 'REVENUECAT',
        operation: 'purchasePackage',
        productId: selectedPackage.product.identifier,
      });

      this.setState({
        purchaseInProgress: false,
        error: errorMessage,
      });

      // Show user-friendly error message
      Alert.alert('Purchase Failed', errorMessage, [{ text: 'OK' }]);

      return false;
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<boolean> {
    try {
      this.setState({ loading: true, error: null });

      logger.debug('PaywallViewModel: Restoring purchases');

      const customerInfo = await revenueCatService.restorePurchases();
      const isPremium = revenueCatService.hasPremiumAccess(customerInfo);

      logger.info('PaywallViewModel: Purchases restored', { isPremium });

      this.setState({
        loading: false,
        isPremium,
      });

      if (isPremium) {
        Alert.alert('Success', 'Your purchases have been restored!', [{ text: 'OK' }]);
      } else {
        Alert.alert('No Purchases Found', 'No active subscriptions were found.', [{ text: 'OK' }]);
      }

      return isPremium;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to restore purchases. Please try again.';

      logger.error('PaywallViewModel: Failed to restore purchases', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'REVENUECAT',
        operation: 'restorePurchases',
      });

      this.setState({
        loading: false,
        error: errorMessage,
      });

      Alert.alert('Restore Failed', errorMessage, [{ text: 'OK' }]);

      return false;
    }
  }

  /**
   * Get formatted price for a package
   *
   * This function is tolerant to both the original PurchasesPackage shape
   * (which may have `product.priceString`) and the JS stub shape where
   * `product.price` (number) and `product.currencyCode` may be present.
   */
  getPackagePrice(pkg: RevenueCatPackage): string {
    // Prefer `priceString` if available (native SDK)
    const priceString = (pkg as any)?.product?.priceString;
    if (typeof priceString === 'string' && priceString.length > 0) {
      return priceString;
    }

    // Fallback to numeric price + currencyCode (stub shape)
    const price = (pkg as any)?.product?.price;
    const currency = (pkg as any)?.product?.currencyCode || '';
    if (typeof price === 'number' && !Number.isNaN(price)) {
      try {
        // e.g. "USD 19.99" or "$19.99" depending on currencyCode contents
        return (currency ? `${currency} ` : '') + price.toFixed(2);
      } catch {
        return String(price);
      }
    }

    // If nothing available, return an empty string (caller should handle)
    return '';
  }

  /**
   * Get package duration description
   *
   * Tolerant to both native and stub shapes. If the stub provides a
   * `product.subscriptionPeriod`, prefer that. Otherwise infer from the
   * package identifier.
   */
  getPackageDuration(pkg: RevenueCatPackage): string {
    // Try explicit subscriptionPeriod on product (stub may provide this)
    const subscriptionPeriod = (pkg as any)?.product?.subscriptionPeriod;
    if (typeof subscriptionPeriod === 'string' && subscriptionPeriod.length > 0) {
      return subscriptionPeriod;
    }

    const identifier = ((pkg && (pkg as any).identifier) || '').toLowerCase();

    if (identifier.includes('annual') || identifier.includes('yearly')) {
      return 'per year';
    } else if (identifier.includes('monthly')) {
      return 'per month';
    } else if (identifier.includes('weekly')) {
      return 'per week';
    } else if (
      identifier.includes('lifetime') ||
      identifier.includes('one_time') ||
      identifier.includes('one-time')
    ) {
      return 'one-time payment';
    }

    return '';
  }

  /**
   * Clear any error messages
   */
  clearError(): void {
    this.setState({ error: null });
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.listeners.clear();
  }
}

// Export singleton instance
export const paywallViewModel = new PaywallViewModel();
