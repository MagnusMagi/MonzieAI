import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { Alert } from 'react-native';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PaywallScreen from '../screens/PaywallScreen';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyProfileScreen from '../screens/MyProfileScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';
import AboutScreen from '../screens/AboutScreen';
import ChangelogScreen from '../screens/ChangelogScreen';
import GenderSelectionScreen from '../screens/GenderSelectionScreen';
import PhotoUploadScreen from '../screens/PhotoUploadScreen';
import SceneSelectionScreen from '../screens/SceneSelectionScreen';
import GeneratingScreen from '../screens/GeneratingScreen';
import GeneratedScreen from '../screens/GeneratedScreen';
import SeeAllScreen from '../screens/SeeAllScreen';
import SceneDetailScreen from '../screens/SceneDetailScreen';
import GalleryScreen from '../screens/GalleryScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import DownloadDataScreen from '../screens/DownloadDataScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import EnhanceScreen from '../screens/EnhanceScreen';
import ChangePlanScreen from '../screens/ChangePlanScreen';
import CancelSubscriptionScreen from '../screens/CancelSubscriptionScreen';
import PremiumSuccessScreen from '../screens/PremiumSuccessScreen';
import PremiumActivatingScreen from '../screens/PremiumActivatingScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Paywall: undefined;
  PremiumSuccess: { planType: 'monthly' | 'yearly' };
  PremiumActivating: { planType: 'monthly' | 'yearly' };
  Auth: undefined;
  Home: undefined;
  Profile: undefined;
  MyProfile: undefined;
  Subscription: undefined;
  ChangePlan: undefined;
  CancelSubscription: undefined;
  Favorites: undefined;
  History: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  PrivacySettings: undefined;
  DownloadData: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  ForgotPassword: undefined;
  Enhance: undefined;
  Help: undefined;
  About: undefined;
  Changelog: undefined;
  Gallery: undefined;
  GenderSelection: {
    // Optional scene information (if coming from SceneDetail)
    sceneId?: string;
    sceneName?: string;
    scenePrompt?: string;
    sceneCategory?: string;
  };
  PhotoUpload: {
    gender: string;
    // Optional scene information (if coming from SceneDetail)
    sceneId?: string;
    sceneName?: string;
    scenePrompt?: string;
    sceneCategory?: string;
  };
  SceneSelection: {
    gender: string;
    imageUri: string;
  };
  Generating: {
    gender: string;
    imageUri: string;
    sceneId?: string;
    sceneName?: string;
    scenePrompt?: string;
    sceneCategory?: string;
  };
  Generated: {
    imageUrl: string;
    generatedImages?: { id: string; url: string }[];
    imageId?: string;
    sceneId?: string;
  };
  SeeAll: {
    title: string;
    images: {
      id: string;
      title: string;
      image: string;
      likes: number;
      category?: string;
    }[];
  };
  SceneDetail: {
    image: string;
    title: string;
    description?: string;
    likes: number;
    // Scene information (optional - if coming from a scene)
    sceneId?: string;
    sceneName?: string;
    scenePrompt?: string;
    sceneCategory?: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Deep link configuration
const linking = {
  prefixes: ['monzieai://'],
  config: {
    screens: {
      Auth: 'auth-callback',
      ForgotPassword: 'reset-password',
    },
  },
};

export default function AppNavigator() {
  // Handle deep links for email verification
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      try {
        const parsedUrl = Linking.parse(url);
        // Only log deep links in development or if they're important (auth/reset)
        if (__DEV__ || parsedUrl.path === 'auth-callback' || parsedUrl.path === 'reset-password') {
          logger.debug('Deep link received', { url, parsedUrl });
        }

        // Handle email verification
        if (parsedUrl.path === 'auth-callback') {
          const token = parsedUrl.queryParams?.token as string;
          const type = parsedUrl.queryParams?.type as string;

          if (type === 'email' && token) {
            // Verify email with Supabase
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: 'email',
            });

            if (error) {
              logger.error('Email verification failed', error);
              Alert.alert('Error', 'Email verification failed. Please try again.');
              return;
            }

            if (data.user) {
              logger.info('Email verified successfully', { userId: data.user.id });
              Alert.alert('Success', 'Email verified successfully!');
            }
          }
        }

        // Handle password reset
        if (parsedUrl.path === 'reset-password') {
          const token = parsedUrl.queryParams?.token as string;
          const type = parsedUrl.queryParams?.type as string;

          if (type === 'recovery' && token) {
            logger.info('Password reset link received', { hasToken: !!token });
            // Navigate to a password reset screen (you can create this later)
            // For now, we'll just show an alert
            Alert.alert(
              'Password Reset',
              'Please use the link in your email to reset your password.',
              [{ text: 'OK' }]
            );
          }
        }
      } catch (error) {
        logger.error(
          'Deep link handling error',
          error instanceof Error ? error : new Error('Unknown error')
        );
      }
    };

    // Handle initial URL (if app was opened via deep link)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animationDuration: 300,
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{
            animation: 'fade',
            animationDuration: 400,
          }}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="PremiumSuccess"
          component={PremiumSuccessScreen}
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="PremiumActivating"
          component={PremiumActivatingScreen}
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="MyProfile"
          component={MyProfileScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Subscription"
          component={SubscriptionScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="ChangePlan"
          component={ChangePlanScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="CancelSubscription"
          component={CancelSubscriptionScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Gallery"
          component={GalleryScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="PrivacySettings"
          component={PrivacySettingsScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="DownloadData"
          component={DownloadDataScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="TermsOfService"
          component={TermsOfServiceScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Enhance"
          component={EnhanceScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Help"
          component={HelpScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Changelog"
          component={ChangelogScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="GenderSelection"
          component={GenderSelectionScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="PhotoUpload"
          component={PhotoUploadScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="SceneSelection"
          component={SceneSelectionScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Generating"
          component={GeneratingScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Generated"
          component={GeneratedScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="SeeAll"
          component={SeeAllScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="SceneDetail"
          component={SceneDetailScreen}
          options={{
            animation: 'fade',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
