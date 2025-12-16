/**
 * Favorite Repository Interface
 * Defines contract for favorite operations
 */
export interface IFavoriteRepository {
  /**
   * Add image to favorites
   */
  addFavorite(userId: string, imageId: string): Promise<boolean>;

  /**
   * Remove image from favorites
   */
  removeFavorite(userId: string, imageId: string): Promise<boolean>;

  /**
   * Check if image is favorited by user
   */
  isFavorited(userId: string, imageId: string): Promise<boolean>;

  /**
   * Get all favorite image IDs for a user
   */
  getUserFavorites(userId: string): Promise<string[]>;

  /**
   * Get user's favorite image IDs (alias for getUserFavorites)
   */
  getUserFavoriteImageIds(userId: string): Promise<string[]>;
}
