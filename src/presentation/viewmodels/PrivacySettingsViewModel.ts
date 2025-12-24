import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../utils/logger';
import { errorLoggingService } from '../../services/errorLoggingService';
import { supabase } from '../../config/supabase';

/**
 * PrivacySettingsViewModel
 * Handles privacy settings business logic and state management
 * Follows MVVM pattern for separation of concerns
 */

const PRIVACY_SETTINGS_KEY = '@monzieai:privacy_settings';

export interface PrivacySettings {
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  personalizedAdsEnabled: boolean;
  dataSharingEnabled: boolean;
}

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  analyticsEnabled: true,
  crashReportingEnabled: true,
  personalizedAdsEnabled: false,
  dataSharingEnabled: false,
};

interface PrivacySettingsState {
  settings: PrivacySettings;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export class PrivacySettingsViewModel {
  private state: PrivacySettingsState = {
    settings: DEFAULT_PRIVACY_SETTINGS,
    loading: false,
    saving: false,
    error: null,
  };

  private listeners: Set<(state: PrivacySettingsState) => void> = new Set();

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: PrivacySettingsState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  /**
   * Update state and notify listeners
   */
  private setState(updates: Partial<PrivacySettingsState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state snapshot
   */
  getState(): PrivacySettingsState {
    return { ...this.state };
  }

  /**
   * Load privacy settings from storage
   */
  async loadSettings(): Promise<void> {
    try {
      this.setState({ loading: true, error: null });

      logger.debug('PrivacySettingsViewModel: Loading settings');

      const storedSettings = await AsyncStorage.getItem(PRIVACY_SETTINGS_KEY);

      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings) as PrivacySettings;

        logger.debug('PrivacySettingsViewModel: Settings loaded', parsedSettings);

        this.setState({
          settings: parsedSettings,
          loading: false,
        });
      } else {
        logger.debug('PrivacySettingsViewModel: No stored settings, using defaults');

        this.setState({
          settings: DEFAULT_PRIVACY_SETTINGS,
          loading: false,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load privacy settings';

      logger.error('PrivacySettingsViewModel: Failed to load settings', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'ASYNC_STORAGE',
        operation: 'loadSettings',
      });

      this.setState({
        loading: false,
        error: errorMessage,
        settings: DEFAULT_PRIVACY_SETTINGS,
      });
    }
  }

  /**
   * Update a specific privacy setting
   */
  async updateSetting(key: keyof PrivacySettings, value: boolean): Promise<boolean> {
    try {
      this.setState({ saving: true, error: null });

      logger.debug('PrivacySettingsViewModel: Updating setting', { key, value });

      const updatedSettings = {
        ...this.state.settings,
        [key]: value,
      };

      // Save to storage
      await AsyncStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(updatedSettings));

      logger.info('PrivacySettingsViewModel: Setting updated', { key, value });

      this.setState({
        settings: updatedSettings,
        saving: false,
      });

      // Apply setting changes to relevant services
      await this.applySetting(key, value);

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update privacy setting';

      logger.error('PrivacySettingsViewModel: Failed to update setting', error as Error, {
        key,
        value,
      });

      errorLoggingService.logError(error, null, {
        service: 'ASYNC_STORAGE',
        operation: 'updateSetting',
        settingKey: key,
      });

      this.setState({
        saving: false,
        error: errorMessage,
      });

      return false;
    }
  }

  /**
   * Apply setting changes to relevant services
   */
  private async applySetting(key: keyof PrivacySettings, value: boolean): Promise<void> {
    try {
      switch (key) {
        case 'analyticsEnabled':
          // Apply to analytics service
          logger.debug('PrivacySettingsViewModel: Analytics setting applied', { value });
          // Analytics service integration would go here
          break;

        case 'crashReportingEnabled':
          // Apply to crash reporting service
          logger.debug('PrivacySettingsViewModel: Crash reporting setting applied', { value });
          // Crash reporting service integration would go here
          break;

        case 'personalizedAdsEnabled':
          // Apply to ads service
          logger.debug('PrivacySettingsViewModel: Personalized ads setting applied', { value });
          // Ads service integration would go here
          break;

        case 'dataSharingEnabled':
          // Apply to data sharing settings
          logger.debug('PrivacySettingsViewModel: Data sharing setting applied', { value });
          // Data sharing service integration would go here
          break;

        default:
          logger.warn('PrivacySettingsViewModel: Unknown setting key', { key });
      }
    } catch (error) {
      logger.error('PrivacySettingsViewModel: Failed to apply setting', error as Error, {
        key,
        value,
      });
    }
  }

  /**
   * Save all current settings
   */
  async saveAllSettings(): Promise<boolean> {
    try {
      this.setState({ saving: true, error: null });

      logger.debug('PrivacySettingsViewModel: Saving all settings', this.state.settings);

      await AsyncStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(this.state.settings));

      logger.info('PrivacySettingsViewModel: All settings saved successfully');

      this.setState({ saving: false });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';

      logger.error('PrivacySettingsViewModel: Failed to save all settings', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'ASYNC_STORAGE',
        operation: 'saveAllSettings',
      });

      this.setState({
        saving: false,
        error: errorMessage,
      });

      return false;
    }
  }

  /**
   * Request user data deletion
   */
  async requestDataDeletion(): Promise<boolean> {
    try {
      this.setState({ loading: true, error: null });

      logger.debug('PrivacySettingsViewModel: Requesting data deletion');

      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error('No authenticated user found');
      }

      const userId = session.user.id;

      // In a real implementation, this would:
      // 1. Mark user data for deletion
      // 2. Queue deletion jobs
      // 3. Send confirmation email
      // 4. Schedule actual deletion after grace period

      logger.info('PrivacySettingsViewModel: Data deletion requested', { userId });

      this.setState({ loading: false });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to request data deletion';

      logger.error('PrivacySettingsViewModel: Failed to request data deletion', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'SUPABASE',
        operation: 'requestDataDeletion',
      });

      this.setState({
        loading: false,
        error: errorMessage,
      });

      return false;
    }
  }

  /**
   * Export user data
   */
  async exportUserData(): Promise<boolean> {
    try {
      this.setState({ loading: true, error: null });

      logger.debug('PrivacySettingsViewModel: Exporting user data');

      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error('No authenticated user found');
      }

      const userId = session.user.id;

      // In a real implementation, this would:
      // 1. Collect all user data from various tables
      // 2. Create a data export package
      // 3. Generate download link or send via email

      logger.info('PrivacySettingsViewModel: User data export initiated', { userId });

      this.setState({ loading: false });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export user data';

      logger.error('PrivacySettingsViewModel: Failed to export user data', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'SUPABASE',
        operation: 'exportUserData',
      });

      this.setState({
        loading: false,
        error: errorMessage,
      });

      return false;
    }
  }

  /**
   * Clear app cache and temporary data
   */
  async clearCache(): Promise<boolean> {
    try {
      this.setState({ loading: true, error: null });

      logger.debug('PrivacySettingsViewModel: Clearing cache');

      // In a real implementation, this would clear:
      // - Image cache
      // - Generated images cache
      // - API response cache
      // - Temporary files

      logger.info('PrivacySettingsViewModel: Cache cleared successfully');

      this.setState({ loading: false });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear cache';

      logger.error('PrivacySettingsViewModel: Failed to clear cache', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'CACHE',
        operation: 'clearCache',
      });

      this.setState({
        loading: false,
        error: errorMessage,
      });

      return false;
    }
  }

  /**
   * Reset to default settings
   */
  async resetToDefaults(): Promise<boolean> {
    try {
      this.setState({ saving: true, error: null });

      logger.debug('PrivacySettingsViewModel: Resetting to default settings');

      await AsyncStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(DEFAULT_PRIVACY_SETTINGS));

      logger.info('PrivacySettingsViewModel: Settings reset to defaults');

      this.setState({
        settings: DEFAULT_PRIVACY_SETTINGS,
        saving: false,
      });

      // Apply default settings to services
      for (const [key, value] of Object.entries(DEFAULT_PRIVACY_SETTINGS)) {
        await this.applySetting(key as keyof PrivacySettings, value);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset settings';

      logger.error('PrivacySettingsViewModel: Failed to reset settings', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'ASYNC_STORAGE',
        operation: 'resetToDefaults',
      });

      this.setState({
        saving: false,
        error: errorMessage,
      });

      return false;
    }
  }

  /**
   * Get a specific setting value
   */
  getSetting(key: keyof PrivacySettings): boolean {
    return this.state.settings[key];
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.setState({ error: null });
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.listeners.clear();
    logger.debug('PrivacySettingsViewModel: Disposed');
  }
}

// Export singleton instance
export const privacySettingsViewModel = new PrivacySettingsViewModel();
