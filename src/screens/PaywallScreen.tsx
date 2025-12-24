import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { SubscriptionRepository } from '../data/repositories/SubscriptionRepository';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';
import { useFadeIn } from '../hooks/useFadeIn';
import {
  getErrorMessage,
  getErrorCode,
  hasErrorCode,
  isSupabaseError,
} from '../utils/supabaseErrorTypes';
import { getUserFriendlyErrorMessage } from '../utils/errorMessages';
import { errorLoggingService } from '../services/errorLoggingService';
import {
  revenueCatService,
  RevenueCatOffering,
  RevenueCatPackage,
  RevenueCatOffering,
  RevenueCatOfferingsResponse,
} from '../services/revenueCatService';
import { packageService, SubscriptionPackage } from '../services/packageService';
// Note: Native `react-native-purchases` runtime import removed.
// We use the JS stub `revenueCatService` instead of the native Purchases module.

// RevenueCat UI is not available in this build (native UI module removed).
// Provide a harmless stub so callers can call `getRevenueCatUI()` without runtime import.
// The function returns null and logs a debug message.
const RevenueCatUIModule: null = null;
const revenueCatUIAvailable = false;
async function getRevenueCatUI(): Promise<null> {
  logger.debug?.(
    'RevenueCat UI dynamic import skipped: native UI module not available in this build.'
  );
  return null;
}

/* RevenueCat UI dynamic import removed.
   Native RevenueCat UI module is not available in this build.
   The runtime dynamic import and related variables have been removed
   intentionally to avoid native initialization errors during development.
*/

// const { width } = Dimensions.get('window'); // Unused for now

type PaywallScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Paywall'>;

// Default plans (fallback if Supabase/RevenueCat not available)
const defaultPlans = [
  {
    id: 'weekly',
    title: 'Weekly',
    price: '$6.99',
    priceValue: 6.99,
    credits: 40,
    period: 'per week',
    popular: false,
  },
  {
    id: 'monthly',
    title: 'Monthly',
    price: '$19.99',
    priceValue: 19.99,
    credits: 180,
    period: 'per month',
    popular: false,
  },
  {
    id: '3_month',
    title: '3-Month',
    price: '$44.99',
    priceValue: 44.99,
    credits: 500,
    period: 'per 3 months',
    popular: true,
  },
  {
    id: '6_month',
    title: '6-Month',
    price: '$74.99',
    priceValue: 74.99,
    credits: 1000,
    period: 'per 6 months',
    popular: false,
  },
  {
    id: 'yearly',
    title: 'Yearly',
    price: '$119.99',
    priceValue: 119.99,
    credits: 2500,
    period: 'per year',
    popular: false,
  },
];

const subscriptionRepository = new SubscriptionRepository();

const features = [
  { icon: 'infinite', text: 'Unlimited AI image generation' },
  { icon: 'sparkles', text: 'Advanced image processing' },
  { icon: 'cloud', text: 'Cloud storage for your creations' },
  { icon: 'star', text: 'Premium filters and effects' },
  { icon: 'rocket', text: 'Priority processing speed' },
  { icon: 'shield-checkmark', text: 'Ad-free experience' },
];

