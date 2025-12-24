/**
 * Safe no-op stub for RevenueCat integration.
 *
 * This file intentionally does NOT import `react-native-purchases` or any
 * native RevenueCat SDK. It provides a drop-in JavaScript-only stub that:
 * - avoids native initialization (prevents native crashes during app startup)
 * - exposes the same public API surface (names + method signatures)
 * - returns safe defaults or throws informative errors for operations that
 *   require a real native SDK (like purchasing)
 *
 * To restore full functionality later:
 * - Replace this file with the original implementation that imports the native SDK
 * - Or implement a platform-aware loader that only initializes native SDK when
 *   the native module is available and safe to call.
 */
import { logger } from '../utils/logger';

export interface RevenueCatProduct {
  identifier: string;
  title: string;
  description?: string;
  price: number;
  currencyCode: string;
  subscriptionPeriod?: string;
}

export interface RevenueCatPackage {
  identifier: string;
  packageType: string;
  product: RevenueCatProduct;
  offeringIdentifier: string;
}

export interface RevenueCatEntitlementInfo {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  periodType: string;
  latestPurchaseDate: string | null;
  originalPurchaseDate: string | null;
  expirationDate: string | null;
  store: string | null;
  productIdentifier: string | null;
  isSandbox: boolean;
  unsubscribeDetectedAt: string | null;
  billingIssueDetectedAt: string | null;
}

export interface RevenueCatCustomerInfo {
  entitlements: {
    active: Record<string, RevenueCatEntitlementInfo>;
    all: Record<string, RevenueCatEntitlementInfo>;
  };
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  latestExpirationDate: string | null;
  firstSeen: string;
  originalAppUserId: string;
  managementURL?: string;
}

export interface RevenueCatOffering {
  identifier: string;
  serverDescription?: string;
  availablePackages: RevenueCatPackage[];
}

/**
 * RevenueCatService - NO-OP / SAFE STUB
 *
 * Behavior:
 * - `initialize()` marks the stub as initialized but does not load native code.
 * - Methods that would normally call native APIs either return safe defaults
 *   (empty arrays / nulls / false) or throw a clear Error for operations that
 *   cannot be meaningfully fulfilled (like purchases).
 */
class RevenueCatService {
  private initialized = false;
  private currentUserId: string | null = null;

  /**
   * Initialize the (stub) RevenueCat service.
   * This will NOT load any native module. It simply marks the service as ready
   * so other JS code that expects an initialized service can proceed safely.
   */
  async initialize(userId?: string): Promise<void> {
    // We intentionally do not import or initialize native SDK here.
    this.initialized = true;
    this.currentUserId = userId || null;
    logger.info?.('RevenueCat stub initialized (native SDK disabled in this build)');
  }

  /**
   * Identify user in the (stub) service.
   * This is a no-op that stores the id locally.
   */
  async identify(userId: string): Promise<void> {
    if (!this.initialized) {
      logger.warn?.('RevenueCat identify called before initialize; initializing stub automatically');
      await this.initialize(userId);
      return;
    }
    this.currentUserId = userId;
    logger.debug?.('RevenueCat stub identify: user set', { userId });
  }

  /**
   * Safe: return an Offerings-like object similar to Purchases.getOfferings()
   * so callers that access `offerings.current` continue to work.
   *
   * Returns shape: { current: RevenueCatOffering | null, all: Record<string, RevenueCatOffering> }
   */
  async getOfferings(): Promise<{ current: RevenueCatOffering | null; all: Record<string, RevenueCatOffering> }> {
    if (!this.initialized) {
      logger.warn?.('getOfferings called but RevenueCat stub is not initialized');
      return { current: null, all: {} };
    }

    // Provide a safe default: no current offering and empty map.
    return {
      current: null,
      all: {},
    };
  }

  /**
   * Safe: returns null (no offering).
   */
  async getCurrentOffering(): Promise<RevenueCatOffering | null> {
    if (!this.initialized) {
      logger.warn?.('getCurrentOffering called but RevenueCat stub is not initialized');
      return null;
    }
    return null;
  }

  /**
   * Purchase package - not supported in stub
   *
   * We throw an Error to make it explicit to callers that purchasing isn't
   * available in this build. Callers should handle this error gracefully.
   */
  async purchasePackage(_packageToPurchase: RevenueCatPackage): Promise<RevenueCatCustomerInfo> {
    if (!this.initialized) {
      throw new Error('RevenueCat is not initialized (stub).');
    }
    throw new Error(
      'RevenueCat purchases are disabled in this build (native SDK not available).'
    );
  }

  /**
   * Restore purchases - not supported in stub
   */
  async restorePurchases(): Promise<RevenueCatCustomerInfo> {
    if (!this.initialized) {
      throw new Error('RevenueCat is not initialized (stub).');
    }
    throw new Error(
      'RevenueCat restorePurchases is not available in this build (native SDK not available).'
    );
  }

  /**
   * Get customer info - returns an empty-safe customer info structure.
   */
  async getCustomerInfo(): Promise<RevenueCatCustomerInfo | null> {
    if (!this.initialized) {
      logger.warn?.('getCustomerInfo called but RevenueCat stub is not initialized');
      return null;
    }

    // Return a minimal safe structure indicating no entitlements / purchases.
    return {
      entitlements: {
        active: {},
        all: {},
      },
      activeSubscriptions: [],
      allPurchasedProductIdentifiers: [],
      latestExpirationDate: null,
      firstSeen: new Date().toISOString(),
      originalAppUserId: this.currentUserId || 'stub-user',
      managementURL: undefined,
    };
  }

  /**
   * hasPremiumAccess helper - inspects a RevenueCatCustomerInfo-like object
   * and returns true if any active entitlement is active.
   *
   * This is a synchronous helper so callers (including tests) can use it
   * without awaiting.
   */
  hasPremiumAccess(customerInfo?: RevenueCatCustomerInfo | null): boolean {
    if (!customerInfo) return false;
    try {
      const activeEntitlements = customerInfo.entitlements?.active || {};
      return Object.values(activeEntitlements).some(ent => !!ent?.isActive);
    } catch (err) {
      // If shape is unexpected, be conservative and return false
      return false;
    }
  }

  /**
   * isPremium - consults the stubbed getCustomerInfo() and uses hasPremiumAccess
   */
  async isPremium(): Promise<boolean> {
    if (!this.initialized) {
      logger.warn?.('isPremium called but RevenueCat stub is not initialized');
      return false;
    }
    const customerInfo = await this.getCustomerInfo();
    return this.hasPremiumAccess(customerInfo);
  }

  /**
   * getActiveEntitlement - always null in stub
   */
  async getActiveEntitlement(): Promise<RevenueCatEntitlementInfo | null> {
    if (!this.initialized) {
      logger.warn?.('getActiveEntitlement called but RevenueCat stub is not initialized');
      return null;
    }
    return null;
  }

  /**
   * Logout - clear local user id
   */
  async logout(): Promise<void> {
    this.currentUserId = null;
    logger.debug?.('RevenueCat stub logged out');
  }

  /**
   * Convenience: check if stub is initialized
   */
  get isInitialized(): boolean {
    return this.initialized;
   }
 }

 export const revenueCatService = new RevenueCatService();
