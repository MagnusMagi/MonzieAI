import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const ONBOARDING_COMPLETED_KEY = '@monzieai:onboarding_completed';

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const { user, loading: authLoading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboardingAndNavigate = async () => {
      try {
        // Wait a bit for app initialization
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if onboarding has been completed
        const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);

        if (!onboardingCompleted) {
          // First time opening the app - show onboarding
          if (__DEV__) {
            logger.debug('First time user, showing onboarding');
          }
          navigation.replace('Onboarding');
        } else {
          // Onboarding already completed - navigate based on auth status
          if (__DEV__) {
            logger.debug('Onboarding completed, checking auth status');
          }

          // Wait for auth to finish loading
          if (authLoading) {
            // Wait a bit more for auth to load
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          if (user) {
            // User is logged in - go to Home
            navigation.replace('Home');
          } else {
            // User is not logged in - go to Auth
            navigation.replace('Auth');
          }
        }
      } catch (error) {
        logger.error(
          'Failed to check onboarding status',
          error instanceof Error ? error : new Error('Unknown error')
        );
        // On error, default to onboarding
        navigation.replace('Onboarding');
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingAndNavigate();
  }, [navigation, user, authLoading]);

  return (
    <View style={styles.container}>
      <Ionicons name="image" size={64} color={colors.primary} />
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginTop: spacing.xl,
  },
});
