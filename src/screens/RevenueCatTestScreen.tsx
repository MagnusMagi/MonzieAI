import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import {
  revenueCatService,
  RevenueCatOffering,
  RevenueCatPackage,
  RevenueCatCustomerInfo,
  RevenueCatOfferingsResponse,
} from '../services/revenueCatService';
import { logger } from '../utils/logger';
import { useAuth } from '../contexts/AuthContext';
// Native Purchases runtime import removed; using JS stub for RevenueCat
// PurchasesOffering type and Purchases runtime are not available in this build.

// RevenueCat UI is not available in this build (native UI module removed).
let RevenueCatUIModule: null = null;
async function getRevenueCatUI() {
  logger.debug?.('RevenueCat UI dynamic import skipped: native UI module not available in this build.');
  return null;
}

type RevenueCatTestScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RevenueCatTest'
>;

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: unknown;
}

export default function RevenueCatTestScreen() {
  const navigation = useNavigation<RevenueCatTestScreenNavigationProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentOffering, setCurrentOffering] = useState<RevenueCatOffering | null>(null);
  const [purchasesOffering, setPurchasesOffering] = useState<RevenueCatOfferingsResponse | null>(null);
  const [customerInfo, setCustomerInfo] = useState<RevenueCatCustomerInfo | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [RevenueCatUIComponent, setRevenueCatUIComponent] = useState<React.ComponentType<
    Record<string, unknown>
  > | null>(null);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testInitialize = async () => {
    setLoading(true);
    addTestResult({ name: 'Initialize RevenueCat', status: 'pending', message: 'Testing...' });
    try {
      await revenueCatService.initialize(user?.id);
      addTestResult({
        name: 'Initialize RevenueCat',
        status: 'success',
        message: 'RevenueCat initialized successfully',
      });
    } catch (error) {
      addTestResult({
        name: 'Initialize RevenueCat',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const testIdentify = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }
    setLoading(true);
    addTestResult({ name: 'Identify User', status: 'pending', message: 'Testing...' });
    try {
      await revenueCatService.identify(user.id);
      addTestResult({
        name: 'Identify User',
        status: 'success',
        message: `User identified: ${user.id}`,
      });
    } catch (error) {
      addTestResult({
        name: 'Identify User',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const testIsPremium = async () => {
    setLoading(true);
    addTestResult({ name: 'Check Premium Status', status: 'pending', message: 'Testing...' });
    try {
      const isPremium = await revenueCatService.isPremium();
      addTestResult({
        name: 'Check Premium Status',
        status: 'success',
        message: isPremium ? 'User is Premium' : 'User is not Premium',
        data: { isPremium },
      });
    } catch (error) {
      addTestResult({
        name: 'Check Premium Status',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetCustomerInfo = async () => {
    setLoading(true);
    addTestResult({ name: 'Get Customer Info', status: 'pending', message: 'Testing...' });
    try {
      const customerInfo = await revenueCatService.getCustomerInfo();
      if (customerInfo) {
        addTestResult({
          name: 'Get Customer Info',
          status: 'success',
          message: `Customer ID: ${customerInfo.originalAppUserId}`,
          data: {
            originalAppUserId: customerInfo.originalAppUserId,
            activeEntitlements: Object.keys(customerInfo.entitlements.active).length,
            activeSubscriptions: customerInfo.activeSubscriptions.length,
            latestExpirationDate: customerInfo.latestExpirationDate,
          },
        });
      } else {
        addTestResult({
          name: 'Get Customer Info',
          status: 'error',
          message: 'Customer info is null',
        });
      }
    } catch (error) {
      addTestResult({
        name: 'Get Customer Info',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetActiveEntitlement = async () => {
    setLoading(true);
    addTestResult({ name: 'Get Active Entitlement', status: 'pending', message: 'Testing...' });
    try {
      const entitlement = await revenueCatService.getActiveEntitlement();
      if (entitlement) {
        addTestResult({
          name: 'Get Active Entitlement',
          status: 'success',
          message: `Active entitlement: ${entitlement.identifier}`,
          data: {
            identifier: entitlement.identifier,
            isActive: entitlement.isActive,
            productIdentifier: entitlement.productIdentifier,
            expirationDate: entitlement.expirationDate,
            store: entitlement.store,
          },
        });
      } else {
        addTestResult({
          name: 'Get Active Entitlement',
          status: 'success',
          message: 'No active entitlement found',
        });
      }
    } catch (error) {
      addTestResult({
        name: 'Get Active Entitlement',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetOfferings = async () => {
    setLoading(true);
    addTestResult({ name: 'Get Offerings', status: 'pending', message: 'Testing...' });
    try {
      const offerings = await revenueCatService.getOfferings();
      addTestResult({
        name: 'Get Offerings',
        status: 'success',
        message: `Found ${offerings.length} offering(s)`,
        data: offerings.map(o => ({
          identifier: o.identifier,
          packageCount: o.availablePackages.length,
        })),
      });
    } catch (error) {
      addTestResult({
        name: 'Get Offerings',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetCurrentOffering = async () => {
    setLoading(true);
    addTestResult({ name: 'Get Current Offering', status: 'pending', message: 'Testing...' });
    try {
      const offering = await revenueCatService.getCurrentOffering();
      if (offering) {
        setCurrentOffering(offering);
        addTestResult({
          name: 'Get Current Offering',
          status: 'success',
          message: `Offering: ${offering.identifier}`,
          data: {
            identifier: offering.identifier,
            packageCount: offering.availablePackages.length,
            packages: offering.availablePackages.map(p => ({
              identifier: p.identifier,
              productIdentifier: p.product.identifier,
              price: p.product.price,
            })),
          },
        });
      } else {
        setCurrentOffering(null);
        addTestResult({
          name: 'Get Current Offering',
          status: 'error',
          message: 'No current offering found',
        });
      }
    } catch (error) {
      addTestResult({
        name: 'Get Current Offering',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const testPurchasePackage = async (pkg: RevenueCatPackage) => {
    setLoading(true);
    addTestResult({
      name: `Purchase Package: ${pkg.identifier}`,
      status: 'pending',
      message: 'Testing purchase...',
    });
    try {
      const customerInfo = await revenueCatService.purchasePackage(pkg);
      setCustomerInfo(customerInfo);
      const premium = await revenueCatService.isPremium();
      setIsPremium(premium);
      addTestResult({
        name: `Purchase Package: ${pkg.identifier}`,
        status: 'success',
        message: `Purchase successful! Product: ${pkg.product.identifier}`,
        data: {
          packageIdentifier: pkg.identifier,
          productIdentifier: pkg.product.identifier,
          price: pkg.product.price,
          currency: pkg.product.currencyCode,
          isPremium: premium,
        },
      });
      Alert.alert('Purchase Successful', `You have successfully purchased ${pkg.product.title}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addTestResult({
        name: `Purchase Package: ${pkg.identifier}`,
        status: 'error',
        message: errorMessage,
      });
      Alert.alert('Purchase Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const premium = await revenueCatService.isPremium();
      setIsPremium(premium);
      const info = await revenueCatService.getCustomerInfo();
      setCustomerInfo(info);
      const offering = await revenueCatService.getCurrentOffering();
      setCurrentOffering(offering);

      // Also load native PurchasesOffering for RevenueCat UI
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current) {
          setPurchasesOffering(offerings.current);
        }
      } catch (error) {
        logger.warn('Failed to load native PurchasesOffering', error as Error);
      }
    } catch (error) {
      logger.error('Failed to load status', error as Error);
    }
  };

  const testPresentPaywall = async () => {
    setLoading(true);
    addTestResult({ name: 'Present Paywall', status: 'pending', message: 'Presenting paywall...' });
    try {
      const RevenueCatUI = await getRevenueCatUI();
      if (!RevenueCatUI) {
        throw new Error('RevenueCat UI module not available');
      }

      if (!purchasesOffering) {
        // Load offering if not available
        const offerings = await Purchases.getOfferings();
        if (!offerings.current) {
          throw new Error('No offering available');
        }
        setPurchasesOffering(offerings.current);
      }

      const paywallResult = await RevenueCatUI.default.presentPaywall({
        offering: purchasesOffering ?? undefined,
      });

      let resultMessage = '';
      const isSuccess = paywallResult === 'PURCHASED' || paywallResult === 'RESTORED';

      switch (paywallResult) {
        case 'PURCHASED':
          resultMessage = 'Purchase completed successfully';
          break;
        case 'RESTORED':
          resultMessage = 'Restore completed successfully';
          break;
        case 'CANCELLED':
          resultMessage = 'User cancelled the paywall';
          break;
        case 'NOT_PRESENTED':
          resultMessage = 'Paywall was not presented';
          break;
        case 'ERROR':
          resultMessage = 'Error presenting paywall';
          break;
        default:
          resultMessage = `Unknown result: ${paywallResult}`;
      }

      addTestResult({
        name: 'Present Paywall',
        status: isSuccess ? 'success' : 'error',
        message: resultMessage,
        data: { paywallResult },
      });

      // Refresh status after purchase/restore
      if (paywallResult === 'PURCHASED' || paywallResult === 'RESTORED') {
        await loadStatus();
      }
    } catch (error) {
      addTestResult({
        name: 'Present Paywall',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowPaywallComponent = () => {
    if (!purchasesOffering) {
      Alert.alert('Error', 'No offering available. Please load offerings first.');
      return;
    }
    setShowPaywall(true);
  };

  // Load status on mount
  useEffect(() => {
    loadStatus();
  }, []);

  const testRestorePurchases = async () => {
    setLoading(true);
    addTestResult({ name: 'Restore Purchases', status: 'pending', message: 'Testing...' });
    try {
      const customerInfo = await revenueCatService.restorePurchases();
      addTestResult({
        name: 'Restore Purchases',
        status: 'success',
        message: `Restore completed. Customer ID: ${customerInfo.originalAppUserId}`,
        data: {
          originalAppUserId: customerInfo.originalAppUserId,
          activeEntitlements: Object.keys(customerInfo.entitlements.active).length,
          activeSubscriptions: customerInfo.activeSubscriptions.length,
        },
      });
    } catch (error) {
      addTestResult({
        name: 'Restore Purchases',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    clearResults();
    await testInitialize();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testIdentify();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testIsPremium();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testGetCustomerInfo();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testGetActiveEntitlement();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testGetOfferings();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testGetCurrentOffering();
  };

  // Load RevenueCat UI component when showPaywall is true
  useEffect(() => {
    if (showPaywall && purchasesOffering) {
      getRevenueCatUI().then(module => {
        if (module?.default?.Paywall) {
          setRevenueCatUIComponent(() => module.default.Paywall);
        } else {
          Alert.alert('Error', 'RevenueCat UI module not available');
          setShowPaywall(false);
        }
      });
    } else {
      setRevenueCatUIComponent(null);
    }
  }, [showPaywall, purchasesOffering]);

  // Show RevenueCat UI Paywall component if requested
  if (showPaywall && purchasesOffering && RevenueCatUIComponent) {
    const PaywallComponent = RevenueCatUIComponent;
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowPaywall(false)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>RevenueCat Paywall</Text>
          <View style={styles.headerRight} />
        </View>
        <PaywallComponent
          options={{
            offering: purchasesOffering,
          }}
          onPurchaseCompleted={({ customerInfo }: { customerInfo: RevenueCatCustomerInfo }) => {
            logger.info('Purchase completed via RevenueCat UI', {
              customerId: customerInfo.originalAppUserId,
            });
            Alert.alert('Purchase Successful', 'Your purchase was completed successfully!');
            loadStatus();
            setShowPaywall(false);
          }}
          onRestoreCompleted={({ customerInfo }: { customerInfo: RevenueCatCustomerInfo }) => {
            logger.info('Restore completed via RevenueCat UI', {
              customerId: customerInfo.originalAppUserId,
            });
            Alert.alert('Restore Successful', 'Your purchases have been restored!');
            loadStatus();
            setShowPaywall(false);
          }}
          onDismiss={() => {
            logger.debug('RevenueCat paywall dismissed');
            setShowPaywall(false);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RevenueCat Test</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={styles.statusCard}>
            <Ionicons
              name={isPremium ? 'diamond' : 'diamond-outline'}
              size={24}
              color={isPremium ? colors.accent : colors.text.tertiary}
            />
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Premium Status</Text>
              <Text style={[styles.statusValue, isPremium && styles.statusValueActive]}>
                {isPremium ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          {customerInfo && (
            <View style={styles.statusCard}>
              <Ionicons name="person-circle" size={24} color={colors.primary} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Customer ID</Text>
                <Text style={styles.statusValue} numberOfLines={1}>
                  {customerInfo.originalAppUserId}
                </Text>
              </View>
            </View>
          )}
          {currentOffering && (
            <View style={styles.statusCard}>
              <Ionicons name="storefront" size={24} color={colors.primary} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Current Offering</Text>
                <Text style={styles.statusValue}>{currentOffering.identifier}</Text>
                <Text style={styles.statusSubtext}>
                  {currentOffering.availablePackages.length} package(s) available
                </Text>
              </View>
            </View>
          )}
          <TouchableOpacity style={styles.refreshButton} onPress={loadStatus}>
            <Ionicons name="refresh" size={20} color={colors.primary} />
            <Text style={styles.refreshButtonText}>Refresh Status</Text>
          </TouchableOpacity>
        </View>

        {/* Packages Section */}
        {currentOffering && currentOffering.availablePackages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Packages</Text>
            {currentOffering.availablePackages.map((pkg, index) => (
              <TouchableOpacity
                key={index}
                style={styles.packageCard}
                onPress={() => testPurchasePackage(pkg)}
                disabled={loading}
              >
                <View style={styles.packageInfo}>
                  <Text style={styles.packageTitle}>{pkg.product.title || pkg.identifier}</Text>
                  <Text style={styles.packageDescription}>
                    {pkg.product.description || pkg.product.identifier}
                  </Text>
                  <Text style={styles.packagePrice}>
                    {pkg.product.currencyCode} {pkg.product.price.toFixed(2)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Actions</Text>

          <View style={styles.buttonGrid}>
            <TouchableOpacity
              style={[styles.testButton, loading && styles.testButtonDisabled]}
              onPress={testInitialize}
              disabled={loading}
            >
              <Ionicons name="play" size={20} color={colors.text.inverse} />
              <Text style={styles.testButtonText}>Initialize</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, loading && styles.testButtonDisabled]}
              onPress={testIdentify}
              disabled={loading}
            >
              <Ionicons name="person" size={20} color={colors.text.inverse} />
              <Text style={styles.testButtonText}>Identify</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, loading && styles.testButtonDisabled]}
              onPress={testIsPremium}
              disabled={loading}
            >
              <Ionicons name="diamond" size={20} color={colors.text.inverse} />
              <Text style={styles.testButtonText}>Is Premium</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, loading && styles.testButtonDisabled]}
              onPress={testGetCustomerInfo}
              disabled={loading}
            >
              <Ionicons name="person-circle" size={20} color={colors.text.inverse} />
              <Text style={styles.testButtonText}>Customer Info</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, loading && styles.testButtonDisabled]}
              onPress={testGetActiveEntitlement}
              disabled={loading}
            >
              <Ionicons name="card" size={20} color={colors.text.inverse} />
              <Text style={styles.testButtonText}>Entitlement</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, loading && styles.testButtonDisabled]}
              onPress={testGetOfferings}
              disabled={loading}
            >
              <Ionicons name="list" size={20} color={colors.text.inverse} />
              <Text style={styles.testButtonText}>Offerings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, loading && styles.testButtonDisabled]}
              onPress={testGetCurrentOffering}
              disabled={loading}
            >
              <Ionicons name="storefront" size={20} color={colors.text.inverse} />
              <Text style={styles.testButtonText}>Current Offering</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, loading && styles.testButtonDisabled]}
              onPress={testRestorePurchases}
              disabled={loading}
            >
              <Ionicons name="refresh" size={20} color={colors.text.inverse} />
              <Text style={styles.testButtonText}>Restore</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, loading && styles.testButtonDisabled]}
              onPress={testPresentPaywall}
              disabled={loading || !purchasesOffering}
            >
              <Ionicons name="card" size={20} color={colors.text.inverse} />
              <Text style={styles.testButtonText}>Present Paywall</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, loading && styles.testButtonDisabled]}
              onPress={handleShowPaywallComponent}
              disabled={loading || !purchasesOffering}
            >
              <Ionicons name="storefront" size={20} color={colors.text.inverse} />
              <Text style={styles.testButtonText}>Show Paywall UI</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.runAllButton, loading && styles.testButtonDisabled]}
            onPress={runAllTests}
            disabled={loading}
          >
            <Ionicons name="play-circle" size={24} color={colors.text.inverse} />
            <Text style={styles.runAllButtonText}>Run All Tests</Text>
          </TouchableOpacity>

          {testResults.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
              <Text style={styles.clearButtonText}>Clear Results</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Running test...</Text>
          </View>
        )}

        {testResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            {testResults.map((result, index) => (
              <View key={index} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultName}>{result.name}</Text>
                  {result.status === 'success' && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  )}
                  {result.status === 'error' && (
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  )}
                  {result.status === 'pending' && (
                    <ActivityIndicator size="small" color={colors.primary} />
                  )}
                </View>
                <Text
                  style={[
                    styles.resultMessage,
                    result.status === 'success' && styles.resultMessageSuccess,
                    result.status === 'error' && styles.resultMessageError,
                  ]}
                >
                  {result.message}
                </Text>
                {result.data ? (
                  <View style={styles.resultData}>
                    <Text style={styles.resultDataTitle}>Data:</Text>
                    <Text style={styles.resultDataText}>
                      {JSON.stringify(result.data, null, 2)}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RevenueCat Features Used</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.featureText}>SDK Initialization</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.featureText}>User Identification</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.featureText}>Premium Status Check</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.featureText}>Customer Info Management</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.featureText}>Entitlement Status</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.featureText}>Offerings & Packages</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.featureText}>Purchase Flow</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.featureText}>Restore Purchases</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.featureText}>Supabase Sync</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? spacing.xs : spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    minWidth: 120,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  testButtonDisabled: {
    opacity: 0.5,
  },
  testButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  runAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  runAllButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.inverse,
  },
  clearButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  clearButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  resultName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
  },
  resultMessage: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  resultMessageSuccess: {
    color: colors.success,
  },
  resultMessageError: {
    color: colors.error,
  },
  resultData: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  resultDataTitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  resultDataText: {
    fontSize: typography.fontSize.xs,
    fontFamily: 'monospace',
    color: colors.text.tertiary,
  },
  featureList: {
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  statusSection: {
    marginBottom: spacing.xl,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  statusLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing.xs / 2,
  },
  statusValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
  },
  statusValueActive: {
    color: colors.accent,
  },
  statusSubtext: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.tertiary,
    marginTop: spacing.xs / 2,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refreshButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  packageInfo: {
    flex: 1,
  },
  packageTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  packageDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  packagePrice: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.accent,
  },
});
