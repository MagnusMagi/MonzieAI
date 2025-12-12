import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';
import { notificationService } from '../services/notificationService';
import * as Notifications from 'expo-notifications';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const NOTIFICATIONS_KEY = '@monzieai:notifications_enabled';
const AUTO_SAVE_KEY = '@monzieai:auto_save_enabled';

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isNotificationsModuleAvailable, setIsNotificationsModuleAvailable] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    checkNotificationsModule();
    loadPreferences();
  }, []);

  const checkNotificationsModule = () => {
    // Check if Notifications native module is available
    const available = !!Notifications.getExpoPushTokenAsync;
    setIsNotificationsModuleAvailable(available);
    if (!available) {
      logger.warn(
        'Expo Notifications native module not found. Push notifications will be disabled in UI.'
      );
    }
  };

  const loadPreferences = async () => {
    try {
      const [notificationsValue, autoSaveValue] = await Promise.all([
        AsyncStorage.getItem(NOTIFICATIONS_KEY),
        AsyncStorage.getItem(AUTO_SAVE_KEY),
      ]);

      if (notificationsValue !== null) {
        setNotifications(JSON.parse(notificationsValue));
      }
      if (autoSaveValue !== null) {
        setAutoSave(JSON.parse(autoSaveValue));
      }
    } catch (error) {
      logger.error(
        'Failed to load preferences',
        error instanceof Error ? error : new Error('Unknown error')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsChange = async (value: boolean) => {
    // Check if native module is available before proceeding
    if (value && !isNotificationsModuleAvailable) {
      Alert.alert(
        'Notifications Unavailable',
        'Push notifications are not available in Expo Go. Please use a development build to enable notifications.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      if (value) {
        // Enable notifications - request permissions and register
        try {
          const hasPermission = await notificationService.requestPermissions();
          if (!hasPermission) {
            Alert.alert(
              'Permission Required',
              'Please enable notifications in your device settings to receive push notifications.',
              [{ text: 'OK' }]
            );
            // Don't update state if permission denied
            return;
          }

          // Register for push notifications
          const token = await notificationService.registerForPushNotifications();
          if (token) {
            logger.info('Push notifications enabled', { token: token.substring(0, 20) + '...' });
          } else {
            logger.warn('Failed to register for push notifications');
            // Don't show alert - just log the warning
            // The preference will still be saved, but notifications won't work until native build is available
            // This allows users to enable the toggle even in Expo Go (it just won't work)
          }
        } catch (error) {
          // Check if error is due to missing native module
          if (
            error instanceof Error &&
            (error.message.includes('native module') || error.message.includes('projectId'))
          ) {
            // Don't show alert if we already know module is not available
            if (isNotificationsModuleAvailable) {
              Alert.alert(
                'Setup Required',
                'Push notifications require a development build. Please rebuild the app with:\n\nnpx expo run:ios',
                [{ text: 'OK' }]
              );
            }
            // Don't update state if native module is missing
            return;
          }
          throw error;
        }
      } else {
        // Disable notifications - unregister
        try {
          await notificationService.unregisterFromPushNotifications();
          logger.info('Push notifications disabled');
        } catch (error) {
          // Silently fail if native module is not available
          logger.warn('Failed to unregister notifications (native module may not be available)');
        }
      }

      // Update preference
      setNotifications(value);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(value));
      logger.info('Notifications preference updated', { enabled: value });
    } catch (error) {
      logger.error(
        'Failed to save notifications preference',
        error instanceof Error ? error : new Error('Unknown error')
      );
      // Revert on error
      setNotifications(!value);
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
    }
  };

  const handleAutoSaveChange = async (value: boolean) => {
    try {
      setAutoSave(value);
      await AsyncStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(value));
      logger.info('Auto save preference updated', { enabled: value });
    } catch (error) {
      logger.error(
        'Failed to save auto save preference',
        error instanceof Error ? error : new Error('Unknown error')
      );
      // Revert on error
      setAutoSave(!value);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive updates and alerts</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsChange}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.background}
              disabled={loading || !isNotificationsModuleAvailable}
            />
          </View>
          {!isNotificationsModuleAvailable && (
            <Text style={styles.warningText}>
              Push notifications are not available in Expo Go. Please use a development build.
            </Text>
          )}
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Auto Save</Text>
              <Text style={styles.settingDescription}>Automatically save creations</Text>
            </View>
            <Switch
              value={autoSave}
              onValueChange={handleAutoSaveChange}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.background}
              disabled={loading}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('ChangePassword')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('PrivacySettings')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionText}>Privacy Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2024.01.15</Text>
          </View>
        </View>
      </ScrollView>
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
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  settingContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  settingDescription: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  actionText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    fontStyle: 'italic',
  },
});
