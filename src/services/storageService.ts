import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { optimizeImageForBase64, ImageOptimizationOptions } from '../utils/imageOptimization';

/**
 * Storage Service
 * Handles image uploads to Supabase Storage buckets
 */

export interface UploadImageParams {
  imageUri: string;
  bucket: 'generated-images' | 'enhanced-images' | 'avatars' | 'user-uploads';
  fileName?: string;
  userId?: string;
  metadata?: Record<string, string>;
  optimize?: boolean; // Enable image optimization pipeline
  optimizationOptions?: ImageOptimizationOptions; // Custom optimization options
}

export interface UploadImageResult {
  success: boolean;
  publicUrl: string;
  path: string;
  error?: string;
}

class StorageService {
  /**
   * Upload image to Supabase Storage
   */
  async uploadImage(params: UploadImageParams): Promise<UploadImageResult> {
    try {
      const {
        imageUri,
        bucket,
        fileName,
        userId,
        metadata,
        optimize = true,
        optimizationOptions,
      } = params;

      // Generate filename if not provided
      const finalFileName =
        fileName ||
        `${userId || 'anonymous'}_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

      logger.debug('Starting image upload to storage', {
        bucket,
        fileName: finalFileName,
        userId,
        optimize,
      });

      let base64: string;
      const optimizedUri = imageUri;

      // Image optimization pipeline
      if (optimize) {
        try {
          logger.debug('Optimizing image before upload', { imageUri: imageUri.substring(0, 50) });

          // Use optimization utility with custom options or defaults
          const opts = optimizationOptions || {
            maxWidth: bucket === 'enhanced-images' ? 2048 : 1024, // Larger for enhanced images
            maxHeight: bucket === 'enhanced-images' ? 2048 : 1024,
            quality: 0.85, // High quality for storage
            compress: true,
          };

          // Optimize image and get base64 data URI
          const dataUri = await optimizeImageForBase64(imageUri, opts);

          // Extract base64 from data URI
          base64 = dataUri.split(',')[1];

          logger.info('Image optimized successfully', {
            originalUri: imageUri.substring(0, 50),
            optimizedSize: base64.length,
          });
        } catch (optimizationError) {
          logger.warn('Image optimization failed, using original', {
            error: optimizationError instanceof Error ? optimizationError.message : 'Unknown error',
          });
          // Fallback to original image
          base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
      } else {
        // Read file as base64 without optimization
        base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      if (base64.length === 0) {
        throw new Error('Base64 file is empty');
      }

      // Convert base64 to ArrayBuffer
      const arrayBuffer = decode(base64);

      if (arrayBuffer.byteLength === 0) {
        throw new Error('ArrayBuffer is empty - conversion failed');
      }

      // Determine MIME type from file extension
      const fileExt = finalFileName.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType =
        fileExt === 'jpg' ? 'image/jpeg' : fileExt === 'png' ? 'image/png' : `image/${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(finalFileName, arrayBuffer, {
          contentType: mimeType,
          upsert: true,
          cacheControl: '3600',
          metadata: metadata || {},
        });

      if (uploadError) {
        logger.error(
          'Failed to upload image to storage',
          uploadError instanceof Error ? uploadError : new Error('Unknown error'),
          {
            bucket,
            fileName: finalFileName,
            error: uploadError.message,
          }
        );
        return {
          success: false,
          publicUrl: '',
          path: '',
          error: uploadError.message,
        };
      }

      if (!uploadData?.path) {
        throw new Error('Upload succeeded but no path returned');
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);

      logger.info('Image uploaded to storage successfully', {
        bucket,
        path: uploadData.path,
        publicUrl,
      });

      return {
        success: true,
        publicUrl,
        path: uploadData.path,
      };
    } catch (error) {
      logger.error(
        'Image upload to storage failed',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          bucket: params.bucket,
          fileName: params.fileName,
        }
      );
      return {
        success: false,
        publicUrl: '',
        path: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Upload image from URL (download first, then upload)
   */
  async uploadImageFromUrl(
    imageUrl: string,
    bucket: 'generated-images' | 'enhanced-images' | 'avatars' | 'user-uploads',
    fileName?: string,
    userId?: string
  ): Promise<UploadImageResult> {
    try {
      logger.debug('Downloading image from URL for storage upload', { imageUrl, bucket });

      // Download image to local file
      const downloadPath = `${FileSystem.cacheDirectory}temp_${Date.now()}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(imageUrl, downloadPath);

      if (!downloadResult.uri) {
        throw new Error('Failed to download image');
      }

      // Upload from local file
      return this.uploadImage({
        imageUri: downloadResult.uri,
        bucket,
        fileName,
        userId,
      });
    } catch (error) {
      logger.error(
        'Failed to upload image from URL',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          imageUrl,
          bucket,
        }
      );
      return {
        success: false,
        publicUrl: '',
        path: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete image from storage
   */
  async deleteImage(
    bucket: 'generated-images' | 'enhanced-images' | 'avatars' | 'user-uploads',
    path: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        logger.error(
          'Failed to delete image from storage',
          error instanceof Error ? error : new Error('Unknown error'),
          {
            bucket,
            path,
          }
        );
        return false;
      }

      logger.info('Image deleted from storage', { bucket, path });
      return true;
    } catch (error) {
      logger.error(
        'Failed to delete image from storage',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          bucket,
          path,
        }
      );
      return false;
    }
  }

  /**
   * Get public URL for an image in storage
   */
  getPublicUrl(
    bucket: 'generated-images' | 'enhanced-images' | 'avatars' | 'user-uploads',
    path: string
  ): string {
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  }
}

export const storageService = new StorageService();
