import { PhotoUploadViewModel } from '../PhotoUploadViewModel';
import { logger } from '../../../utils/logger';
import { errorLoggingService } from '../../../services/errorLoggingService';
import * as ImagePicker from 'expo-image-picker';

// Mock dependencies
jest.mock('../../../utils/logger');
jest.mock('../../../services/errorLoggingService');
jest.mock('expo-image-picker');

describe('PhotoUploadViewModel', () => {
  let viewModel: PhotoUploadViewModel;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create new ViewModel instance for each test
    viewModel = new PhotoUploadViewModel();
  });

  afterEach(() => {
    // Clean up
    viewModel.dispose();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const state = viewModel.getState();

      expect(state.selectedPhoto).toBeNull();
      expect(state.photoSource).toBeNull();
      expect(state.validationError).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.isValid).toBe(false);
    });
  });

  describe('pickFromGallery', () => {
    it('should pick photo from gallery successfully', async () => {
      const mockUri = 'file:///path/to/image.jpg';

      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: mockUri,
            width: 1024,
            height: 1024,
            fileSize: 1024 * 1024, // 1MB
          },
        ],
      });

      const result = await viewModel.pickFromGallery();

      expect(result).toBe(true);
      expect(viewModel.getState().selectedPhoto).toBe(mockUri);
      expect(viewModel.getState().photoSource).toBe('gallery');
      expect(viewModel.getState().isValid).toBe(true);
      expect(viewModel.getState().validationError).toBeNull();
      expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    it('should handle gallery permission denied', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await viewModel.pickFromGallery();

      expect(result).toBe(false);
      expect(viewModel.getState().isValid).toBe(false);
      expect(viewModel.getState().validationError?.type).toBe('permission');
      expect(viewModel.getState().validationError?.message).toBe(
        'Permission to access photo library was denied'
      );
      expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });

    it('should handle cancelled gallery selection', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const result = await viewModel.pickFromGallery();

      expect(result).toBe(false);
      expect(viewModel.getState().selectedPhoto).toBeNull();
      expect(viewModel.getState().loading).toBe(false);
    });

    it('should handle gallery picker error', async () => {
      const error = new Error('Picker error');
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockRejectedValue(error);

      const result = await viewModel.pickFromGallery();

      expect(result).toBe(false);
      expect(viewModel.getState().validationError?.type).toBe('general');
      expect(errorLoggingService.logError).toHaveBeenCalledWith(error, null, {
        service: 'IMAGE_PICKER',
        operation: 'pickFromGallery',
      });
    });
  });

  describe('pickFromCamera', () => {
    it('should take photo from camera successfully', async () => {
      const mockUri = 'file:///path/to/photo.jpg';

      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: mockUri,
            width: 2048,
            height: 2048,
            fileSize: 2 * 1024 * 1024, // 2MB
          },
        ],
      });

      const result = await viewModel.pickFromCamera();

      expect(result).toBe(true);
      expect(viewModel.getState().selectedPhoto).toBe(mockUri);
      expect(viewModel.getState().photoSource).toBe('camera');
      expect(viewModel.getState().isValid).toBe(true);
      expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    it('should handle camera permission denied', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await viewModel.pickFromCamera();

      expect(result).toBe(false);
      expect(viewModel.getState().isValid).toBe(false);
      expect(viewModel.getState().validationError?.type).toBe('permission');
      expect(viewModel.getState().validationError?.message).toBe(
        'Permission to access camera was denied'
      );
      expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
    });

    it('should handle cancelled camera capture', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const result = await viewModel.pickFromCamera();

      expect(result).toBe(false);
      expect(viewModel.getState().selectedPhoto).toBeNull();
    });

    it('should handle camera error', async () => {
      const error = new Error('Camera error');
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockRejectedValue(error);

      const result = await viewModel.pickFromCamera();

      expect(result).toBe(false);
      expect(viewModel.getState().validationError?.type).toBe('general');
      expect(errorLoggingService.logError).toHaveBeenCalled();
    });
  });

  describe('photo validation', () => {
    it('should reject image with width too small', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///small.jpg',
            width: 100, // Too small
            height: 1024,
          },
        ],
      });

      const result = await viewModel.pickFromGallery();

      expect(result).toBe(false);
      expect(viewModel.getState().isValid).toBe(false);
      expect(viewModel.getState().validationError?.type).toBe('dimensions');
      expect(viewModel.getState().validationError?.message).toContain('width must be at least');
    });

    it('should reject image with height too small', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///small.jpg',
            width: 1024,
            height: 100, // Too small
          },
        ],
      });

      const result = await viewModel.pickFromGallery();

      expect(result).toBe(false);
      expect(viewModel.getState().isValid).toBe(false);
      expect(viewModel.getState().validationError?.type).toBe('dimensions');
      expect(viewModel.getState().validationError?.message).toContain('height must be at least');
    });

    it('should reject image with width too large', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///large.jpg',
            width: 5000, // Too large
            height: 1024,
          },
        ],
      });

      const result = await viewModel.pickFromGallery();

      expect(result).toBe(false);
      expect(viewModel.getState().isValid).toBe(false);
      expect(viewModel.getState().validationError?.type).toBe('dimensions');
      expect(viewModel.getState().validationError?.message).toContain('width must be at most');
    });

    it('should reject image with height too large', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///large.jpg',
            width: 1024,
            height: 5000, // Too large
          },
        ],
      });

      const result = await viewModel.pickFromGallery();

      expect(result).toBe(false);
      expect(viewModel.getState().isValid).toBe(false);
      expect(viewModel.getState().validationError?.type).toBe('dimensions');
      expect(viewModel.getState().validationError?.message).toContain('height must be at most');
    });

    it('should reject image with file size too large', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///large.jpg',
            width: 1024,
            height: 1024,
            fileSize: 15 * 1024 * 1024, // 15MB - too large
          },
        ],
      });

      const result = await viewModel.pickFromGallery();

      expect(result).toBe(false);
      expect(viewModel.getState().isValid).toBe(false);
      expect(viewModel.getState().validationError?.type).toBe('size');
      expect(viewModel.getState().validationError?.message).toContain('must be less than');
    });

    it('should reject image with invalid format', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///image.bmp', // Invalid format
            width: 1024,
            height: 1024,
          },
        ],
      });

      const result = await viewModel.pickFromGallery();

      expect(result).toBe(false);
      expect(viewModel.getState().isValid).toBe(false);
      expect(viewModel.getState().validationError?.type).toBe('format');
      expect(viewModel.getState().validationError?.message).toContain('format must be one of');
    });

    it('should accept valid image formats', async () => {
      const validFormats = ['jpg', 'jpeg', 'png', 'webp'];

      for (const format of validFormats) {
        jest.clearAllMocks();
        const freshViewModel = new PhotoUploadViewModel();

        (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
          status: 'granted',
        });

        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
          canceled: false,
          assets: [
            {
              uri: `file:///image.${format}`,
              width: 1024,
              height: 1024,
            },
          ],
        });

        const result = await freshViewModel.pickFromGallery();

        expect(result).toBe(true);
        expect(freshViewModel.getState().isValid).toBe(true);

        freshViewModel.dispose();
      }
    });
  });

  describe('setValidationRules', () => {
    it('should update validation rules', () => {
      viewModel.setValidationRules({
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        minWidth: 512,
        minHeight: 512,
      });

      expect(logger.debug).toHaveBeenCalledWith(
        'PhotoUploadViewModel: Validation rules updated',
        expect.objectContaining({
          maxSizeBytes: 5 * 1024 * 1024,
          minWidth: 512,
          minHeight: 512,
        })
      );
    });

    it('should apply custom validation rules', async () => {
      viewModel.setValidationRules({
        minWidth: 2000,
        minHeight: 2000,
      });

      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///image.jpg',
            width: 1024, // Less than custom min
            height: 1024,
          },
        ],
      });

      const result = await viewModel.pickFromGallery();

      expect(result).toBe(false);
      expect(viewModel.getState().validationError?.message).toContain('width must be at least 2000px');
    });
  });

  describe('state management', () => {
    it('should subscribe to state changes', () => {
      const listener = jest.fn();
      const unsubscribe = viewModel.subscribe(listener);

      viewModel['setState']({ loading: true });

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          loading: true,
        })
      );

      unsubscribe();
      viewModel['setState']({ loading: false });

      // Should not be called again after unsubscribe
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should clear selection', () => {
      viewModel['setState']({
        selectedPhoto: 'test.jpg',
        photoSource: 'gallery',
        isValid: true,
      });

      viewModel.clearSelection();

      const state = viewModel.getState();
      expect(state.selectedPhoto).toBeNull();
      expect(state.photoSource).toBeNull();
      expect(state.isValid).toBe(false);
      expect(state.validationError).toBeNull();
    });

    it('should clear error', () => {
      viewModel['setState']({
        validationError: { type: 'general', message: 'Test error' },
      });

      viewModel.clearError();

      expect(viewModel.getState().validationError).toBeNull();
    });
  });

  describe('helper methods', () => {
    it('should check if has valid photo', () => {
      expect(viewModel.hasValidPhoto()).toBe(false);

      viewModel['setState']({ selectedPhoto: 'test.jpg', isValid: true });
      expect(viewModel.hasValidPhoto()).toBe(true);

      viewModel['setState']({ isValid: false });
      expect(viewModel.hasValidPhoto()).toBe(false);
    });

    it('should get photo URI', () => {
      expect(viewModel.getPhotoUri()).toBeNull();

      viewModel['setState']({ selectedPhoto: 'test.jpg' });
      expect(viewModel.getPhotoUri()).toBe('test.jpg');
    });

    it('should get validation error message', () => {
      expect(viewModel.getValidationErrorMessage()).toBeNull();

      viewModel['setState']({
        validationError: { type: 'size', message: 'File too large' },
      });
      expect(viewModel.getValidationErrorMessage()).toBe('File too large');
    });
  });

  describe('edge cases', () => {
    it('should handle non-Error objects in catch blocks', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockRejectedValue(
        'String error'
      );

      const result = await viewModel.pickFromGallery();

      expect(result).toBe(false);
      expect(viewModel.getState().validationError?.message).toBe('Failed to pick photo from gallery');
    });

    it('should handle missing fileSize in validation', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///image.jpg',
            width: 1024,
            height: 1024,
            // fileSize is undefined
          },
        ],
      });

      const result = await viewModel.pickFromGallery();

      // Should still pass validation without fileSize
      expect(result).toBe(true);
      expect(viewModel.getState().isValid).toBe(true);
    });

    it('should dispose and clear listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      viewModel.subscribe(listener1);
      viewModel.subscribe(listener2);

      viewModel.dispose();

      viewModel['setState']({ loading: true });

      // Listeners should not be called after dispose
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });
});
