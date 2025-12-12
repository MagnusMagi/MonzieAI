import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { logger } from './logger';

/**
 * Image Optimization Utility
 * Compresses and resizes images before base64 conversion to reduce memory usage
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1, default 0.8
  compress?: boolean; // default true
}

const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
  compress: true,
};

/**
 * Optimize image by resizing and compressing before base64 conversion
 * @param imageUri Local file URI
 * @param options Optimization options
 * @returns Optimized base64 data URI
 */
export async function optimizeImageForBase64(
  imageUri: string,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  try {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Remove file:// prefix if present
    const cleanUri = imageUri.replace('file://', '');

    // Get image info first
    const imageInfo = await ImageManipulator.manipulateAsync(
      cleanUri,
      [], // No manipulations yet, just get info
      { format: ImageManipulator.SaveFormat.JPEG }
    );

    // Calculate resize dimensions if needed
    let resizeAction: ImageManipulator.Action | null = null;
    if (imageInfo.width > opts.maxWidth || imageInfo.height > opts.maxHeight) {
      const aspectRatio = imageInfo.width / imageInfo.height;
      let newWidth = imageInfo.width;
      let newHeight = imageInfo.height;

      if (imageInfo.width > opts.maxWidth) {
        newWidth = opts.maxWidth;
        newHeight = newWidth / aspectRatio;
      }

      if (newHeight > opts.maxHeight) {
        newHeight = opts.maxHeight;
        newWidth = newHeight * aspectRatio;
      }

      resizeAction = {
        resize: {
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        },
      };
    }

    // Perform optimization
    const manipulations: ImageManipulator.Action[] = [];
    if (resizeAction) {
      manipulations.push(resizeAction);
    }

    const optimizedImage = await ImageManipulator.manipulateAsync(cleanUri, manipulations, {
      compress: opts.compress ? opts.quality : 1.0,
      format: ImageManipulator.SaveFormat.JPEG, // JPEG for better compression
    });

    // Read optimized image as base64
    // Using legacy API for readAsStringAsync (expo-file-system v19+ deprecated it)
    const base64 = await FileSystem.readAsStringAsync(optimizedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Clean up temporary file if it was created
    if (optimizedImage.uri !== cleanUri && optimizedImage.uri.startsWith('file://')) {
      try {
        await FileSystem.deleteAsync(optimizedImage.uri, { idempotent: true });
      } catch (cleanupError) {
        logger.warn('Failed to cleanup temporary optimized image', { error: cleanupError });
      }
    }

    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    logger.error(
      'Image optimization failed',
      error instanceof Error ? error : new Error('Unknown error')
    );
    // Fallback to original conversion if optimization fails
    throw new Error('Failed to optimize image');
  }
}

/**
 * Get image dimensions without loading full image
 */
export async function getImageDimensions(
  imageUri: string
): Promise<{ width: number; height: number }> {
  try {
    const cleanUri = imageUri.replace('file://', '');
    const imageInfo = await ImageManipulator.manipulateAsync(cleanUri, [], {
      format: ImageManipulator.SaveFormat.JPEG,
    });

    return {
      width: imageInfo.width,
      height: imageInfo.height,
    };
  } catch (error) {
    logger.error(
      'Failed to get image dimensions',
      error instanceof Error ? error : new Error('Unknown error')
    );
    throw new Error('Failed to get image dimensions');
  }
}

/**
 * Calculate estimated base64 size in MB
 */
export function estimateBase64Size(width: number, height: number, quality: number = 0.8): number {
  // Rough estimation: width * height * 3 (RGB) * quality / 1024 / 1024
  // Base64 adds ~33% overhead, so multiply by 1.33
  const estimatedBytes = width * height * 3 * quality * 1.33;
  return estimatedBytes / 1024 / 1024; // Convert to MB
}
