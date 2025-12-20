import { useState, useEffect, useCallback } from 'react';
import { paywallViewModel, PaywallViewModel } from '../viewmodels/PaywallViewModel';
import type { PurchasesPackage } from 'react-native-purchases';

/**
 * usePaywall Hook
 * React hook for accessing PaywallViewModel state and methods
 * Provides automatic state updates and cleanup
 */

interface UsePaywallResult {
  // State
  offerings: ReturnType<PaywallViewModel['getState']>['offerings'];
  selectedPackage: ReturnType<PaywallViewModel['getState']>['selectedPackage'];
  loading: boolean;
  error: string | null;
  purchaseInProgress: boolean;
  isPremium: boolean;

  // Actions
  loadOfferings: () => Promise<void>;
  checkPremiumStatus: () => Promise<boolean>;
  selectPackage: (pkg: PurchasesPackage) => void;
  purchasePackage: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  clearError: () => void;

  // Helpers
  getPackagePrice: (pkg: PurchasesPackage) => string;
  getPackageDuration: (pkg: PurchasesPackage) => string;
}

export function usePaywall(): UsePaywallResult {
  // Subscribe to ViewModel state
  const [state, setState] = useState(paywallViewModel.getState());

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = paywallViewModel.subscribe(newState => {
      setState(newState);
    });

    // Initial state sync
    setState(paywallViewModel.getState());

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Memoized action handlers
  const loadOfferings = useCallback(async () => {
    return paywallViewModel.loadOfferings();
  }, []);

  const checkPremiumStatus = useCallback(async () => {
    return paywallViewModel.checkPremiumStatus();
  }, []);

  const selectPackage = useCallback((pkg: PurchasesPackage) => {
    paywallViewModel.selectPackage(pkg);
  }, []);

  const purchasePackage = useCallback(async () => {
    return paywallViewModel.purchasePackage();
  }, []);

  const restorePurchases = useCallback(async () => {
    return paywallViewModel.restorePurchases();
  }, []);

  const clearError = useCallback(() => {
    paywallViewModel.clearError();
  }, []);

  const getPackagePrice = useCallback((pkg: PurchasesPackage) => {
    return paywallViewModel.getPackagePrice(pkg);
  }, []);

  const getPackageDuration = useCallback((pkg: PurchasesPackage) => {
    return paywallViewModel.getPackageDuration(pkg);
  }, []);

  return {
    // State
    offerings: state.offerings,
    selectedPackage: state.selectedPackage,
    loading: state.loading,
    error: state.error,
    purchaseInProgress: state.purchaseInProgress,
    isPremium: state.isPremium,

    // Actions
    loadOfferings,
    checkPremiumStatus,
    selectPackage,
    purchasePackage,
    restorePurchases,
    clearError,

    // Helpers
    getPackagePrice,
    getPackageDuration,
  };
}
