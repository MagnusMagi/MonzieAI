import { Image } from '../entities/Image';
import { IImageRepository } from '../repositories/IImageRepository';

/**
 * Use Case: Like Image
 * Business logic for liking an image
 */
export class LikeImageUseCase {
  constructor(private imageRepository: IImageRepository) {}

  /**
   * Execute use case
   */
  async execute(imageId: string): Promise<Image | null> {
    // Get current image
    const image = await this.imageRepository.getImageById(imageId);
    if (!image) {
      return null;
    }

    // Update likes
    const success = await this.imageRepository.updateImageLikes(imageId, 1);
    if (!success) {
      return null;
    }

    // Return updated image with incremented likes
    return new Image(
      image.id,
      image.title,
      image.imageUrl,
      image.category,
      image.likes + 1,
      image.views,
      image.userId,
      image.sceneId,
      image.sceneName,
      image.prompt,
      image.gender,
      image.seed,
      image.model,
      image.createdAt,
      image.updatedAt,
      image.description,
      image.features
    );
  }
}