export default function PaywallScreen() {
  const navigation = useNavigation<PaywallScreenNavigationProp>();
  const { user } = useAuth();
  const fadeAnim = useFadeIn(400);
  const [selectedPlan, setSelectedPlan] = useState('3_month'); // Default to 3-month plan
  const [loading, setLoading] = useState(false);
  const [revenueCatOffering, setRevenueCatOffering] = useState<RevenueCatOffering | null>(null);
  const [purchasesOffering, setPurchasesOffering] = useState<PurchasesOffering | null>(null);
  const [revenueCatPackages, setRevenueCatPackages] = useState<RevenueCatPackage[]>([]);
  const [supabasePackages, setSupabasePackages] = useState<SubscriptionPackage[]>([]);
  const [useRevenueCatUI, setUseRevenueCatUI] = useState(true); // Toggle between RevenueCat UI and custom UI
  const closeButtonOpacity = useRef(new Animated.Value(0)).current;

  // Load RevenueCat offerings and Supabase packages on mount
  useEffect(() => {
    loadRevenueCatOfferings();
    loadSupabasePackages();
  }, []);

  const loadSupabasePackages = async () => {
    try {
      const packages = await packageService.getPackages();
      setSupabasePackages(packages);
      logger.debug('Supabase packages loaded', { packageCount: packages.length });
    } catch (error) {
      logger.error('Failed to load Supabase packages', error);
    }
  };

  // Fade in close button after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(closeButtonOpacity, {
        toValue: 1,
        duration: 800, // 800ms fade-in animation
        useNativeDriver: true,
      }).start();
    }, 10000); // 10 seconds delay

    return () => clearTimeout(timer);
  }, [closeButtonOpacity]);

  const loadRevenueCatOfferings = async () => {
    try {
      // Get both our custom offering type and the native PurchasesOffering
      const offering = await revenueCatService.getCurrentOffering();
      if (offering) {
        setRevenueCatOffering(offering);
        setRevenueCatPackages(offering.availablePackages);
        logger.debug('RevenueCat offerings loaded', {
          packageCount: offering.availablePackages.length,
        });
      }

      // Also get the native PurchasesOffering for RevenueCat UI
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current) {
          setPurchasesOffering(offerings.current);
        } else {
          logger.warn('No RevenueCat offering found, using default plans');
          setUseRevenueCatUI(false); // Fallback to custom UI if no offering
        }
      } catch (error) {
        logger.warn('Failed to get native PurchasesOffering, will use custom UI', error);
        setUseRevenueCatUI(false);
      }
    } catch (error) {
      logger.error(
        'Failed to load RevenueCat offerings',
        error instanceof Error ? error : new Error('Unknown error')
      );
      setUseRevenueCatUI(false); // Fallback to custom UI on error
      // Continue with default plans if RevenueCat fails
    }
  };

  // Present RevenueCat UI paywall
  const presentRevenueCatPaywall = async () => {
    try {
      if (!purchasesOffering) {
        // Wait for offering to load
        const offerings = await Purchases.getOfferings();
        if (!offerings.current) {
          logger.warn('No RevenueCat offering available, using custom paywall');
          setUseRevenueCatUI(false);
          return;
        }
        setPurchasesOffering(offerings.current);
      }

      const RevenueCatUI = await getRevenueCatUI();
      if (!RevenueCatUI) {
        throw new Error('RevenueCat UI module not available');
      }

      const paywallResult = await RevenueCatUI.default.presentPaywall({
        offering: purchasesOffering,
      });

      switch (paywallResult) {
        case 'NOT_PRESENTED':
        case 'ERROR':
          logger.warn('RevenueCat paywall not presented, falling back to custom UI');
          setUseRevenueCatUI(false);
          break;
        case 'CANCELLED':
          logger.debug('User cancelled RevenueCat paywall');
          navigation.goBack();
          break;
        case 'PURCHASED':
        case 'RESTORED':
          logger.info('Purchase completed via RevenueCat UI');
          // Sync with Supabase
          if (user?.id) {
            try {
              const activeEntitlement = await revenueCatService.getActiveEntitlement();
              if (activeEntitlement && activeEntitlement.isActive) {
                const expiresAt = activeEntitlement.expirationDate
                  ? new Date(activeEntitlement.expirationDate)
                  : new Date();
                const planType =
                  activeEntitlement.identifier.toLowerCase().includes('year') ||
                  activeEntitlement.identifier.toLowerCase().includes('annual')
                    ? 'yearly'
                    : 'monthly';

                await subscriptionRepository.createSubscription({
                  userId: user.id,
                  planType: planType as 'monthly' | 'yearly',
                  price: 0, // Price will be synced from RevenueCat
                  currency: 'USD',
                  expiresAt,
                });
              }
            } catch (error) {
              logger.error('Failed to sync subscription to Supabase', error);
            }
          }
          navigation.replace('PremiumSuccess', { planType: 'yearly' });
          break;
        default:
          setUseRevenueCatUI(false);
          break;
      }
    } catch (error) {
      logger.error(
        'Failed to present RevenueCat paywall, using custom UI',
        error instanceof Error ? error : new Error('Unknown error')
      );
      setUseRevenueCatUI(false);
    }
  };

  // Get plans (from Supabase packages, RevenueCat packages, or default)
  const getPlans = () => {
    // Priority 1: Use Supabase packages (most accurate)
    if (supabasePackages.length > 0) {
      return supabasePackages.map(pkg => {
        // Try to find matching RevenueCat package
        const revenueCatPkg = revenueCatPackages.find(
          rcPkg =>
            rcPkg.identifier.toLowerCase().includes(pkg.packageKey) ||
            pkg.revenuecatPackageId === rcPkg.identifier ||
            pkg.revenuecatProductId === rcPkg.product.identifier
        );

        // Determine period text
        let periodText = '';
        if (pkg.durationDays === 7) periodText = 'per week';
        else if (pkg.durationDays === 30) periodText = 'per month';
        else if (pkg.durationDays === 90) periodText = 'per 3 months';
        else if (pkg.durationDays === 180) periodText = 'per 6 months';
        else if (pkg.durationDays === 365) periodText = 'per year';

        return {
          id: pkg.packageKey,
          title: pkg.displayName,
          price: `$${pkg.priceUsd.toFixed(2)}`,
          priceValue: pkg.priceUsd,
          credits: pkg.credits,
          period: periodText,
          popular: pkg.packageKey === '3_month', // Mark 3-month as popular
          revenueCatPackage: revenueCatPkg,
          supabasePackage: pkg,
        };
      });
    }

    // Priority 2: Use RevenueCat packages
    if (revenueCatPackages.length > 0) {
      const mappedPlans = [];

      // Map all RevenueCat packages
      revenueCatPackages.forEach(rcPkg => {
        const identifier = rcPkg.identifier.toLowerCase();
        const productId = rcPkg.product.identifier.toLowerCase();

        let packageKey = '';
        let title = '';
        let period = '';
        let credits = 0;

        if (identifier.includes('week') || productId.includes('week')) {
          packageKey = 'weekly';
          title = 'Weekly';
          period = 'per week';
          credits = 40;
        } else if (identifier.includes('month') || productId.includes('month')) {
          if (identifier.includes('3') || productId.includes('3')) {
            packageKey = '3_month';
            title = '3-Month';
            period = 'per 3 months';
            credits = 500;
          } else if (identifier.includes('6') || productId.includes('6')) {
            packageKey = '6_month';
            title = '6-Month';
            period = 'per 6 months';
            credits = 1000;
          } else {
            packageKey = 'monthly';
            title = 'Monthly';
            period = 'per month';
            credits = 180;
          }
        } else if (
          identifier.includes('year') ||
          identifier.includes('annual') ||
          productId.includes('year') ||
          productId.includes('annual')
        ) {
          packageKey = 'yearly';
          title = 'Yearly';
          period = 'per year';
          credits = 2500;
        }

        if (packageKey) {
          mappedPlans.push({
            id: packageKey,
            title,
            price: `$${rcPkg.product.price.toFixed(2)}`,
            priceValue: rcPkg.product.price,
            credits,
            period,
            popular: packageKey === '3_month',
            revenueCatPackage: rcPkg,
          });
        }
      });

      return mappedPlans.length > 0 ? mappedPlans : defaultPlans;
    }

    // Priority 3: Use default plans
    return defaultPlans;
  };

  const plans = getPlans();

  const handleContinue = async () => {
    if (!user?.id) {
      Alert.alert('Sign In Required', 'Please sign in to subscribe to Premium.');
      navigation.replace('Auth');
      return;
    }

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) {
      Alert.alert('Error', 'Please select a plan.');
      return;
    }

    setLoading(true);
    try {
      // Check if user already has an active subscription (via RevenueCat)
      try {
        const isPremium = await revenueCatService.isPremium();
        if (isPremium) {
          setLoading(false);
          Alert.alert(
            'Already Subscribed',
            'You already have an active subscription. You can manage it in the Subscription screen.',
            [
              { text: 'OK', onPress: () => navigation.replace('Home') },
              { text: 'View Subscription', onPress: () => navigation.replace('Subscription') },
            ]
          );
          return;
        }
      } catch (error) {
        logger.debug('Error checking RevenueCat premium status, continuing', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Find RevenueCat package for selected plan
      let revenueCatPackage: RevenueCatPackage | null = null;
      if (revenueCatPackages.length > 0 && 'revenueCatPackage' in plan) {
        revenueCatPackage = plan.revenueCatPackage as RevenueCatPackage;
      }

      // Purchase via RevenueCat if package found, otherwise fallback to manual
      if (revenueCatPackage) {
        try {
          // Purchase through RevenueCat
          const customerInfo = await revenueCatService.purchasePackage(revenueCatPackage);

          // Sync with Supabase
          const activeEntitlement = await revenueCatService.getActiveEntitlement();
          if (activeEntitlement && activeEntitlement.isActive) {
            const expiresAt = activeEntitlement.expirationDate
              ? new Date(activeEntitlement.expirationDate)
              : new Date();
            const planType =
              revenueCatPackage.product.identifier.toLowerCase().includes('year') ||
              revenueCatPackage.product.identifier.toLowerCase().includes('annual')
                ? 'yearly'
                : 'monthly';

            await subscriptionRepository.createSubscription({
              userId: user.id,
              planType: planType as 'monthly' | 'yearly',
              price: revenueCatPackage.product.price,
              currency: revenueCatPackage.product.currencyCode,
              expiresAt,
            });
          }

          logger.info('Subscription purchased via RevenueCat', {
            userId: user.id,
            packageIdentifier: revenueCatPackage.identifier,
            productIdentifier: revenueCatPackage.product.identifier,
          });

          navigation.replace('PremiumSuccess', { planType: selectedPlan as 'monthly' | 'yearly' });
          return;
        } catch (error) {
          logger.error(
            'RevenueCat purchase failed, falling back to manual subscription',
            error instanceof Error ? error : new Error('Unknown error')
          );
          // Fall through to manual subscription creation
        }
      }

      // Fallback: Manual subscription creation (if RevenueCat not available or purchase failed)
      const expiresAt = new Date();
      if (selectedPlan === 'monthly') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      const subscription = await subscriptionRepository.createSubscription({
        userId: user.id,
        planType: selectedPlan as 'monthly' | 'yearly',
        price: plan.priceValue,
        currency: 'USD',
        expiresAt,
      });

      logger.info('Subscription created successfully (manual)', {
        subscriptionId: subscription.id,
        userId: user.id,
      });

      // Navigate to success screen instead of showing alert
      navigation.replace('PremiumSuccess', { planType: selectedPlan as 'monthly' | 'yearly' });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      const errorObj = error instanceof Error ? error : new Error(errorMessage);

      errorLoggingService.logError(errorObj, null, {
        service: 'PAYWALL',
        operation: 'CREATE_SUBSCRIPTION',
        userId: user.id,
        planType: selectedPlan,
        errorCode: getErrorCode(error as Error),
        errorDetails: isSupabaseError(error as Error)
          ? (error as Error & { details?: unknown }).details
          : undefined,
        errorHint: isSupabaseError(error as Error)
          ? (error as Error & { hint?: unknown }).hint
          : undefined,
      });

      // Provide more specific error messages
      let userMessage = getUserFriendlyErrorMessage(error, {
        service: 'SUPABASE',
        operation: 'CREATE_SUBSCRIPTION',
      });

      if (hasErrorCode(error, '23505')) {
        userMessage =
          'You already have a subscription. Please manage it in the Subscription screen.';
      } else if (hasErrorCode(error, '23503')) {
        userMessage = 'Invalid user account. Please sign in again.';
      }

      Alert.alert('Subscription Failed', userMessage, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (user) {
      navigation.replace('Home');
    } else {
      navigation.replace('Auth');
    }
  };

  // If using RevenueCat UI, show the Paywall component
  const [RevenueCatUIComponent, setRevenueCatUIComponent] =
    useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (useRevenueCatUI && purchasesOffering) {
      getRevenueCatUI().then(module => {
        if (module?.default?.Paywall) {
          setRevenueCatUIComponent(() => module.default.Paywall);
        } else {
          setUseRevenueCatUI(false);
        }
      });
    }
  }, [useRevenueCatUI, purchasesOffering]);

  if (useRevenueCatUI && purchasesOffering && RevenueCatUIComponent) {
    const PaywallComponent = RevenueCatUIComponent;
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <PaywallComponent
          options={{
            offering: purchasesOffering,
          }}
          onPurchaseCompleted={({ customerInfo }) => {
            logger.info('Purchase completed via RevenueCat UI', {
              customerId: customerInfo.originalAppUserId,
            });
            // Sync with Supabase
            if (user?.id) {
              revenueCatService.getActiveEntitlement().then(activeEntitlement => {
                if (activeEntitlement && activeEntitlement.isActive) {
                  const expiresAt = activeEntitlement.expirationDate
                    ? new Date(activeEntitlement.expirationDate)
                    : new Date();
                  const planType =
                    activeEntitlement.identifier.toLowerCase().includes('year') ||
                    activeEntitlement.identifier.toLowerCase().includes('annual')
                      ? 'yearly'
                      : 'monthly';

                  subscriptionRepository
                    .createSubscription({
                      userId: user.id,
                      planType: planType as 'monthly' | 'yearly',
                      price: 0,
                      currency: 'USD',
                      expiresAt,
                    })
                    .catch(error => {
                      logger.error('Failed to sync subscription to Supabase', error);
                    });
                }
              });
            }
            navigation.replace('PremiumSuccess', { planType: 'yearly' });
          }}
          onRestoreCompleted={({ customerInfo }) => {
            logger.info('Restore completed via RevenueCat UI', {
              customerId: customerInfo.originalAppUserId,
            });
            // Check if user has active entitlement after restore
            revenueCatService.getActiveEntitlement().then(activeEntitlement => {
              if (activeEntitlement && activeEntitlement.isActive) {
                navigation.replace('PremiumSuccess', { planType: 'yearly' });
              }
            });
          }}
          onDismiss={() => {
            logger.debug('RevenueCat paywall dismissed');
            navigation.goBack();
          }}
        />
      </SafeAreaView>
    );
  }

  // Fallback to custom UI
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Close Button */}
          <Animated.View style={[styles.closeButton, { opacity: closeButtonOpacity }]}>
            <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
              <View style={styles.closeButtonBackground}>
                <Ionicons name="close" size={20} color={colors.text.primary} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <LinearGradient colors={[colors.accent, colors.primary]} style={styles.iconGradient}>
                <Ionicons name="sparkles" size={32} color={colors.text.inverse} />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Unlock Premium</Text>
            <Text style={styles.subtitle}>Unlimited AI image generation and advanced tools</Text>
          </View>

          {/* Plans */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.plansContainer}
            style={{ marginHorizontal: -spacing.lg }}
          >
            {plans.map(plan => {
              const isSelected = selectedPlan === plan.id;
              const isPopular = plan.popular;

              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    isSelected && styles.planCardSelected,
                    isPopular && styles.planCardPopular,
                  ]}
                  onPress={() => setSelectedPlan(plan.id)}
                  activeOpacity={0.7}
                >
                  {isPopular && (
                    <View style={styles.popularBadge}>
                      <Ionicons name="star" size={12} color={colors.text.inverse} />
                      <Text style={styles.popularText}>Most Popular</Text>
                    </View>
                  )}

                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                    </View>
                  )}

                  <View style={styles.planHeader}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    {plan.savings && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>{plan.savings}</Text>
                      </View>
                    )}
                  </View>

                  {/* Credits Display */}
                  {plan.credits && (
                    <View style={styles.creditsContainer}>
                      <Text style={styles.creditsText}>
                        {plan.credits.toLocaleString()} High-End Photo Credits
                      </Text>
                    </View>
                  )}

                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{plan.price}</Text>
                    <Text style={styles.period}>{plan.period}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What's Included</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.feature}>
                <View style={styles.featureIconContainer}>
                  <Ionicons
                    name={feature.icon as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color={colors.accent}
                  />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.continueButton, loading && styles.continueButtonDisabled]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={loading}
          >
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>Start Premium</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={colors.text.inverse}
                    style={styles.buttonIcon}
                  />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Skip Button */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Maybe Later</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
  },
  closeButtonBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? spacing.xs : spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  iconGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  plansContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  planCard: {
    width: 140,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
    minHeight: 180,
    justifyContent: 'flex-start',
  },
  planCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.background,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  planCardPopular: {
    borderColor: colors.accent,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  popularText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  planHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.xs / 2,
  },
  planTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
  },
  savingsBadge: {
    backgroundColor: colors.success + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.success,
  },
  creditsContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  creditsText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  periodCreditsText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.xs / 2,
    opacity: 0.7,
  },
  savingsText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.success,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs / 2,
  },
  price: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  period: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  featuresContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  featuresTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    flex: 1,
  },
  continueButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  continueButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  buttonIcon: {
    marginLeft: spacing.xs,
  },
  skipButton: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  skipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
});
