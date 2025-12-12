import { SettingsViewModel } from '../SettingsViewModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../../../services/notificationService';
import * as Notifications from 'expo-notifications';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../services/notificationService');
jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: jest.fn(),
}));

describe('SettingsViewModel', () => {
  let viewModel: SettingsViewModel;

  beforeEach(() => {
    viewModel = new SettingsViewModel();
    jest.clearAllMocks();
  });

  describe('checkNotificationsModule', () => {
    it('should detect available notifications module', () => {
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockReturnValue(Promise.resolve());
      const available = viewModel.checkNotificationsModule();
      expect(available).toBe(true);
    });

    it('should detect unavailable notifications module', () => {
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockReturnValue(undefined);
      const available = viewModel.checkNotificationsModule();
      expect(available).toBe(false);
    });
  });

  describe('loadPreferences', () => {
    it('should load saved preferences', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(true))
        .mockResolvedValueOnce(JSON.stringify(false));

      await viewModel.loadPreferences();

      const state = viewModel.getState();
      expect(state.notifications).toBe(true);
      expect(state.autoSave).toBe(false);
      expect(state.loading).toBe(false);
    });

    it('should use default values when no preferences saved', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await viewModel.loadPreferences();

      const state = viewModel.getState();
      expect(state.notifications).toBe(true);
      expect(state.autoSave).toBe(true);
    });
  });

  describe('updateNotifications', () => {
    it('should update notifications preference successfully', async () => {
      (notificationService.requestPermissions as jest.Mock).mockResolvedValue(true);
      (notificationService.registerForPushNotifications as jest.Mock).mockResolvedValue('token');
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await viewModel.updateNotifications(true);

      expect(result.success).toBe(true);
      const state = viewModel.getState();
      expect(state.notifications).toBe(true);
    });

    it('should handle permission denial', async () => {
      (notificationService.requestPermissions as jest.Mock).mockResolvedValue(false);

      const result = await viewModel.updateNotifications(true);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Permission Required');
    });
  });

  describe('updateAutoSave', () => {
    it('should update auto save preference', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await viewModel.updateAutoSave(false);

      const state = viewModel.getState();
      expect(state.autoSave).toBe(false);
    });
  });
});
