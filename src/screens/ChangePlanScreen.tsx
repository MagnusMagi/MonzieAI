import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { SubscriptionRepository } from '../data/repositories/SubscriptionRepository';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

type ChangePlanScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChangePlan'>;

type ChangePlanScreenRouteProp = RouteProp<RootStackParamList, 'ChangePlan'>;

const subscriptionRepository = new SubscriptionRepository();

const plans = [
  {
    id: 'monthly',
    title: 'Monthly Plan',
    price: 9.99,
    period: 'per month',
    savings: null,
  },
  {
    id: 'yearly',
    title: 'Yearly Plan',
    price: 79.99,
    period: 'per year',
    savings: 'Save 33%',
    popular: true,
  },
];

export default function ChangePlanScreen() {
  const navigation = useNavigation<ChangePlanScreenNavigationProp>();
  const route = useRoute<ChangePlanScreenRouteProp>();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    loadCurrentSubscription();
  }, [user]);

  const loadCurrentSubscription = async () => {
    if (!user?.id) {
      setLoadingSubscription(false);
      return;
    }

    try {
      // Try to get active subscription first
      let subscription = await subscriptionRepository.getUserSubscription(user.id);

      // If no active subscription, try to get any subscription (cancelled/expired)
      if (!subscription) {
        subscription = await subscriptionRepository.getUserSubscriptionAny(user.id);
      }

      if (subscription) {
        setCurrentPlan(subscription.planType);
        setSelectedPlan(subscription.planType);
        setSubscriptionId(subscription.id);
      } else {
        // No subscription found - redirect to Paywall
        Alert.alert(
          'No Subscription',
          "You don't have an active subscription. Please subscribe first.",
          [
            {
              text: 'Subscribe',
              onPress: () => navigation.replace('Paywall'),
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      logger.error(
        'Failed to load current subscription',
        error instanceof Error ? error : new Error('Unknown error')
      );
      Alert.alert('Error', 'Failed to load subscription. Please try again.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleChangePlan = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to change your plan.');
      return;
    }

    if (!subscriptionId) {
      Alert.alert('Error', 'No subscription found. Please subscribe first.');
      navigation.replace('Paywall');
      return;
    }

    if (selectedPlan === currentPlan) {
      Alert.alert('Info', 'You are already on this plan.');
      return;
    }

    setLoading(true);
    try {
      await subscriptionRepository.updateSubscription(subscriptionId, {
        planType: selectedPlan,
        status: 'active', // Ensure subscription is active after plan change
      });

      Alert.alert(
        'Success',
        `Your plan has been changed to ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Plan.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reload subscription to reflect changes
              loadCurrentSubscription();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      logger.error(
        'Failed to change plan',
        error instanceof Error ? error : new Error('Unknown error')
      );
      Alert.alert('Error', 'Failed to change plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Plan</Text>
        <View style={styles.backButton} />
      </View>

      {loadingSubscription ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading subscription...</Text>
        </View>
      ) : !subscriptionId ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="diamond-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No Subscription</Text>
          <Text style={styles.emptyText}>You need an active subscription to change your plan.</Text>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => navigation.replace('Paywall')}
          >
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="swap-horizontal" size={64} color={colors.accent} />
          </View>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Select a plan that works best for you. You can change or cancel anytime.
          </Text>

          <View style={styles.plansContainer}>
            {plans.map(plan => {
              const isSelected = selectedPlan === plan.id;
              const isCurrentPlan = currentPlan === plan.id;

              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    isSelected && styles.planCardSelected,
                    plan.popular && styles.planCardPopular,
                  ]}
                  onPress={() => setSelectedPlan(plan.id as 'monthly' | 'yearly')}
                  disabled={loading}
                >
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>Most Popular</Text>
                    </View>
                  )}
                  {isCurrentPlan && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentText}>Current Plan</Text>
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
                    <Text style={styles.price}>${plan.price}</Text>
                    <Text style={styles.period}>/{plan.period}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.changeButton, loading && styles.changeButtonDisabled]}
            onPress={handleChangePlan}
            disabled={loading || selectedPlan === currentPlan}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.text.inverse} />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color={colors.text.inverse} />
                <Text style={styles.changeButtonText}>Change Plan</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? spacing.xs : spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    lineHeight: typography.fontSize.base * 1.5,
  },
  plansContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '10',
  },
  planCardPopular: {
    borderColor: colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  popularText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  currentBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.success + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  currentText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.success,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  planTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  savingsBadge: {
    backgroundColor: colors.accent + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.accent,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  period: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    marginHorizontal: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  changeButtonDisabled: {
    opacity: 0.6,
  },
  changeButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  subscribeButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
});
