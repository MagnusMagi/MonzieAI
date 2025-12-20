import Constants from 'expo-constants';
import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesStoreProduct,
  LOG_LEVEL,
} from 'react-native-purchases';
import { logger } from '../utils/logger';

// Lazy load RevenueCat to avoid import-time errors
let PurchasesModule: typeof Purchases | null = null;
let purchasesImportAttempted = false;
let purchasesImportError: Error | null = null;

function getPurchases(): typeof Purchases | null {
  if (purchasesImportAttempted) {
    return PurchasesModule;
  }

  purchasesImportAttempted = true;

  try {
    PurchasesModule = Purchases;
    logger.debug('RevenueCat module loaded successfully');
  } catch (error) {
    purchasesImportError = error instanceof Error ? error : new Error('Unknown error');
    logger.warn(
      'Failed to import RevenueCat module. The app will continue without RevenueCat features.',
      purchasesImportError
    );
    PurchasesModule = null;
  }

  return PurchasesModule;
}

/**
 * RevenueCat Service
 * Handles subscription management via RevenueCat SDK
 */

// Get platform-specific API key, fallback to generic key
const getRevenueCatApiKey = (): string => {
  const extra = Constants.expoConfig?.extra;
  if (Platform.OS === 'ios' && extra?.revenueCatApiKeyIOS) {
    return extra.revenueCatApiKeyIOS;
  }
  if (Platform.OS === 'android' && extra?.revenueCatApiKeyAndroid) {
    return extra.revenueCatApiKeyAndroid;
  }
  return extra?.revenueCatApiKey || '';
};

export interface RevenueCatProduct {
  identifier: string;
  title: string;
  description?: string;
  price: number;
  currencyCode: string;
  subscriptionPeriod?: string;
}

export interface RevenueCatOffering {
  identifier: string;
  serverDescription?: string;
  availablePackages: RevenueCatPackage[];
}

export interface RevenueCatPackage {
  identifier: string;
  packageType: string;
  product: RevenueCatProduct;
  offeringIdentifier: string;
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

export interface RevenueCatEntitlementInfo {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  periodType: string;
  latestPurchaseDate: string;
  originalPurchaseDate: string;
  expirationDate: string | null;
  store: string;
  productIdentifier: string;
  isSandbox: boolean;
  unsubscribeDetectedAt: string | null;
  billingIssueDetectedAt: string | null;
}

class RevenueCatService {
  private initialized = false;
  private currentUserId: string | null = null;

