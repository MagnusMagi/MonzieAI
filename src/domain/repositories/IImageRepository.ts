import { Image } from '../entities/Image';

/**
 * Image Repository Interface
 * Defines contract for image data access
 */
export interface IImageRepository {
  /**
   * Get all images with optional filtering
   */
  getImages(params: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Image[]; hasMore: boolean }>;

  /**
   * Get image by ID
   */
  getImageById(id: string): Promise<Image | null>;

  /**
   * Get trending images
   */
  getTrendingImages(params: {
    limit?: number;
    offset?: number;
  }): Promise<{ data: Image[]; hasMore: boolean }>;

  /**
   * Get images by category
   */
  getImagesByCategory(
    category: string,
    limit?: number,
    offset?: number
  ): Promise<{ data: Image[]; hasMore: boolean }>;

  /**
   * Get images by user ID
   */
  getUserImages(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<{ data: Image[]; hasMore: boolean }>;

  /**
   * Search images by title
   */
  searchImages(query: string, limit?: number): Promise<Image[]>;

  /**
   * Full-text search using PostgreSQL trigram similarity
   */
  fullTextSearch(query: string, limit?: number): Promise<Image[]>;

  /**
   * Create new image
   */
  createImage(image: {
    title: string;
    imageUrl: string;
    category: string;
    description?: string;
    userId?: string;
    sceneId?: string;
    sceneName?: string;
    prompt?: string;
    seed?: number;
    features?: string[];
  }): Promise<Image>;

  /**
   * Update image likes
   */
  updateImageLikes(id: string, increment: number): Promise<boolean>;

  /**
   * Increment image view count
   */
  incrementViewCount(id: string): Promise<boolean>;
}
