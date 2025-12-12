import { falAIService } from './falAIService';
import { databaseService } from './databaseService';
import { storageService } from './storageService';
import * as FileSystem from 'expo-file-system/legacy';
import { optimizeImageForBase64 } from '../utils/imageOptimization';
import { logger } from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Image Generation Service
 * Handles image generation using Fal AI directly (no backend required)
 * Saves generated images to local storage
 */

export interface GenerateImageParams {
  gender: string;
  imageUri: string;
  sceneId?: string;
  sceneName?: string;
  scenePrompt?: string;
  sceneCategory?: string;
  userId?: string;
  onProgress?: (progress: number, status: string) => void;
}

export interface GenerateImageResponse {
  success: boolean;
  imageUrl: string;
  seed?: number;
  hasNsfw?: boolean;
  error?: string;
}

class ImageGenerationService {
  private readonly AUTO_SAVE_KEY = '@monzieai:auto_save_enabled';

  /**
   * Get auto save preference from AsyncStorage
   */
  private async getAutoSavePreference(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(this.AUTO_SAVE_KEY);
      if (value === null) {
        // Default to true if not set
        return true;
      }
      return JSON.parse(value) as boolean;
    } catch (error) {
      logger.warn('Failed to get auto save preference, defaulting to true', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Default to true on error
      return true;
    }
  }

  /**
   * Convert local image URI to base64 data URI with optimization
   */
  private async imageUriToDataUri(imageUri: string): Promise<string> {
    try {
      // Use optimized conversion (resize + compress before base64)
      return await optimizeImageForBase64(imageUri, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        compress: true,
      });
    } catch (error) {
      logger.error(
        'Failed to convert image to data URI',
        error instanceof Error ? error : new Error('Unknown error')
      );

      // Fallback to original method if optimization fails
      try {
        const cleanUri = imageUri.replace('file://', '');
        // Using legacy API for readAsStringAsync (expo-file-system v19+ deprecated it)
        const base64 = await FileSystem.readAsStringAsync(cleanUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        let mimeType = 'image/jpeg';
        if (imageUri.toLowerCase().endsWith('.png')) {
          mimeType = 'image/png';
        } else if (imageUri.toLowerCase().endsWith('.webp')) {
          mimeType = 'image/webp';
        }

        return `data:${mimeType};base64,${base64}`;
      } catch (fallbackError) {
        logger.error(
          'Fallback image conversion failed',
          fallbackError instanceof Error ? fallbackError : new Error('Unknown error')
        );
        throw new Error('Failed to convert image to base64');
      }
    }
  }

