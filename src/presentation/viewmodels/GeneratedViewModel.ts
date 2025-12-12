import { Image } from '../../domain/entities/Image';
import { LikeImageUseCase } from '../../domain/usecases/LikeImageUseCase';
import { localStorageService } from '../../services/localStorageService';
import { logger } from '../../utils/logger';

/**
 * Generated ViewModel
 * Manages state and business logic for Generated screen
 */
export class GeneratedViewModel {
  private image: Image | null = null;
  private isLiked = false;
  private loading = false;
  private error: string | null = null;

  constructor(private likeImageUseCase: LikeImageUseCase) {}

  /**
   * Initialize with generated image
   */
  initialize(imageUrl: string, imageId?: string): void {
    // Create temporary image entity for display
    this.image = new Image(
      imageId || 'temp',
      'Generated Image',
      imageUrl,
      'Generated',
      0,
      0,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      new Date(),
      null
    );
  }

  /**
   * Like image
   */
  async likeImage(imageId: string): Promise<void> {
    try {
      const updatedImage = await this.likeImageUseCase.execute(imageId);
      if (updatedImage) {
        this.image = updatedImage;
        this.isLiked = true;
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to like image';
    }
  }

  /**
   * Save to history
   */
  async saveToHistory(image: {
    id: string;
    imageUrl: string;
    prompt: string;
    gender: string;
    sceneName?: string;
    sceneCategory?: string;
    seed?: number;
  }): Promise<void> {
    try {
      await localStorageService.saveToHistory({
        id: image.id,
        imageUrl: image.imageUrl,
        prompt: image.prompt,
        gender: image.gender,
        sceneName: image.sceneName,
        sceneCategory: image.sceneCategory,
        createdAt: new Date().toISOString(),
        seed: image.seed,
      });
    } catch (error) {
      logger.error(
        'Failed to save to history',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      image: this.image,
      isLiked: this.isLiked,
      loading: this.loading,
      error: this.error,
    };
  }
}