  /**
   * Initialize RevenueCat SDK
   */
  async initialize(userId?: string): Promise<void> {
    if (this.initialized) {
      logger.debug('RevenueCat already initialized');
      if (userId && userId !== this.currentUserId) {
        await this.identify(userId);
      }
      return;
    }

    try {
      const Purchases = getPurchases();
      if (!Purchases) {
        logger.warn(
          'RevenueCat native module not available. The app will continue without RevenueCat features. ' +
          'To fix: 1) Run "npx expo prebuild --clean", 2) Run "cd ios && pod install", 3) Rebuild the app.'
        );
        return;
      }

      const apiKey = getRevenueCatApiKey();
      if (!apiKey) {
        logger.warn(
          `RevenueCat API key not configured for ${Platform.OS}. ` +
          'Please add revenueCatApiKeyIOS (for iOS, starts with "appl_") or ' +
          'revenueCatApiKeyAndroid (for Android, starts with "goog_") to app.json'
        );
        return;
      }

      // Validate API key format
      // Allow test keys (test_*) for Test Store, production keys (appl_/goog_*) for production
      const isTestKey = apiKey.startsWith('test_');

      // For Test Store, test keys are valid but SDK may still show warnings
      // This is expected behavior - SDK will handle test keys appropriately
      if (isTestKey) {
        logger.info(
          'Using test API key for Test Store. Products will use StoreKit Configuration File.'
        );
      } else {
        // Validate production key format
        if (Platform.OS === 'ios' && !apiKey.startsWith('appl_')) {
          logger.warn(
            `iOS API key format may be incorrect. Expected "appl_" for production, got: ${apiKey.substring(0, 10)}... ` +
            'For Test Store, use test key (test_...). For production, get iOS API key from RevenueCat Dashboard → Project Settings → API Keys'
          );
        }
        if (Platform.OS === 'android' && !apiKey.startsWith('goog_')) {
          logger.warn(
            `Android API key format may be incorrect. Expected "goog_" for production, got: ${apiKey.substring(0, 10)}... ` +
            'For Test Store, use test key (test_...). For production, get Android API key from RevenueCat Dashboard → Project Settings → API Keys'
          );
        }
      }

      // Configure RevenueCat with better error handling
      // Note: SDK may show warnings for test keys, but this is expected for Test Store
      try {
        // Check if configure method exists
        if (typeof Purchases.configure !== 'function') {
          throw new Error(
            'Purchases.configure is not a function. Native module may not be properly linked.'
          );
        }

        await Purchases.configure({ apiKey });

        // Enable debug logs in development
        if (__DEV__) {
          try {
            Purchases.setLogLevel(LOG_LEVEL.DEBUG);
          } catch (logError) {
            logger.warn(
              'Failed to set RevenueCat log level',
              logError instanceof Error ? logError : new Error('Unknown error')
            );
          }
        }

        if (userId) {
          try {
            await this.identify(userId);
          } catch (identifyError) {
            logger.warn(
              'Failed to identify user during initialization',
              identifyError instanceof Error ? identifyError : new Error('Unknown error')
            );
          }
        }

        this.initialized = true;
        this.currentUserId = userId || null;
        logger.info('RevenueCat initialized successfully', { userId: userId || 'anonymous' });
      } catch (nativeError) {
        const errorMessage =
          nativeError instanceof Error ? nativeError.message : 'Unknown native error';
        logger.error(
          'Failed to configure RevenueCat native module. This usually means the native module is not properly linked or there is an issue with the API key.',
          nativeError instanceof Error ? nativeError : new Error('Unknown error'),
          {
            errorMessage,
            platform: Platform.OS,
            apiKeyPrefix: apiKey.substring(0, 10) + '...',
            isTestKey,
            suggestion:
              '1) Run: npx expo prebuild --clean && cd ios && pod install && npx expo run:ios\n' +
              '2) Verify API key format in app.json\n' +
              '3) For iOS simulator, ensure StoreKit Configuration File is set up',
          }
        );
        // Don't mark as initialized if native configuration failed
        this.initialized = false;
        // Don't throw - allow app to continue without RevenueCat
      }
    } catch (error) {
      logger.error(
        'Failed to initialize RevenueCat',
        error instanceof Error ? error : new Error('Unknown error')
      );
      // Don't throw - allow app to continue without RevenueCat
      this.initialized = false;
    }
  }

  /**
   * Identify user with RevenueCat
   * This sets the app user ID which is used for webhook synchronization
   */
  async identify(userId: string): Promise<void> {
    try {
      if (!this.initialized) {
        logger.warn('RevenueCat not initialized, skipping identify');
        return;
      }
      const Purchases = getPurchases();
      if (!Purchases) {
        logger.warn('RevenueCat native module not available');
        return;
      }
      await Purchases.logIn(userId);
      this.currentUserId = userId;
      logger.debug('RevenueCat user identified', { userId });
      // Note: This userId will be used in RevenueCat webhooks as app_user_id
      // Make sure it matches your Supabase users.id
    } catch (error) {
      logger.error(
        'Failed to identify RevenueCat user',
        error instanceof Error ? error : new Error('Unknown error')
      );
      // Don't throw - allow app to continue
    }
  }

