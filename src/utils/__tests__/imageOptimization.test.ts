import {
  optimizeImageForBase64,
  getImageDimensions,
  estimateBase64Size,
} from '../imageOptimization';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

// Mock dependencies
jest.mock('expo-image-manipulator');
jest.mock('expo-file-system/legacy');
jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('imageOptimization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getImageDimensions', () => {
    it('should return image dimensions', async () => {
      const mockImageInfo = {
        width: 2000,
        height: 3000,
        uri: 'file:///path/to/image.jpg',
      };

      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue(mockImageInfo);

      const result = await getImageDimensions('file:///path/to/image.jpg');

      expect(result.width).toBe(2000);
      expect(result.height).toBe(3000);
    });

    it('should handle errors', async () => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockRejectedValue(new Error('Failed'));

      await expect(getImageDimensions('invalid-path')).rejects.toThrow();
    });
  });

  describe('estimateBase64Size', () => {
    it('should estimate base64 size correctly', () => {
      const size = estimateBase64Size(1000, 1000, 0.8);
      expect(size).toBeGreaterThan(0);
      expect(typeof size).toBe('number');
    });

    it('should return larger size for higher quality', () => {
      const sizeLow = estimateBase64Size(1000, 1000, 0.5);
      const sizeHigh = estimateBase64Size(1000, 1000, 0.9);
      expect(sizeHigh).toBeGreaterThan(sizeLow);
    });

    it('should return larger size for bigger images', () => {
      const sizeSmall = estimateBase64Size(500, 500, 0.8);
      const sizeLarge = estimateBase64Size(2000, 2000, 0.8);
      expect(sizeLarge).toBeGreaterThan(sizeSmall);
    });
  });

  describe('optimizeImageForBase64', () => {
    it('should optimize image that needs resizing', async () => {
      const mockImageInfo = {
        width: 2000,
        height: 3000,
        uri: 'file:///path/to/image.jpg',
      };

      const mockOptimizedImage = {
        width: 1024,
        height: 1536,
        uri: 'file:///path/to/optimized.jpg',
      };

      (ImageManipulator.manipulateAsync as jest.Mock)
        .mockResolvedValueOnce(mockImageInfo) // First call for info
        .mockResolvedValueOnce(mockOptimizedImage); // Second call for optimization

      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64string');

      const result = await optimizeImageForBase64('file:///path/to/image.jpg', {
        maxWidth: 1024,
        maxHeight: 1024,
      });

      expect(result).toContain('data:image/jpeg;base64,');
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle images that dont need resizing', async () => {
      const mockImageInfo = {
        width: 500,
        height: 500,
        uri: 'file:///path/to/image.jpg',
      };

      (ImageManipulator.manipulateAsync as jest.Mock)
        .mockResolvedValueOnce(mockImageInfo)
        .mockResolvedValueOnce(mockImageInfo);

      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64string');

      const result = await optimizeImageForBase64('file:///path/to/image.jpg');

      expect(result).toContain('data:image/jpeg;base64,');
    });

    it('should handle errors gracefully', async () => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockRejectedValue(new Error('Failed'));

      await expect(optimizeImageForBase64('invalid-path')).rejects.toThrow();
    });
  });
});
