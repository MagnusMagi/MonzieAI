import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../../services/notificationService';
import * as Notifications from 'expo-notifications';
import { logger } from '../../utils/logger';

const NOTIFICATIONS_KEY = '@monzieai:notifications_enabled';
const AUTO_SAVE_KEY = '@monzieai:auto_save_enabled';

/**
 * Settings ViewModel
 * Manages state and business logic for Settings screen
 */
export class SettingsViewModel {
  private notifications = true;
  private autoSave = true;
  private loading = true;
  private isNotificationsModuleAvailable = true;

  /**
   * Check if notifications module is available
   */
  checkNotificationsModule(): boolean {
    const available = !!Notifications.getExpoPushTokenAsync;
    this.isNotificationsModuleAvailable = available;
    if (!available) {
      logger.warn(
        'Expo Notifications native module not found. Push notifications will be disabled in UI.'
      );
    }
    return available;
  }

  /**
   * Load preferences
   */
  async loadPreferences(): Promise<void> {
    try {
      const [notificationsValue, autoSaveValue] = await Promise.all([
        AsyncStorage.getItem(NOTIFICATIONS_KEY),
        AsyncStorage.getItem(AUTO_SAVE_KEY),
      ]);

      if (notificationsValue !== null) {
        this.notifications = JSON.parse(notificationsValue);
      }
      if (autoSaveValue !== null) {
        this.autoSave = JSON.parse(autoSaveValue);
      }
    } catch (error) {
      logger.error(
        'Failed to load preferences',
        error instanceof Error ? error : new Error('Unknown error')
      );
    } finally {
      this.loading = false;
    }
  }

  /**
   * Update notifications preference
   */
  async updateNotifications(value: boolean): Promise<{ success: boolean; error?: string }> {
    // Check if native module is available
    if (value && !this.isNotificationsModuleAvailable) {
      return {
        success: false,
        error:
          'Notifications Unavailable: Push notifications are not available in Expo Go. Please use a development build to enable notifications.',
      };
    }

    try {
      if (value) {
        // Enable notifications - request permissions and register
        try {
          const hasPermission = await notificationService.requestPermissions();
          if (!hasPermission) {
            return {
              success: false,
              error:
                'Permission Required: Please enable notifications in your device settings to receive push notifications.',
            };
          }

          // Register for push notifications
          const token = await notificationService.registerForPushNotifications();
          if (token) {
            logger.info('Push notifications enabled', { token: token.substring(0, 20) + '...' });
          } else {
            logger.warn('Failed to register for push notifications');
          }
        } catch (error) {
          // Check if error is due to missing native module
          if (
            error instanceof Error &&
            (error.message.includes('native module') || error.message.includes('projectId'))
          ) {
            if (this.isNotificationsModuleAvailable) {
              return {
                success: false,
                error:
                  'Setup Required: Push notifications require a development build. Please rebuild the app with: npx expo run:ios',
              };
            }
            return {
              success: false,
              error: 'Native module not available',
            };
          }
          throw error;
        }
      } else {
        // Disable notifications - unregister
        try {
          await notificationService.unregisterFromPushNotifications();
          logger.info('Push notifications disabled');
        } catch (error) {
          logger.warn('Failed to unregister notifications (native module may not be available)');
        }
      }

      // Update preference
      this.notifications = value;
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(value));
      logger.info('Notifications preference updated', { enabled: value });
      return { success: true };
    } catch (error) {
      logger.error(
        'Failed to save notifications preference',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return {
        success: false,
        error: 'Failed to update notification settings. Please try again.',
      };
    }
  }

  /**
   * Update auto save preference
   */
  async updateAutoSave(value: boolean): Promise<void> {
    try {
      this.autoSave = value;
      await AsyncStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(value));
      logger.info('Auto save preference updated', { enabled: value });
    } catch (error) {
      logger.error(
        'Failed to save auto save preference',
        error instanceof Error ? error : new Error('Unknown error')
      );
      throw error;
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      notifications: this.notifications,
      autoSave: this.autoSave,
      loading: this.loading,
      isNotificationsModuleAvailable: this.isNotificationsModuleAvailable,
    };
  }
}
