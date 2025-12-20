import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import { errorLoggingService } from './errorLoggingService';
import { retry } from '../utils/retry';
import { optimizeImageForBase64 } from '../utils/imageOptimization';
import { logger } from '../utils/logger';
import { supabase } from '../config/supabase';

/**
 * Fal AI Service
 * Uses Supabase Edge Functions for secure server-side API calls
 * API keys are stored server-side, not exposed to client
 */

export interface FalAIGenerateParams {
  prompt: string;
  imageUrl?: string;
  dataUri?: string;
  aspectRatio?: string;
  numImages?: number;
  onProgress?: (progress: number, status: string) => void;
}

export interface FalAIResponse {
  images: { url: string }[];
  description?: string;
  seed?: number;
}

export interface FalAIEnhanceParams {
  imageUrl?: string;
  dataUri?: string;
  onProgress?: (progress: number, status: string) => void;
}

export interface FalAIEnhanceResponse {
  image: { url: string };
}

class FalAIService {
  private baseUrl = 'https://queue.fal.run';
  private useEdgeFunctions = true; // Feature flag: use Edge Functions by default

  constructor() {
    // API keys are now stored server-side in Edge Functions
    // No need to load API key in client
  }

  /**
   * Get current session token for Edge Functions authentication
   */
  private async getSessionToken(): Promise<string> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error || !session?.access_token) {
      throw new Error('Not authenticated. Please sign in to generate images.');
    }
    return session.access_token;
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
      logger.warn('Image optimization failed, using fallback method', {
        imageUri: imageUri.substring(0, 50) + '...',
      });

      // Fallback to original method if optimization fails
      try {
        const cleanUri = imageUri.replace('file://', '');
        const base64 = await FileSystem.readAsStringAsync(cleanUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        let mimeType = 'image/jpeg';
        if (imageUri.toLowerCase().endsWith('.png')) {
          mimeType = 'image/png';
        } else if (imageUri.toLowerCase().endsWith('.webp')) {
          mimeType = 'image/webp';
        }

        logger.debug('Image converted using fallback method', { mimeType, size: base64.length });
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
   * Generate image using Supabase Edge Functions (secure server-side API calls)
   */
  async generateImage(params: FalAIGenerateParams): Promise<FalAIResponse> {
    try {
      // Get session token for Edge Functions authentication
      const sessionToken = await this.getSessionToken();

      // Determine image source (dataUri takes priority)
      let imageUrlForFal = params.dataUri || params.imageUrl;

      // If imageUrl is a local file URI, convert to base64
      if (
        params.imageUrl &&
        (params.imageUrl.startsWith('file://') || params.imageUrl.startsWith('/'))
      ) {
        const perfStart = logger.performance('Image conversion to base64');
        imageUrlForFal = await this.imageUriToDataUri(params.imageUrl);
        logger.performance('Image conversion to base64', perfStart);
        logger.debug('Image converted to base64', { length: imageUrlForFal.length });
      }

      if (!imageUrlForFal) {
        throw new Error('Image URL or data URI is required');
      }

      logger.debug('Calling Edge Function for image generation...', {
        promptLength: params.prompt.length,
        hasImage: !!imageUrlForFal,
        imageType: imageUrlForFal?.startsWith('data:') ? 'base64' : 'url',
        useEdgeFunctions: this.useEdgeFunctions,
      });

      // Call Edge Function with retry and better error handling
      let edgeResponse;
      let edgeError;
      const maxRetries = 2;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await supabase.functions.invoke('generate-image', {
            body: {
              prompt: params.prompt,
              imageUrl: !imageUrlForFal.startsWith('data:') ? imageUrlForFal : undefined,
              dataUri: imageUrlForFal.startsWith('data:') ? imageUrlForFal : undefined,
              aspectRatio: params.aspectRatio || '9:16',
              numImages: params.numImages || 1,
            },
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          });

          edgeResponse = result.data;
          edgeError = result.error;

          // If successful, break out of retry loop
          if (!edgeError && edgeResponse) {
            break;
          }

          // If error but not a network error, don't retry
          if (
            edgeError &&
            !edgeError.message?.includes('Failed to send') &&
            !edgeError.message?.includes('network')
          ) {
            break;
          }

          lastError = edgeError;

          // Wait before retry (exponential backoff)
          if (attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 3000);
            logger.debug(`Edge Function call failed, retrying in ${delay}ms...`, {
              attempt: attempt + 1,
              maxRetries,
              error: edgeError?.message,
            });
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } catch (invokeError) {
          lastError = invokeError instanceof Error ? invokeError : new Error(String(invokeError));
          logger.error('Edge Function invoke exception', lastError, {
            attempt: attempt + 1,
            maxRetries,
          });

          // If it's the last attempt, throw
          if (attempt === maxRetries) {
            throw lastError;
          }

          // Wait before retry
          const delay = Math.min(1000 * Math.pow(2, attempt), 3000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      if (edgeError || lastError) {
        const errorMessage =
          edgeError?.message ||
          lastError?.message ||
          'Failed to send a request to the Edge Function';
        logger.error('Edge Function error', edgeError || lastError, {
          errorType: edgeError?.name || lastError?.name,
          errorMessage,
          attempts: maxRetries + 1,
        });

        // Provide more helpful error message
        let userFriendlyMessage = 'Failed to connect to image generation service. ';
        if (errorMessage.includes('network') || errorMessage.includes('Failed to send')) {
          userFriendlyMessage += 'Please check your internet connection and try again.';
        } else if (errorMessage.includes('timeout')) {
          userFriendlyMessage += 'The request timed out. Please try again.';
        } else {
          userFriendlyMessage += errorMessage;
        }

        throw new Error(userFriendlyMessage);
      }

      if (!edgeResponse) {
        logger.error(
          'No response from Edge Function',
          new Error('No response from Edge Function'),
          {
            hasError: !!edgeError,
            hasLastError: !!lastError,
          }
        );
        throw new Error('No response from Edge Function. Please try again.');
      }

      // Edge Function returns: { requestId, statusUrl, responseUrl }
      const { requestId, statusUrl, responseUrl } = edgeResponse;

      if (!requestId || !statusUrl || !responseUrl) {
        throw new Error('Invalid response from Edge Function');
      }

      logger.debug('Request submitted via Edge Function', {
        requestId,
        statusUrl,
        responseUrl,
      });

      // Poll for result with progress tracking
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max
      const initialPollInterval = 2000; // Start with 2 seconds
      const maxPollInterval = 5000; // Max 5 seconds

      // Notify initial progress
      params.onProgress?.(10, 'Request submitted, processing...');

      while (attempts < maxAttempts) {
        // Adaptive polling: faster at start, slower as time passes
        const pollInterval = Math.min(initialPollInterval + attempts * 100, maxPollInterval);
        await new Promise(resolve => setTimeout(resolve, pollInterval));

        // Calculate progress estimate (10% to 90%)
        const progressEstimate = Math.min(10 + (attempts / maxAttempts) * 80, 90);
        params.onProgress?.(progressEstimate, 'Processing image...');

        const statusResponse = await retry(
          async () => {
            const response = await fetch(statusUrl, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${sessionToken}`,
              },
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response;
          },
          {
            maxRetries: 2,
            initialDelay: 500,
            maxDelay: 2000,
          }
        );

        if (!statusResponse.ok) {
          throw new Error(`Failed to check status: ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();
        logger.debug('Fal AI status check', {
          status: statusData.status,
          attempt: attempts + 1,
          maxAttempts,
        });

        // Update progress based on status
        if (statusData.status === 'IN_QUEUE') {
          params.onProgress?.(20, 'Queued, waiting to start...');
        } else if (statusData.status === 'IN_PROGRESS') {
          params.onProgress?.(50, 'Generating image...');
        } else if (statusData.status === 'COMPLETED') {
          params.onProgress?.(95, 'Finalizing...');

          // Get the result from responseUrl
          const resultResponse = await fetch(responseUrl, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          });

          if (!resultResponse.ok) {
            throw new Error(`Failed to get result: ${resultResponse.status}`);
          }

          const resultData = await resultResponse.json();

          logger.debug('Fal AI result received', {
            hasResponse: !!resultData.response,
            hasImages: !!(resultData.response?.images || resultData.images),
            resultKeys: Object.keys(resultData),
            responseKeys: resultData.response ? Object.keys(resultData.response) : [],
          });

          params.onProgress?.(100, 'Complete!');

          // Fal AI response format: resultData.response.images or resultData.images
          const images = resultData.response?.images || resultData.images || [];

          return {
            images: images.map((img: { url?: string } | string) => ({
              url: typeof img === 'string' ? img : img.url || '',
            })),
            description: resultData.response?.description || resultData.description,
            seed: resultData.response?.seed || resultData.seed,
          };
        } else if (statusData.status === 'FAILED') {
          params.onProgress?.(0, 'Generation failed');
          throw new Error(statusData.error || 'Image generation failed');
        }

        attempts++;
      }

      throw new Error('Image generation timeout');
    } catch (error: unknown) {
      logger.error(
        'Fal AI generation failed',
        error instanceof Error ? error : new Error('Unknown error')
      );
      errorLoggingService.logError(
        error instanceof Error ? error : new Error(String(error)),
        null,
        { service: 'FAL_AI', operation: 'generateImage' }
      );
      throw error;
    }
  }

  /**
   * Enhance/upscale image using Supabase Edge Functions (secure server-side API calls)
   */
  async enhanceImage(params: FalAIEnhanceParams): Promise<FalAIEnhanceResponse> {
    try {
      // Get session token for Edge Functions authentication
      const sessionToken = await this.getSessionToken();

      // Determine image source (dataUri takes priority)
      let imageUrlForFal = params.dataUri || params.imageUrl;

      // If imageUrl is a local file URI, convert to base64
      if (
        params.imageUrl &&
        (params.imageUrl.startsWith('file://') || params.imageUrl.startsWith('/'))
      ) {
        const perfStart = logger.performance('Image conversion to base64 for enhancement');
        imageUrlForFal = await this.imageUriToDataUri(params.imageUrl);
        logger.performance('Image conversion to base64 for enhancement', perfStart);
        logger.debug('Image converted to base64 for enhancement', {
          length: imageUrlForFal.length,
        });
      }

      if (!imageUrlForFal) {
        throw new Error('Image URL or data URI is required for enhancement');
      }

      logger.info('Starting image enhancement via Edge Function', {
        hasImage: !!imageUrlForFal,
        isDataUri: imageUrlForFal.startsWith('data:'),
      });

      // Call Edge Function with retry and better error handling
      let edgeResponse;
      let edgeError;
      const maxRetries = 2;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await supabase.functions.invoke('enhance-image', {
            body: {
              imageUrl: !imageUrlForFal.startsWith('data:') ? imageUrlForFal : undefined,
              dataUri: imageUrlForFal.startsWith('data:') ? imageUrlForFal : undefined,
            },
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          });

          edgeResponse = result.data;
          edgeError = result.error;

          // If successful, break out of retry loop
          if (!edgeError && edgeResponse) {
            break;
          }

          // If error but not a network error, don't retry
          if (
            edgeError &&
            !edgeError.message?.includes('Failed to send') &&
            !edgeError.message?.includes('network')
          ) {
            break;
          }

          lastError = edgeError;

          // Wait before retry (exponential backoff)
          if (attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 3000);
            logger.debug(`Edge Function call failed, retrying in ${delay}ms...`, {
              attempt: attempt + 1,
              maxRetries,
              error: edgeError?.message,
            });
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } catch (invokeError) {
          lastError = invokeError instanceof Error ? invokeError : new Error(String(invokeError));
          logger.error('Edge Function invoke exception', lastError, {
            attempt: attempt + 1,
            maxRetries,
          });

          // If it's the last attempt, throw
          if (attempt === maxRetries) {
            throw lastError;
          }

          // Wait before retry
          const delay = Math.min(1000 * Math.pow(2, attempt), 3000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      if (edgeError || lastError) {
        const errorMessage =
          edgeError?.message ||
          lastError?.message ||
          'Failed to send a request to the Edge Function';
        logger.error('Edge Function error', edgeError || lastError, {
          errorType: edgeError?.name || lastError?.name,
          errorMessage,
          attempts: maxRetries + 1,
        });

        // Provide more helpful error message
        let userFriendlyMessage = 'Failed to connect to image enhancement service. ';
        if (errorMessage.includes('network') || errorMessage.includes('Failed to send')) {
          userFriendlyMessage += 'Please check your internet connection and try again.';
        } else if (errorMessage.includes('timeout')) {
          userFriendlyMessage += 'The request timed out. Please try again.';
        } else {
          userFriendlyMessage += errorMessage;
        }

        throw new Error(userFriendlyMessage);
      }

      if (!edgeResponse) {
        logger.error(
          'No response from Edge Function',
          new Error('No response from Edge Function'),
          {
            hasError: !!edgeError,
            hasLastError: !!lastError,
          }
        );
        throw new Error('No response from Edge Function. Please try again.');
      }

      // Edge Function returns: { requestId, statusUrl, responseUrl }
      const { requestId, statusUrl, responseUrl } = edgeResponse;

      if (!requestId || !statusUrl || !responseUrl) {
        throw new Error('Invalid response from Edge Function');
      }

      logger.debug('Enhancement request submitted via Edge Function', {
        requestId,
        statusUrl,
        responseUrl,
      });

      params.onProgress?.(10, 'Enhancement queued...');

      // Poll for result
      const maxAttempts = 60; // 5 minutes max
      let attempts = 0;

      while (attempts < maxAttempts) {
        const pollInterval = Math.min(5000 + attempts * 500, 15000); // 5s to 15s
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;

        const statusResponse = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text().catch(() => 'Unknown error');
          logger.error(
            'Status check failed',
            new Error(`Status: ${statusResponse.status}, ${errorText}`)
          );
          throw new Error(`Failed to check status: ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();
        const progress = Math.min(10 + (attempts / maxAttempts) * 90, 95);

        logger.debug('Enhancement status check', {
          status: statusData.status,
          attempt: attempts + 1,
          progress,
        });

        if (statusData.status === 'IN_QUEUE') {
          params.onProgress?.(progress, 'Queued, waiting to start...');
        } else if (statusData.status === 'IN_PROGRESS') {
          params.onProgress?.(progress, 'Enhancing image...');
        } else if (statusData.status === 'COMPLETED') {
          params.onProgress?.(95, 'Finalizing...');

          // Get result from responseUrl
          let resultData = statusData;

          // If statusData doesn't have the image, fetch from result endpoint
          if (!resultData.image && !resultData.url && !resultData.response) {
            const resultResponse = await fetch(responseUrl, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${sessionToken}`,
              },
            });

            if (!resultResponse.ok) {
              const errorText = await resultResponse.text().catch(() => 'Unknown error');
              logger.error(
                'Failed to get result',
                new Error(`Status: ${resultResponse.status}, ${errorText}`)
              );
              throw new Error(`Failed to get result: ${resultResponse.status}`);
            }

            resultData = await resultResponse.json();
          }

          logger.debug('Enhancement result data', {
            hasImage: !!resultData.image,
            hasUrl: !!resultData.url,
            hasResponse: !!resultData.response,
            hasImages: !!resultData.images,
            keys: Object.keys(resultData),
            responseKeys: resultData.response ? Object.keys(resultData.response) : [],
          });

          params.onProgress?.(100, 'Complete!');

          // Crystal Upscaler response format - try multiple possible paths
          const enhancedImageUrl =
            (resultData.images && resultData.images[0]?.url) ||
            resultData.response?.images?.[0]?.url ||
            resultData.response?.image?.url ||
            resultData.response?.url ||
            resultData.image?.url ||
            resultData.url ||
            resultData.response?.image_url ||
            resultData.image_url;

          if (!enhancedImageUrl) {
            logger.error(
              'No enhanced image URL found in response',
              new Error('No enhanced image URL'),
              {
                resultDataKeys: Object.keys(resultData),
                resultDataString: JSON.stringify(resultData).substring(0, 500),
              }
            );
            throw new Error('No enhanced image URL returned from Crystal Upscaler');
          }

          logger.info('Image enhancement completed', {
            enhancedImageUrl: enhancedImageUrl.substring(0, 50) + '...',
          });

          return {
            image: { url: enhancedImageUrl },
          };
        } else if (statusData.status === 'FAILED') {
          params.onProgress?.(0, 'Enhancement failed');
          throw new Error(statusData.error || 'Image enhancement failed');
        }

        // Continue polling
      }

      throw new Error('Enhancement timeout: Maximum polling attempts reached');
    } catch (error: unknown) {
      logger.error(
        'Image enhancement failed',
        error instanceof Error ? error : new Error('Unknown error')
      );
      throw error;
    }
  }
}

export const falAIService = new FalAIService();
