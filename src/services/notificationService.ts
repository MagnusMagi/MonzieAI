import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { logger } from '../utils/logger';

const NOTIFICATIONS_KEY = '@monzieai:notifications_enabled';
const EXPO_PUSH_TOKEN_KEY = '@monzieai:expo_push_token';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Notification Service
 * Handles push notification registration, permissions, and sending
 */
class NotificationService {
  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // Check if native module is available
      if (!Notifications.getPermissionsAsync || !Notifications.requestPermissionsAsync) {
        logger.warn('Notification native module not available. Please rebuild the app.');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        if (__DEV__) {
          logger.debug('Notification permissions not granted', { finalStatus });
        } else {
          logger.warn('Notification permissions not granted', { finalStatus });
        }
        return false;
      }

      // Only log in dev or if it's a state change
      if (__DEV__) {
        logger.debug('Notification permissions granted', { finalStatus });
      }
      return true;
    } catch (error) {
      // Check if error is due to missing native module
      if (error instanceof Error && error.message.includes('native module')) {
        logger.warn('Notification native module not available. Please rebuild the app.', {
          error: error.message,
        });
        return false;
      }
      logger.error(
        'Failed to request notification permissions',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return false;
    }
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Check if native module is available
      if (!Notifications.getExpoPushTokenAsync) {
        logger.warn('Notification native module not available. Please rebuild the app.');
        return null;
      }

      // Check if running on iOS simulator (push tokens don't work on simulators)
      if (Platform.OS === 'ios' && !Device.isDevice) {
        if (__DEV__) {
          logger.debug(
            'Push tokens are not available on iOS simulators. Use a real device to test push notifications.'
          );
        }
        return null;
      }

      // Check if notifications are enabled in preferences
      const notificationsEnabled = await this.isNotificationsEnabled();
      if (!notificationsEnabled) {
        if (__DEV__) {
          logger.debug('Notifications disabled in preferences, skipping registration');
        }
        return null;
      }

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Get push token
      let token: string | null = null;

      if (Platform.OS === 'android') {
        // Android requires a notification channel
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Get Expo push token
      // Try to get project ID from Constants, but don't require it
      // Expo can auto-detect projectId in most cases
      let projectId: string | undefined;
      try {
        const rawProjectId =
          Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
        // Only use projectId if it's a non-empty string
        projectId =
          rawProjectId && typeof rawProjectId === 'string' && rawProjectId.trim() !== ''
            ? rawProjectId
            : undefined;
      } catch (e) {
        // Ignore errors getting projectId
        logger.debug('Could not get projectId from Constants, Expo will auto-detect');
      }

      let tokenData;
      try {
        // Only pass projectId if it exists and is valid, otherwise let Expo auto-detect
        if (projectId) {
          tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        } else {
          // Try without projectId - Expo should auto-detect in managed workflow
          tokenData = await Notifications.getExpoPushTokenAsync();
        }
      } catch (error: unknown) {
        const errorMessage =
          (error instanceof Error ? error.message : String(error)) || String(error);
        const errorString = String(error);

        // Check if error is due to missing native module
        if (
          errorMessage.includes('native module') ||
          errorMessage.includes('ExpoPushTokenManager')
        ) {
          logger.warn('Notification native module not available. Please rebuild the app.', {
            error: errorMessage,
          });
          return null;
        }

        // Check if error is due to iOS simulator
        if (Platform.OS === 'ios' && !Device.isDevice) {
          if (__DEV__) {
            logger.debug('Push tokens are not available on iOS simulators. Use a real device.', {
              error: errorMessage,
            });
          }
          return null;
        }

        // Check if error is 500 from Expo services (temporary service issue)
        if (
          errorString.includes('500') ||
          errorString.includes('UNEXPECTED_ERROR') ||
          errorString.includes('An unknown error occurred')
        ) {
          if (__DEV__) {
            logger.warn(
              'Expo push notification service temporarily unavailable (500 error). This is usually temporary. Retry later or use a real device.',
              { error: errorMessage }
            );
          } else {
            logger.warn(
              'Expo push notification service temporarily unavailable. Push notifications will be retried later.',
              { error: errorMessage }
            );
          }
          // Return null instead of throwing - this allows the app to continue
          // The app will retry on next launch or when notifications are re-enabled
          return null;
        }

        // Check if error is due to missing projectId
        if (errorMessage.includes('projectId') || errorMessage.includes('project')) {
          // Only log as debug in development, since projectId is now set
          if (__DEV__) {
            logger.debug('ProjectId warning (development mode - normal)', { error: errorMessage });
          } else {
            logger.warn('ProjectId issue detected. Push notifications may not work.', {
              error: errorMessage,
            });
          }
          // Return null instead of throwing - this allows the app to continue
          return null;
        }

        // Log other errors but don't crash the app
        logger.error(
          'Failed to get Expo push token',
          error instanceof Error ? error : new Error(errorMessage)
        );
        return null;
      }

      token = tokenData.data;

      // Save token to AsyncStorage
      if (token) {
        await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, token);
        // Only log token registration in development
        if (__DEV__) {
          logger.debug('Push notification token registered', {
            token: token.substring(0, 20) + '...',
          });
        } else {
          logger.info('Push notification token registered');
        }
      }

      return token;
    } catch (error) {
      logger.error(
        'Failed to register for push notifications',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return null;
    }
  }

  /**
   * Unregister from push notifications
   */
  async unregisterFromPushNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(EXPO_PUSH_TOKEN_KEY);
      if (__DEV__) {
        logger.debug('Push notification token removed');
      }
    } catch (error) {
      logger.error(
        'Failed to unregister from push notifications',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Check if notifications are enabled in preferences
   */
  async isNotificationsEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (value === null) {
        // Default to true if not set
        return true;
      }
      return JSON.parse(value) as boolean;
    } catch (error) {
      logger.warn('Failed to get notifications preference, defaulting to true', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return true;
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    try {
      const notificationsEnabled = await this.isNotificationsEnabled();
      if (!notificationsEnabled) {
        if (__DEV__) {
          logger.debug('Notifications disabled, skipping local notification');
        }
        return null;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: trigger || null, // null means show immediately
      });

      if (__DEV__) {
        logger.debug('Local notification scheduled', { notificationId });
      }
      return notificationId;
    } catch (error) {
      logger.error(
        'Failed to schedule local notification',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      if (__DEV__) {
        logger.debug('Notification cancelled', { notificationId });
      }
    } catch (error) {
      logger.error(
        'Failed to cancel notification',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (__DEV__) {
        logger.debug('All notifications cancelled');
      }
    } catch (error) {
      logger.error(
        'Failed to cancel all notifications',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Get stored push token
   */
  async getStoredPushToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(EXPO_PUSH_TOKEN_KEY);
    } catch (error) {
      logger.error(
        'Failed to get stored push token',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return null;
    }
  }

  /**
   * Get notification permissions status
   */
  async getPermissionsStatus(): Promise<Notifications.PermissionStatus> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      logger.error(
        'Failed to get notification permissions status',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return Notifications.PermissionStatus.UNDETERMINED;
    }
  }
}

export const notificationService = new NotificationService();
