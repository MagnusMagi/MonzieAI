import { Image } from '../../domain/entities/Image';
import { GetImagesUseCase } from '../../domain/usecases/GetImagesUseCase';
import { IImageRepository } from '../../domain/repositories/IImageRepository';
import { IFavoriteRepository } from '../../domain/repositories/IFavoriteRepository';
import { logger } from '../../utils/logger';

/**
 * Favorites ViewModel
 * Manages state and business logic for Favorites screen
 */
export class FavoritesViewModel {
  private favorites: Image[] = [];
  private loading = false;
  private error: string | null = null;

  constructor(
    private getImagesUseCase: GetImagesUseCase,
    private imageRepository: IImageRepository,
    private favoriteRepository: IFavoriteRepository
  ) {}

  /**
   * Load favorites for user
   */
  async loadFavorites(userId: string): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      // Get favorite image IDs from favorites table
      const favoriteImageIds = await this.favoriteRepository.getUserFavoriteImageIds(userId);

      if (favoriteImageIds.length === 0) {
        this.favorites = [];
        return;
      }

      // Fetch full image data for each favorite
      const favoriteImages: Image[] = [];
      for (const imageId of favoriteImageIds) {
        try {
          const image = await this.imageRepository.getImageById(imageId);
          if (image) {
            favoriteImages.push(image);
          }
        } catch (error) {
          // Skip images that can't be loaded
          logger.warn('Failed to load favorite image', {
            imageId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      this.favorites = favoriteImages;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load favorites';
      this.favorites = [];
    } finally {
      this.loading = false;
    }
  }

  /**
   * Remove from favorites
   */
  async removeFavorite(imageId: string, userId: string): Promise<void> {
    // Remove from Supabase
    await this.favoriteRepository.removeFavorite(userId, imageId);
    // Update local state
    this.favorites = this.favorites.filter(img => img.id !== imageId);
  }

  /**
   * Get current state
   */
  getState() {
    return {
      favorites: this.favorites,
      loading: this.loading,
      error: this.error,
    };
  }
}
