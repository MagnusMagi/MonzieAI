import { Image } from '../entities/Image';
import { IImageRepository } from '../repositories/IImageRepository';

/**
 * Use Case: Get Trending Images
 * Business logic for retrieving trending images
 */
export class GetTrendingImagesUseCase {
  constructor(private imageRepository: IImageRepository) {}

  /**
   * Execute use case
   */
  async execute(params: {
    limit?: number;
    offset?: number;
  }): Promise<{ data: Image[]; hasMore: boolean }> {
    // Business logic: Trending images should have minimum engagement
    const result = await this.imageRepository.getTrendingImages({
      limit: params.limit || 10,
      offset: params.offset || 0,
    });

    // Filter images with minimum likes (business rule)
    const trendingImages = result.data.filter(image => image.likes > 0);

    return {
      data: trendingImages,
      hasMore: result.hasMore,
    };
  }
}
