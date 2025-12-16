import { Image } from '../entities/Image';
import { Scene } from '../entities/Scene';
import { IImageRepository } from '../repositories/IImageRepository';
import { ISceneRepository } from '../repositories/ISceneRepository';
import { logger } from '../../utils/logger';

/**
 * Use Case: Generate Image
 * Business logic for AI image generation
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

export interface GenerateImageResult {
  success: boolean;
  image: Image | null;
  error?: string;
}

export class GenerateImageUseCase {
  constructor(
    private imageRepository: IImageRepository,
    private sceneRepository: ISceneRepository,
    private imageGenerationService: {
      generateImage: (params: {
        gender: string;
        imageUri: string;
        sceneId?: string;
        sceneName?: string;
        scenePrompt?: string;
        sceneCategory?: string;
        userId?: string;
        onProgress?: (progress: number, status: string) => void;
      }) => Promise<{
        success: boolean;
        imageUrl: string;
        seed?: number;
        imageId?: string;
        error?: string;
      }>;
    }
  ) {}

  /**
   * Execute use case
   */
  async execute(params: GenerateImageParams): Promise<GenerateImageResult> {
    try {
      // Business logic: Validate scene if sceneId provided
      let scene: Scene | null = null;
      if (params.sceneId) {
        scene = await this.sceneRepository.getSceneById(params.sceneId);
        if (!scene || !scene.isAvailable()) {
          return {
            success: false,
            image: null,
            error: 'Scene not found or not available',
          };
        }
      }

      // Use scene prompt if available
      const finalPrompt = scene
        ? scene.getFormattedPrompt(params.gender)
        : params.scenePrompt?.replace('{gender}', params.gender) ||
          `A professional ${params.gender} portrait`;

      // Generate image
      const result = await this.imageGenerationService.generateImage({
        ...params,
        scenePrompt: finalPrompt,
      });

      if (!result.success || !result.imageUrl) {
        return {
          success: false,
          image: null,
          error: result.error || 'Image generation failed',
        };
      }

      // If image was already saved by imageGenerationService (auto save enabled),
      // retrieve it from repository. Otherwise, image is not saved to database.
      let savedImage: Image | null = null;
      if (result.imageId) {
        // Image was already saved, retrieve it
        savedImage = await this.imageRepository.getImageById(result.imageId);
      }

      return {
        success: true,
        image: savedImage, // Will be null if auto save is disabled
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(
        'GenerateImageUseCase failed',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return {
        success: false,
        image: null,
        error: errorMessage,
      };
    }
  }
}
