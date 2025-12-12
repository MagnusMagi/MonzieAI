import React, { useCallback, useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppStateProvider } from './src/contexts/AppStateContext';
import { notificationService } from './src/services/notificationService';
import { sentryService } from './src/services/sentryService';
import { logger } from './src/utils/logger';

// Initialize Sentry at app startup
sentryService.initialize();

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 2 * 60 * 1000, // 2 minutes default
      gcTime: 5 * 60 * 1000, // 5 minutes default
    },
  },
});

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'SpaceGrotesk-Regular': require('./assets/fonts/SpaceGrotesk-Regular.ttf'),
    'SpaceGrotesk-Medium': require('./assets/fonts/SpaceGrotesk-Medium.ttf'),
    'SpaceGrotesk-SemiBold': require('./assets/fonts/SpaceGrotesk-SemiBold.ttf'),
    'SpaceGrotesk-Bold': require('./assets/fonts/SpaceGrotesk-Bold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Log font status
  useEffect(() => {
    if (fontError) {
      // Font loading is handled gracefully, no need to log as error
    } else if (fontsLoaded) {
      // Fonts loaded successfully, no need to log in production
    }
  }, [fontsLoaded, fontError]);

  // Notification listeners
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Initialize notifications on app start
    const initializeNotifications = async () => {
      try {
        // Check if Notifications module is available
        if (!Notifications || typeof Notifications.getExpoPushTokenAsync !== 'function') {
          logger.warn('Notifications native module not available. Skipping initialization.');
          return;
        }

        const notificationsEnabled = await notificationService.isNotificationsEnabled();
        if (notificationsEnabled) {
          // Register for push notifications (silently fails on simulator or service errors)
          const token = await notificationService.registerForPushNotifications();
          if (!token && __DEV__) {
            // Only log in dev mode - production should fail silently
            logger.debug(
              'Push notification registration skipped (simulator or service unavailable)'
            );
          }
        }
      } catch (error) {
        // Check if error is due to missing native module
        if (error instanceof Error && error.message.includes('native module')) {
          logger.warn(
            'Notifications native module not available. Please rebuild the app with: npx expo run:ios'
          );
          return;
        }
        logger.error(
          'Failed to initialize notifications',
          error instanceof Error ? error : new Error('Unknown error')
        );
      }
    };

    initializeNotifications();

    // Set up notification listeners only if module is available
    try {
      if (Notifications && typeof Notifications.addNotificationReceivedListener === 'function') {
        // Set up notification received listener (foreground)
        notificationListener.current = Notifications.addNotificationReceivedListener(
          notification => {
            if (__DEV__) {
              logger.debug('Notification received', {
                title: notification.request.content.title,
                body: notification.request.content.body,
              });
            } else {
              logger.info('Notification received');
            }
          }
        );

        // Set up notification response listener (user tapped notification)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
          response => {
            logger.info('Notification response received', {
              actionIdentifier: response.actionIdentifier,
              notification: response.notification.request.content,
            });
            // You can navigate to specific screens based on notification data here
            // const data = response.notification.request.content.data;
            // if (data?.screen) {
            //   navigation.navigate(data.screen as any);
            // }
          }
        );
      }
    } catch (error) {
      logger.warn(
        'Failed to set up notification listeners',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }

    return () => {
      try {
        if (notificationListener.current) {
          notificationListener.current.remove();
        }
        if (responseListener.current) {
          responseListener.current.remove();
        }
      } catch (error) {
        // Silently fail on cleanup
      }
    };
  }, []);

  // Show loading only if fonts are still loading
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StatusBar style="dark" />
      </View>
    );
  }

  // Always render app, even if fonts failed to load
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppStateProvider>
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
              <StatusBar style="dark" />
              <AppNavigator />
            </View>
          </AppStateProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
