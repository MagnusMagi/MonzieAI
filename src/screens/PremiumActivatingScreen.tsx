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

const { width } = Dimensions.get('window');

type PremiumActivatingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PremiumActivating'
>;

type PremiumActivatingScreenRouteProp = RouteProp<RootStackParamList, 'PremiumActivating'>;

export default function PremiumActivatingScreen() {
  const navigation = useNavigation<PremiumActivatingScreenNavigationProp>();
  const route = useRoute<PremiumActivatingScreenRouteProp>();
  const { planType } = route.params;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Fade in content
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotate animation for icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Navigate to home after 3.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[colors.background, colors.primary + '08', colors.accent + '05']}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Animated Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: pulseAnim }, { rotate }],
              },
            ]}
          >
            <LinearGradient colors={[colors.primary, colors.accent]} style={styles.iconGradient}>
              <Ionicons name="sparkles" size={48} color={colors.text.inverse} />
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>Premium'unuz Yükleniyor</Text>
          <Text style={styles.subtitle}>Özellikleriniz hazırlanıyor...</Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressWidth,
                  },
                ]}
              >
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
              </Animated.View>
            </View>
          </View>

          {/* Loading Steps */}
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.stepText}>Subscription Aktif</Text>
            </View>
            <View style={styles.step}>
              <Animated.View
                style={{
                  opacity: progressAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 1],
                  }),
                }}
              >
                <Ionicons name="cloud-download" size={24} color={colors.accent} />
              </Animated.View>
              <Animated.Text
                style={[
                  styles.stepText,
                  {
                    opacity: progressAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.3, 1, 1],
                    }),
                  },
                ]}
              >
                Premium Özellikler Yükleniyor
              </Animated.Text>
            </View>
            <View style={styles.step}>
              <Animated.View
                style={{
                  opacity: progressAnim.interpolate({
                    inputRange: [0, 0.7, 1],
                    outputRange: [0.3, 0.3, 1],
                  }),
                }}
              >
                <Ionicons name="rocket" size={24} color={colors.accent} />
              </Animated.View>
              <Animated.Text
                style={[
                  styles.stepText,
                  {
                    opacity: progressAnim.interpolate({
                      inputRange: [0, 0.7, 1],
                      outputRange: [0.3, 0.3, 1],
                    }),
                  },
                ]}
              >
                Hazırlanıyor...
              </Animated.Text>
            </View>
          </View>
        </Animated.View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing['2xl'],
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: spacing['2xl'],
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressGradient: {
    flex: 1,
    borderRadius: 4,
  },
  stepsContainer: {
    width: '100%',
    maxWidth: 300,
    gap: spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  stepText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
});
