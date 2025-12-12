import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
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

const { width } = Dimensions.get('window');

type PaywallScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Paywall'>;

const plans = [
  {
    id: 'monthly',
    title: 'Monthly',
    price: '$9.99',
    priceValue: 9.99,
    period: 'per month',
    popular: false,
  },
  {
    id: 'yearly',
    title: 'Yearly',
    price: '$79.99',
    priceValue: 79.99,
    period: 'per year',
    popular: true,
    savings: 'Save 33%',
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
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const closeButtonOpacity = useRef(new Animated.Value(0)).current;

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
      // Check if user already has an active subscription
      try {
        const existingSubscription = await subscriptionRepository.getUserSubscription(user.id);

        if (existingSubscription && existingSubscription.status === 'active') {
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
        // No active subscription found, continue with creation
        // Only log if it's not a "not found" error
        const { hasErrorCode } = require('../utils/supabaseErrorTypes');
        if (!hasErrorCode(error, 'PGRST116')) {
          logger.debug('Error checking existing subscription, proceeding anyway', {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Create new subscription
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

      logger.info('Subscription created successfully', {
        subscriptionId: subscription.id,
        userId: user.id,
      });

      // Navigate to success screen instead of showing alert
      navigation.replace('PremiumSuccess', { planType: selectedPlan as 'monthly' | 'yearly' });
    } catch (error) {
      const {
        getErrorMessage,
        getErrorCode,
        hasErrorCode,
        isSupabaseError,
      } = require('../utils/supabaseErrorTypes');
      const { getUserFriendlyErrorMessage } = require('../utils/errorMessages');
      const { errorLoggingService } = require('../services/errorLoggingService');

      const errorMessage = getErrorMessage(error);
      const errorObj = error instanceof Error ? error : new Error(errorMessage);

      errorLoggingService.logError(errorObj, null, {
        service: 'PAYWALL',
        operation: 'CREATE_SUBSCRIPTION',
        userId: user.id,
        planType: selectedPlan,
        errorCode: getErrorCode(error as any),
        errorDetails: isSupabaseError(error as any) ? (error as any).details : undefined,
        errorHint: isSupabaseError(error as any) ? (error as any).hint : undefined,
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
        <View style={styles.plansContainer}>
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

                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{plan.price}</Text>
                  <Text style={styles.period}>{plan.period}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

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
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
    minHeight: 100,
    justifyContent: 'center',
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
