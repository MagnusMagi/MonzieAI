import { EnhanceViewModel } from '../EnhanceViewModel';
import { falAIService } from '../../../services/falAIService';
import { logger } from '../../../utils/logger';
import { errorLoggingService } from '../../../services/errorLoggingService';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

// Mock dependencies
jest.mock('../../../services/falAIService');
jest.mock('../../../utils/logger');
jest.mock('../../../services/errorLoggingService');
jest.mock('expo-image-picker');
jest.mock('expo-media-library');
jest.mock('expo-sharing');

describe('EnhanceViewModel', () => {
  let viewModel: EnhanceViewModel;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create new ViewModel instance for each test
    viewModel = new EnhanceViewModel();
  });

  afterEach(() => {
    // Clean up
    viewModel.dispose();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const state = viewModel.getState();

      expect(state.sourceImage).toBeNull();
      expect(state.enhancedImage).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.progress).toBe(0);
      expect(state.error).toBeNull();
      expect(state.enhancing).toBe(false);
    });
  });

  describe('selectImage', () => {
    it('should select image from gallery successfully', async () => {
      const mockUri = 'file:///path/to/image.jpg';

      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: mockUri }],
      });

      const result = await viewModel.selectImage();

      expect(result).toBe(true);
      expect(viewModel.getState().sourceImage).toBe(mockUri);
      expect(viewModel.getState().enhancedImage).toBeNull();
      expect(viewModel.getState().loading).toBe(false);
      expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });
    });

    it('should handle permission denied', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await viewModel.selectImage();

      expect(result).toBe(false);
      expect(viewModel.getState().error).toBe('Permission to access media library was denied');
      expect(viewModel.getState().sourceImage).toBeNull();
      expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });

    it('should handle cancelled selection', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const result = await viewModel.selectImage();

      expect(result).toBe(false);
      expect(viewModel.getState().sourceImage).toBeNull();
      expect(viewModel.getState().loading).toBe(false);
    });

    it('should handle selection error', async () => {
      const error = new Error('Image picker error');
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockRejectedValue(error);

      const result = await viewModel.selectImage();

      expect(result).toBe(false);
      expect(viewModel.getState().error).toBe('Image picker error');
      expect(errorLoggingService.logError).toHaveBeenCalledWith(error, null, {
        service: 'IMAGE_PICKER',
        operation: 'selectImage',
      });
    });
  });

  describe('takePhoto', () => {
    it('should take photo with camera successfully', async () => {
      const mockUri = 'file:///path/to/photo.jpg';

      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: mockUri }],
      });

      const result = await viewModel.takePhoto();

      expect(result).toBe(true);
      expect(viewModel.getState().sourceImage).toBe(mockUri);
      expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith({
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });
    });

    it('should handle camera permission denied', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await viewModel.takePhoto();

      expect(result).toBe(false);
      expect(viewModel.getState().error).toBe('Permission to access camera was denied');
      expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
    });

    it('should handle cancelled photo capture', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const result = await viewModel.takePhoto();

      expect(result).toBe(false);
      expect(viewModel.getState().sourceImage).toBeNull();
    });
  });

  describe('enhanceImage', () => {
    const mockSourceUri = 'file:///path/to/source.jpg';
    const mockEnhancedUrl = 'https://example.com/enhanced.jpg';

    beforeEach(() => {
      // Pre-select an image
      viewModel['setState']({ sourceImage: mockSourceUri });
    });

    it('should enhance image successfully', async () => {
      const mockResult = {
        image: {
          url: mockEnhancedUrl,
        },
      };

      (falAIService.enhanceImage as jest.Mock).mockResolvedValue(mockResult);

      const result = await viewModel.enhanceImage();

      expect(result).toBe(true);
      expect(viewModel.getState().enhancedImage).toBe(mockEnhancedUrl);
      expect(viewModel.getState().enhancing).toBe(false);
      expect(viewModel.getState().loading).toBe(false);
      expect(viewModel.getState().progress).toBe(100);
      expect(falAIService.enhanceImage).toHaveBeenCalledWith(
        expect.objectContaining({
          imageUrl: mockSourceUri,
          onProgress: expect.any(Function),
        })
      );
    });

    it('should handle no source image', async () => {
      const freshViewModel = new EnhanceViewModel();

      const result = await freshViewModel.enhanceImage();

      expect(result).toBe(false);
      expect(freshViewModel.getState().error).toBe('Please select an image first');
      expect(falAIService.enhanceImage).not.toHaveBeenCalled();

      freshViewModel.dispose();
    });

    it('should update progress during enhancement', async () => {
      let progressCallback: ((progress: number, status: string) => void) | undefined;

      (falAIService.enhanceImage as jest.Mock).mockImplementation(async ({ onProgress }) => {
        progressCallback = onProgress;
        if (progressCallback) {
          progressCallback(25, 'Processing');
          progressCallback(50, 'Enhancing');
          progressCallback(75, 'Finalizing');
        }
        return {
          image: {
            url: mockEnhancedUrl,
          },
        };
      });

      await viewModel.enhanceImage();

      expect(logger.debug).toHaveBeenCalledWith(
        'EnhanceViewModel: Enhancement progress',
        expect.objectContaining({ progress: 75 })
      );
    });

    it('should handle enhancement with no image URL', async () => {
      (falAIService.enhanceImage as jest.Mock).mockResolvedValue({
        image: {},
      });

      const result = await viewModel.enhanceImage();

      expect(result).toBe(false);
      expect(viewModel.getState().error).toBe('Enhancement failed: No enhanced image received');
      expect(viewModel.getState().enhancing).toBe(false);
    });

    it('should handle enhancement error', async () => {
      const error = new Error('Enhancement failed');
      (falAIService.enhanceImage as jest.Mock).mockRejectedValue(error);

      const result = await viewModel.enhanceImage();

      expect(result).toBe(false);
      expect(viewModel.getState().error).toBe('Enhancement failed');
      expect(viewModel.getState().enhancing).toBe(false);
      expect(errorLoggingService.logError).toHaveBeenCalledWith(error, null, {
        service: 'FAL_AI',
        operation: 'enhanceImage',
      });
    });
  });

  describe('saveEnhancedImage', () => {
    const mockEnhancedUrl = 'https://example.com/enhanced.jpg';

    beforeEach(() => {
      viewModel['setState']({ enhancedImage: mockEnhancedUrl });
    });

    it('should save enhanced image successfully', async () => {
      const mockAsset = { id: 'asset-123' };

      (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (MediaLibrary.createAssetAsync as jest.Mock).mockResolvedValue(mockAsset);

      const result = await viewModel.saveEnhancedImage();

      expect(result).toBe(true);
      expect(viewModel.getState().loading).toBe(false);
      expect(MediaLibrary.requestPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(MediaLibrary.createAssetAsync).toHaveBeenCalledWith(mockEnhancedUrl);
    });

    it('should handle no enhanced image', async () => {
      const freshViewModel = new EnhanceViewModel();

      const result = await freshViewModel.saveEnhancedImage();

      expect(result).toBe(false);
      expect(freshViewModel.getState().error).toBe('No enhanced image to save');
      expect(MediaLibrary.requestPermissionsAsync).not.toHaveBeenCalled();

      freshViewModel.dispose();
    });

    it('should handle permission denied', async () => {
      (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await viewModel.saveEnhancedImage();

      expect(result).toBe(false);
      expect(viewModel.getState().error).toBe('Permission to save to media library was denied');
      expect(MediaLibrary.createAssetAsync).not.toHaveBeenCalled();
    });

    it('should handle save error', async () => {
      const error = new Error('Failed to save');
      (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (MediaLibrary.createAssetAsync as jest.Mock).mockRejectedValue(error);

      const result = await viewModel.saveEnhancedImage();

      expect(result).toBe(false);
      expect(viewModel.getState().error).toBe('Failed to save');
      expect(errorLoggingService.logError).toHaveBeenCalled();
    });
  });

  describe('shareEnhancedImage', () => {
    const mockEnhancedUrl = 'https://example.com/enhanced.jpg';

    beforeEach(() => {
      viewModel['setState']({ enhancedImage: mockEnhancedUrl });
    });

    it('should share enhanced image successfully', async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await viewModel.shareEnhancedImage();

      expect(result).toBe(true);
      expect(viewModel.getState().loading).toBe(false);
      expect(Sharing.isAvailableAsync).toHaveBeenCalledTimes(1);
      expect(Sharing.shareAsync).toHaveBeenCalledWith(mockEnhancedUrl, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share Enhanced Image',
      });
    });

    it('should handle no enhanced image', async () => {
      const freshViewModel = new EnhanceViewModel();

      const result = await freshViewModel.shareEnhancedImage();

      expect(result).toBe(false);
      expect(freshViewModel.getState().error).toBe('No enhanced image to share');
      expect(Sharing.isAvailableAsync).not.toHaveBeenCalled();

      freshViewModel.dispose();
    });

    it('should handle sharing not available', async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

      const result = await viewModel.shareEnhancedImage();

      expect(result).toBe(false);
      expect(viewModel.getState().error).toBe('Sharing is not available on this device');
      expect(Sharing.shareAsync).not.toHaveBeenCalled();
    });

    it('should handle share error', async () => {
      const error = new Error('Share failed');
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (Sharing.shareAsync as jest.Mock).mockRejectedValue(error);

      const result = await viewModel.shareEnhancedImage();

      expect(result).toBe(false);
      expect(viewModel.getState().error).toBe('Share failed');
      expect(errorLoggingService.logError).toHaveBeenCalled();
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

    it('should clear error', () => {
      viewModel['setState']({ error: 'Test error' });
      expect(viewModel.getState().error).toBe('Test error');

      viewModel.clearError();
      expect(viewModel.getState().error).toBeNull();
    });

    it('should reset state', () => {
      viewModel['setState']({
        sourceImage: 'test.jpg',
        enhancedImage: 'enhanced.jpg',
        loading: true,
        progress: 50,
        error: 'error',
        enhancing: true,
      });

      viewModel.reset();

      const state = viewModel.getState();
      expect(state.sourceImage).toBeNull();
      expect(state.enhancedImage).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.progress).toBe(0);
      expect(state.error).toBeNull();
      expect(state.enhancing).toBe(false);
    });
  });

  describe('helper methods', () => {
    it('should check if can enhance', () => {
      expect(viewModel.canEnhance()).toBe(false);

      viewModel['setState']({ sourceImage: 'test.jpg' });
      expect(viewModel.canEnhance()).toBe(true);

      viewModel['setState']({ enhancing: true });
      expect(viewModel.canEnhance()).toBe(false);
    });

    it('should check if can save or share', () => {
      expect(viewModel.canSaveOrShare()).toBe(false);

      viewModel['setState']({ enhancedImage: 'enhanced.jpg' });
      expect(viewModel.canSaveOrShare()).toBe(true);

      viewModel['setState']({ loading: true });
      expect(viewModel.canSaveOrShare()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle non-Error objects in catch blocks', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockRejectedValue(
        'String error'
      );

      const result = await viewModel.selectImage();

      expect(result).toBe(false);
      expect(viewModel.getState().error).toBe('Failed to select image. Please try again.');
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