  /**
   * Generate image using Fal AI directly (no backend)
   */
  async generateImage(params: GenerateImageParams): Promise<GenerateImageResponse> {
    try {
      // Convert local image URI to base64 if needed
      let imageUrlForFal = params.imageUri;

      if (params.imageUri.startsWith('file://') || params.imageUri.startsWith('/')) {
        const perfStart = logger.performance('Image conversion');
        imageUrlForFal = await this.imageUriToDataUri(params.imageUri);
        logger.performance('Image conversion', perfStart);
        logger.debug('Image converted to base64');
      }

      // Build prompt using scene information
      // For image-to-image, we need to reference the uploaded face
      let prompt = '';

      // Base prompt with gender and scene
      if (params.scenePrompt) {
        // Replace {gender} placeholder with actual gender
        prompt = params.scenePrompt.replace(/{gender}/gi, params.gender);
      } else {
        prompt = `A professional ${params.gender} portrait`;
      }

      // Add image reference instructions for image-to-image generation
      // This tells the AI to use the uploaded image as a face reference
      if (imageUrlForFal) {
        // CRITICAL: Strong face preservation instructions at the beginning
        // Flux model needs explicit instructions to preserve face identity
        const facePreservationPrompt = `[CRITICAL: Use the reference image as the EXACT face template. Maintain identical facial features: same face shape, same eyes (color, shape, size), same nose, same mouth, same eyebrows, same hairline, same skin tone, same facial structure. The person in the reference image MUST be the person in the generated image. Do not change the face identity. Only adapt the scene/background/clothing while keeping the face 100% identical.] `;
        prompt = facePreservationPrompt + prompt;
      }

      // Add quality and style enhancements
      prompt +=
        ', high quality, professional photography, 8k resolution, ultra realistic, detailed, sharp focus';

      // Ensure gender is explicitly mentioned in the prompt
      if (!prompt.toLowerCase().includes(params.gender.toLowerCase())) {
        prompt = `${params.gender} ${prompt}`;
      }

      logger.info('Starting image generation with Fal AI', {
        gender: params.gender,
        sceneName: params.sceneName,
        sceneCategory: params.sceneCategory,
        promptLength: prompt.length,
        hasImage: !!imageUrlForFal,
        faceReferenceMode: imageUrlForFal ? 'enabled (strength: 0.8)' : 'disabled',
        finalPrompt: prompt.substring(0, 150) + '...', // Log first 150 chars
      });

      // Call Fal AI directly with progress callback
      const result = await falAIService.generateImage({
        prompt,
        dataUri: imageUrlForFal.startsWith('data:') ? imageUrlForFal : undefined,
        imageUrl: !imageUrlForFal.startsWith('data:') ? imageUrlForFal : undefined,
        aspectRatio: '9:16',
        numImages: 1,
        onProgress: params.onProgress,
      });

      if (!result.images || result.images.length === 0) {
        throw new Error('No images returned from Fal AI');
      }

      const generatedImageUrl = result.images[0].url;

      // Check auto save preference
      const autoSaveEnabled = await this.getAutoSavePreference();

      // Save to Supabase Storage and Database if auto save is enabled
      let finalImageUrl = generatedImageUrl;
      if (autoSaveEnabled && params.userId) {
        try {
          // Upload to Supabase Storage first
          const uploadResult = await storageService.uploadImageFromUrl(
            generatedImageUrl,
            'generated-images',
            `${params.userId}_${Date.now()}_${result.seed || Math.random().toString(36).substring(7)}.jpg`,
            params.userId
          );

          if (uploadResult.success) {
            finalImageUrl = uploadResult.publicUrl;
            logger.info('Generated image uploaded to Supabase Storage', {
              publicUrl: uploadResult.publicUrl,
              path: uploadResult.path,
            });
          } else {
            logger.warn('Failed to upload to storage, using original URL', {
              error: uploadResult.error,
            });
          }

          // Save to database with storage URL
          const savedImage = await databaseService.createImage({
            title: params.sceneName || `Generated ${params.gender} portrait`,
            image_url: finalImageUrl,
            category: params.sceneCategory || 'Generated',
            description: `AI-generated image using scene: ${params.sceneName || 'Custom'}`,
            user_id: params.userId,
            scene_id: params.sceneId,
            scene_name: params.sceneName,
            prompt: prompt,
            seed: result.seed,
            likes: 0,
            views: 0,
          });
          if (savedImage) {
            logger.info('Generated image saved to Supabase Database', { imageId: savedImage.id });
          }
        } catch (dbError) {
          logger.warn('Failed to save image to Supabase (non-critical)', {
            error: dbError instanceof Error ? dbError.message : 'Unknown error',
          });
          // Continue even if DB save fails - image is still generated
        }
      } else {
        logger.info('Auto save is disabled, skipping storage and database save');
      }

      return {
        success: true,
        imageUrl: finalImageUrl, // Use storage URL if uploaded, otherwise original URL
        seed: result.seed,
        hasNsfw: false, // Fal AI nano-banana doesn't return NSFW flag
      };
    } catch (error: unknown) {
      logger.error(
        'Image generation failed',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          gender: params.gender,
          sceneName: params.sceneName,
        }
      );
      return {
        success: false,
        imageUrl: '',
        error: (error instanceof Error ? error.message : String(error)) || 'Image generation failed',
      };
    }
  }
}

export const imageGenerationService = new ImageGenerationService();
