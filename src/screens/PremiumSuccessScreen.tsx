import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type PremiumSuccessScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PremiumSuccess'
>;

type PremiumSuccessScreenRouteProp = RouteProp<RootStackParamList, 'PremiumSuccess'>;

export default function PremiumSuccessScreen() {
  const navigation = useNavigation<PremiumSuccessScreenNavigationProp>();
  const route = useRoute<PremiumSuccessScreenRouteProp>();
  const { planType } = route.params;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const confettiOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate checkmark
    Animated.sequence([
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(confettiOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate main content
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to activating screen after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('PremiumActivating', { planType });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const planName = planType === 'monthly' ? 'Monthly' : 'Yearly';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[colors.primary + '15', colors.accent + '08', colors.background]}
        style={styles.gradient}
      >
        {/* Confetti Effect */}
        <Animated.View style={[styles.confettiContainer, { opacity: confettiOpacity }]}>
          {[...Array(20)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.confetti,
                {
                  left: `${(i * 5) % 100}%`,
                  top: `${(i * 3) % 50}%`,
                  transform: [
                    {
                      rotate: `${i * 18}deg`,
                    },
                  ],
                },
              ]}
            >
              <Ionicons
                name={i % 2 === 0 ? 'star' : 'sparkles'}
                size={16}
                color={i % 3 === 0 ? colors.primary : colors.accent}
              />
            </Animated.View>
          ))}
        </Animated.View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Success Checkmark */}
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [{ scale: checkmarkScale }],
              },
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              style={styles.checkmarkGradient}
            >
              <Ionicons name="checkmark" size={64} color={colors.text.inverse} />
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.title}>Welcome to Premium! 🎉</Text>
            <Text style={styles.subtitle}>
              Your {planName.toLowerCase()} subscription is now active
            </Text>
          </Animated.View>

          {/* Features Preview */}
          <Animated.View
            style={[
              styles.featuresContainer,
              {
                opacity: opacityAnim,
              },
            ]}
          >
            <View style={styles.featureItem}>
              <Ionicons name="infinite" size={20} color={colors.accent} />
              <Text style={styles.featureText}>Unlimited AI Generation</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="rocket" size={20} color={colors.accent} />
              <Text style={styles.featureText}>Priority Processing</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="sparkles" size={20} color={colors.accent} />
              <Text style={styles.featureText}>Premium Features</Text>
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  confetti: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 2,
  },
  checkmarkContainer: {
    marginBottom: spacing.xl,
  },
  checkmarkGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 300,
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
});