  /**
   * Get current offerings
   */
  async getOfferings(): Promise<RevenueCatOffering[]> {
    if (!this.initialized) {
      logger.warn('RevenueCat not initialized, cannot get offerings');
      return [];
    }
    try {
      const Purchases = getPurchases();
      if (!Purchases) {
        logger.warn('RevenueCat native module not available');
        return [];
      }
      const offerings = await Purchases.getOfferings();
      if (!offerings.current) {
        return [];
      }
      return [this.mapToRevenueCatOffering(offerings.current)];
    } catch (error) {
      logger.error(
        'Failed to get offerings',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return [];
    }
  }

  /**
   * Get current offering
   */
  async getCurrentOffering(): Promise<RevenueCatOffering | null> {
    if (!this.initialized) {
      logger.warn('RevenueCat not initialized, cannot get current offering');
      return null;
    }
    try {
      const Purchases = getPurchases();
      if (!Purchases) {
        logger.warn('RevenueCat native module not available');
        return null;
      }
      const offerings = await Purchases.getOfferings();
      if (!offerings.current) {
        return null;
      }
      return this.mapToRevenueCatOffering(offerings.current);
    } catch (error) {
      logger.error(
        'Failed to get current offering',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return null;
    }
  }

  /**
   * Purchase package
   */
  async purchasePackage(packageToPurchase: RevenueCatPackage): Promise<RevenueCatCustomerInfo> {
    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }
    try {
      const Purchases = getPurchases();
      if (!Purchases) {
        throw new Error('RevenueCat native module not available');
      }

      // Find the actual PurchasesPackage
      const offerings = await Purchases.getOfferings();
      if (!offerings.current) {
        throw new Error('No current offering available');
      }

      const packageToBuy = offerings.current.availablePackages.find(
        p => p.identifier === packageToPurchase.identifier
      );

      if (!packageToBuy) {
        throw new Error(`Package not found: ${packageToPurchase.identifier}`);
      }

      const { customerInfo } = await Purchases.purchasePackage(packageToBuy);
      return this.mapToRevenueCatCustomerInfo(customerInfo);
    } catch (error) {
      logger.error(
        'Failed to purchase package',
        error instanceof Error ? error : new Error('Unknown error'),
        { packageIdentifier: packageToPurchase.identifier }
      );
      throw error;
    }
  }

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<RevenueCatCustomerInfo> {
    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }
    try {
      const Purchases = getPurchases();
      if (!Purchases) {
        throw new Error('RevenueCat native module not available');
      }
      const customerInfo = await Purchases.restorePurchases();
      return this.mapToRevenueCatCustomerInfo(customerInfo);
    } catch (error) {
      logger.error(
        'Failed to restore purchases',
        error instanceof Error ? error : new Error('Unknown error')
      );
      throw error;
    }
  }

