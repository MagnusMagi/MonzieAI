import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';
import { precacheSubcategoryImages } from '../utils/imagePrecache';
import { revenueCatService } from '../services/revenueCatService';

// Import icon as ES6 module
import iconImage from '../../assets/icon.png';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const ONBOARDING_COMPLETED_KEY = '@monzieai:onboarding_completed';

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const { user, loading: authLoading } = useAuth();
  const [_checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboardingAndNavigate = async () => {
      try {
        // TEMPORARILY DISABLED: RevenueCat initialization (causing native crash)
        // TODO: Re-enable after fixing native module issue
        // try {
        //   await revenueCatService.initialize(user?.id);
        //   if (user?.id) {
        //     await revenueCatService.identify(user.id);
        //   }
        // } catch (error) {
        //   logger.warn(
        //     'Failed to initialize RevenueCat, continuing without it',
        //     error instanceof Error ? error : new Error('Unknown error')
        //   );
        // }
        logger.debug('RevenueCat initialization temporarily disabled');
        // Confirmation log to make it explicit in runtime logs that RevenueCat is intentionally disabled here
        logger.info?.('RevenueCat init commented out in SplashScreen; native SDK disabled for now');

        // Start pre-caching images in parallel (non-blocking)
        const _precachePromise = precacheSubcategoryImages();

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
      <Image source={iconImage} style={styles.icon} resizeMode="contain" />
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
  icon: {
    width: 120,
    height: 120,
  },
  loader: {
    marginTop: spacing.xl,
  },
});
