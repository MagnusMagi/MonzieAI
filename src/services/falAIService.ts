import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import { errorLoggingService } from './errorLoggingService';
import { retry } from '../utils/retry';
import { optimizeImageForBase64 } from '../utils/imageOptimization';
import { logger } from '../utils/logger';

/**
 * Fal AI Service
 * Direct integration with Fal AI API (no backend required)
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
  private apiKey: string;
  private baseUrl = 'https://queue.fal.run';

  constructor() {
    // Get API key from environment variable (preferred) or app.json extra config (fallback)
    const falKey =
      process.env.EXPO_PUBLIC_FAL_API_KEY || Constants.expoConfig?.extra?.falApiKey;
    if (!falKey) {
      throw new Error(
        'FAL_API_KEY is not configured. Please set EXPO_PUBLIC_FAL_API_KEY environment variable or falApiKey in app.json extra config.'
      );
    }
    this.apiKey = falKey;
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
   * Generate image using Fal AI directly
   */
  async generateImage(params: FalAIGenerateParams): Promise<FalAIResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('FAL_API_KEY is not configured. Please set EXPO_PUBLIC_FAL_API_KEY environment variable.');
      }

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

      // Prepare request body for Fal AI queue API
      // Using Flux model which supports both text-to-image and image-to-image
      // Fal AI queue API expects direct parameters, NOT 'input' wrapper
      const requestBody: {
        prompt: string;
        image_size: string;
        num_images: number;
        image_url?: string;
        strength?: number; // Image-to-image strength (0.0-1.0), higher = more reference influence
        guidance_scale?: number; // How closely to follow the prompt (higher = more strict)
      } = {
        prompt: params.prompt,
        image_size: params.aspectRatio === '9:16' ? 'portrait_4_3' : 'square_hd',
        num_images: params.numImages || 1,
        guidance_scale: 7.5, // Balanced guidance for face preservation
      };

      // Add image_url and strength if provided (for image-to-image)
      if (imageUrlForFal) {
        requestBody.image_url = imageUrlForFal;
        // Higher strength (0.7-0.9) preserves face better, lower (0.3-0.5) allows more scene variation
        // Using 0.8 for strong face preservation while allowing scene adaptation
        requestBody.strength = 0.8;
      }

      logger.debug('Calling Fal AI...', {
        promptLength: params.prompt.length,
        hasImage: !!imageUrlForFal,
        imageType: imageUrlForFal?.startsWith('data:') ? 'base64' : 'url',
        model: 'fal-ai/flux/dev',
      });

      // Submit request to Fal AI queue with retry logic
      // Note: We don't retry on 4xx errors (client errors), only on 5xx (server errors)
      // Fal AI queue endpoint format: https://queue.fal.run/{model_id}
      const submitResponse = await retry(
        async () => {
          const response = await fetch(`${this.baseUrl}/fal-ai/flux/dev`, {
            method: 'POST',
            headers: {
              Authorization: `Key ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          // Log response details for debugging
          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unable to read error response');
            logger.debug('Fal AI submit response error', {
              status: response.status,
              statusText: response.statusText,
              errorText: errorText.substring(0, 200),
              url: `${this.baseUrl}/fal-ai/flux/dev`,
              requestBody: JSON.stringify(requestBody).substring(0, 200),
            });
          }

          // Only retry on server errors (5xx), not client errors (4xx)
          if (!response.ok && response.status >= 500) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return response;
        },
        {
          maxRetries: 3,
          initialDelay: 1000,
          maxDelay: 5000,
        }
      );

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        let errorMessage = `Fal AI request failed: ${submitResponse.status} ${submitResponse.statusText}`;

        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.detail) {
            errorMessage = `Image generation failed: ${errorJson.detail}`;
          } else if (errorJson.message) {
            errorMessage = `Image generation failed: ${errorJson.message}`;
          } else if (errorJson.error) {
            errorMessage = `Image generation failed: ${errorJson.error}`;
          }
        } catch {
          // If errorText is not JSON, use the text as is
          if (errorText) {
            errorMessage = `Image generation failed: ${errorText}`;
          }
        }

        logger.error('Fal AI submit error', new Error(errorMessage), {
          status: submitResponse.status,
          statusText: submitResponse.statusText,
          body: errorText,
          requestBody: {
            promptLength: params.prompt.length,
            hasImage: !!imageUrlForFal,
            imageType: imageUrlForFal.startsWith('data:') ? 'base64' : 'url',
            imageLength: imageUrlForFal.length,
            strength: requestBody.strength,
            guidanceScale: requestBody.guidance_scale,
          },
        });
        throw new Error(errorMessage);
      }

      const submitData = await submitResponse.json();
      const requestId = submitData.request_id;
      const statusUrl = submitData.status_url; // Use the status URL from response
      const responseUrl = submitData.response_url; // Use the response URL from response

      if (!requestId) {
        throw new Error('Failed to get request ID from Fal AI');
      }

      logger.debug('Request submitted', {
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
            // Use status URL from submit response, or construct from requestId
            const statusEndpoint =
              statusUrl || `${this.baseUrl}/fal-ai/flux/requests/${requestId}/status`;
            const response = await fetch(statusEndpoint, {
              method: 'GET',
              headers: {
                Authorization: `Key ${this.apiKey}`,
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

          // Get the result
          // Use response URL from submit response, or construct from requestId
          const resultEndpoint = responseUrl || `${this.baseUrl}/fal-ai/flux/requests/${requestId}`;
          const resultResponse = await fetch(resultEndpoint, {
            method: 'GET',
            headers: {
              Authorization: `Key ${this.apiKey}`,
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
          throw new Error('Image generation failed');
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
   * Enhance/upscale image using Fal AI Crystal Upscaler
   */
  async enhanceImage(params: FalAIEnhanceParams): Promise<FalAIEnhanceResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('FAL_API_KEY is not configured. Please set EXPO_PUBLIC_FAL_API_KEY environment variable.');
      }

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

      logger.info('Starting image enhancement with Crystal Upscaler', {
        hasImage: !!imageUrlForFal,
        isDataUri: imageUrlForFal.startsWith('data:'),
      });

      // Prepare request body for crystal-upscaler
      const requestBody: {
        image_url?: string;
        scale?: number;
      } = {};

      if (imageUrlForFal.startsWith('data:')) {
        requestBody.image_url = imageUrlForFal;
      } else {
        requestBody.image_url = imageUrlForFal;
      }

      // Submit enhancement request
      const submitResponse = await fetch(`${this.baseUrl}/clarityai/crystal-upscaler`, {
        method: 'POST',
        headers: {
          Authorization: `Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        logger.error(
          'Failed to submit enhancement request',
          new Error(`Status: ${submitResponse.status}, ${errorText}`)
        );
        throw new Error(`Failed to submit enhancement request: ${submitResponse.status}`);
      }

      const submitData = await submitResponse.json();
      const requestId = submitData.request_id;
      const responseUrl = submitData.response_url;

      if (!requestId) {
        throw new Error('No request ID returned from enhancement submission');
      }

      logger.debug('Enhancement request submitted', { requestId, hasResponseUrl: !!responseUrl });

      params.onProgress?.(10, 'Enhancement queued...');

      // Poll for result
      const maxAttempts = 60; // 5 minutes max (5s intervals)
      let attempts = 0;

      while (attempts < maxAttempts) {
        const pollInterval = Math.min(5000 + attempts * 500, 15000); // 5s to 15s
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;

        // Use responseUrl if available, otherwise construct status endpoint with /status suffix
        // Fal AI queue API format: /{model_id}/requests/{request_id}/status
        const statusUrl = responseUrl
          ? `${responseUrl}/status`
          : `${this.baseUrl}/clarityai/crystal-upscaler/requests/${requestId}/status`;

        const statusResponse = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            Authorization: `Key ${this.apiKey}`,
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

          // When status is COMPLETED, the response might be in statusData itself
          // or we need to fetch from the result endpoint
          let resultData = statusData;

          // If statusData doesn't have the image, fetch from result endpoint
          if (!resultData.image && !resultData.url && !resultData.response) {
            const resultEndpoint =
              responseUrl || `${this.baseUrl}/clarityai/crystal-upscaler/requests/${requestId}`;
            const resultResponse = await fetch(resultEndpoint, {
              method: 'GET',
              headers: {
                Authorization: `Key ${this.apiKey}`,
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
          // Format can be: { images: [{ url: "..." }] } or { image: { url: "..." } } or { url: "..." }
          const enhancedImageUrl =
            (resultData.images && resultData.images[0]?.url) || // Array format: { images: [{ url }] }
            resultData.response?.images?.[0]?.url || // Nested array format
            resultData.response?.image?.url || // Object format: { response: { image: { url } } }
            resultData.response?.url ||
            resultData.image?.url || // Direct image object
            resultData.url || // Direct URL
            resultData.response?.image_url ||
            resultData.image_url;

          if (!enhancedImageUrl) {
            logger.error('No enhanced image URL found in response', new Error('No enhanced image URL'), {
              resultDataKeys: Object.keys(resultData),
              resultDataString: JSON.stringify(resultData).substring(0, 500),
            });
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
