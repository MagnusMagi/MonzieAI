import { Image } from '../entities/Image';
import { IImageRepository } from '../repositories/IImageRepository';

/**
 * Use Case: Get Images
 * Business logic for retrieving images
 */
export class GetImagesUseCase {
  constructor(private imageRepository: IImageRepository) {}

  /**
   * Execute use case
   */
  async execute(params: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Image[]; hasMore: boolean }> {
    return await this.imageRepository.getImages({
      limit: params.limit || 50,
      offset: params.offset || 0,
      category: params.category,
    });
  }
}