  /**
   * Get customer info
   */
  async getCustomerInfo(): Promise<RevenueCatCustomerInfo | null> {
    if (!this.initialized) {
      logger.warn('RevenueCat not initialized, cannot get customer info');
      return null;
    }
    try {
      const Purchases = getPurchases();
      if (!Purchases) {
        logger.warn('RevenueCat native module not available');
        return null;
      }
      const customerInfo = await Purchases.getCustomerInfo();
      return this.mapToRevenueCatCustomerInfo(customerInfo);
    } catch (error) {
      logger.error(
        'Failed to get customer info',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return null;
    }
  }

  /**
   * Check if user has active premium subscription
   */
  async isPremium(): Promise<boolean> {
    if (!this.initialized) {
      logger.warn('RevenueCat not initialized, returning false for premium check');
      return false;
    }
    try {
      const customerInfo = await this.getCustomerInfo();
      if (!customerInfo) {
        return false;
      }

      // Check if user has any active entitlement
      const activeEntitlements = Object.values(customerInfo.entitlements.active);
      return activeEntitlements.some(entitlement => entitlement.isActive);
    } catch (error) {
      logger.error(
        'Failed to check premium status',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return false;
    }
  }

  /**
   * Get active entitlement
   */
  async getActiveEntitlement(): Promise<RevenueCatEntitlementInfo | null> {
    if (!this.initialized) {
      logger.warn('RevenueCat not initialized, cannot get active entitlement');
      return null;
    }
    try {
      const customerInfo = await this.getCustomerInfo();
      if (!customerInfo || !customerInfo.entitlements.active) {
        return null;
      }

      // Get first active entitlement
      const activeEntitlements = Object.values(customerInfo.entitlements.active);
      if (activeEntitlements.length > 0) {
        return activeEntitlements[0];
      }

      return null;
    } catch (error) {
      logger.error(
        'Failed to get active entitlement',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return null;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    if (!this.initialized) {
      logger.warn('RevenueCat not initialized, cannot logout');
      return;
    }
    try {
      const Purchases = getPurchases();
      if (!Purchases) {
        logger.warn('RevenueCat native module not available');
        return;
      }
      await Purchases.logOut();
      this.currentUserId = null;
      logger.debug('RevenueCat user logged out');
    } catch (error) {
      logger.error(
        'Failed to logout RevenueCat user',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  // Private helper methods

  private mapToRevenueCatOffering(offering: PurchasesOffering): RevenueCatOffering {
    return {
      identifier: offering.identifier,
      serverDescription: offering.serverDescription,
      availablePackages: offering.availablePackages.map(p =>
        this.mapToRevenueCatPackage(p, offering.identifier)
      ),
    };
  }

  private mapToRevenueCatPackage(
    pkg: PurchasesPackage,
    offeringIdentifier: string
  ): RevenueCatPackage {
    return {
      identifier: pkg.identifier,
      packageType: pkg.packageType,
      product: this.mapToRevenueCatProduct(pkg.product),
      offeringIdentifier,
    };
  }

  private mapToRevenueCatProduct(product: PurchasesStoreProduct): RevenueCatProduct {
    return {
      identifier: product.identifier,
      title: product.title,
      description: product.description,
      price: product.price,
      currencyCode: product.currencyCode,
      subscriptionPeriod: product.subscriptionPeriod || undefined,
    };
  }

  private mapToRevenueCatCustomerInfo(customerInfo: CustomerInfo): RevenueCatCustomerInfo {
    const entitlements: {
      active: Record<string, RevenueCatEntitlementInfo>;
      all: Record<string, RevenueCatEntitlementInfo>;
    } = {
      active: {},
      all: {},
    };

    // Map active entitlements
    if (customerInfo.entitlements.active) {
      Object.entries(customerInfo.entitlements.active).forEach(([key, value]) => {
        entitlements.active[key] = {
          identifier: value.identifier,
          isActive: value.isActive,
          willRenew: value.willRenew,
          periodType: value.periodType,
          latestPurchaseDate: value.latestPurchaseDate,
          originalPurchaseDate: value.originalPurchaseDate,
          expirationDate: value.expirationDate,
          store: value.store,
          productIdentifier: value.productIdentifier,
          isSandbox: value.isSandbox,
          unsubscribeDetectedAt: value.unsubscribeDetectedAt,
          billingIssueDetectedAt: value.billingIssueDetectedAt,
        };
      });
    }

    // Map all entitlements
    if (customerInfo.entitlements.all) {
      Object.entries(customerInfo.entitlements.all).forEach(([key, value]) => {
        entitlements.all[key] = {
          identifier: value.identifier,
          isActive: value.isActive,
          willRenew: value.willRenew,
          periodType: value.periodType,
          latestPurchaseDate: value.latestPurchaseDate,
          originalPurchaseDate: value.originalPurchaseDate,
          expirationDate: value.expirationDate,
          store: value.store,
          productIdentifier: value.productIdentifier,
          isSandbox: value.isSandbox,
          unsubscribeDetectedAt: value.unsubscribeDetectedAt,
          billingIssueDetectedAt: value.billingIssueDetectedAt,
        };
      });
    }

    return {
      entitlements,
      activeSubscriptions: customerInfo.activeSubscriptions,
      allPurchasedProductIdentifiers: customerInfo.allPurchasedProductIdentifiers,
      latestExpirationDate: customerInfo.latestExpirationDate,
      firstSeen: customerInfo.firstSeen,
      originalAppUserId: customerInfo.originalAppUserId,
      managementURL: customerInfo.managementURL || undefined,
    };
  }
}

export const revenueCatService = new RevenueCatService();
