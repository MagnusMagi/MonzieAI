import { supabase } from '../../config/supabase';
import { logger } from '../../utils/logger';
import { IFavoriteRepository } from '../../domain/repositories/IFavoriteRepository';

/**
 * Favorite Repository Implementation
 * Handles favorite operations with Supabase
 */
export class FavoriteRepository implements IFavoriteRepository {
  /**
   * Add image to favorites
   */
  async addFavorite(userId: string, imageId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('favorites').insert({
        user_id: userId,
        image_id: imageId,
      });

      if (error) {
        // If error is due to duplicate (already favorited), that's okay
        if (error.code === '23505') {
          logger.info('Image already in favorites', { userId, imageId });
          return true;
        }
        throw error;
      }

      logger.info('Image added to favorites', { userId, imageId });
      return true;
    } catch (error) {
      logger.error(
        'Failed to add favorite',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          userId,
          imageId,
        }
      );
      return false;
    }
  }

  /**
   * Remove image from favorites
   */
  async removeFavorite(userId: string, imageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('image_id', imageId);

      if (error) {
        throw error;
      }

      logger.info('Image removed from favorites', { userId, imageId });
      return true;
    } catch (error) {
      logger.error(
        'Failed to remove favorite',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          userId,
          imageId,
        }
      );
      return false;
    }
  }

  /**
   * Check if image is favorited by user
   */
  async isFavorited(userId: string, imageId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('image_id', imageId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return false; // Not found = not favorited
        }
        throw error;
      }

      return !!data;
    } catch (error) {
      logger.error(
        'Failed to check favorite status',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          userId,
          imageId,
        }
      );
      return false;
    }
  }

  /**
   * Get user's favorite image IDs
   */
  async getUserFavoriteImageIds(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('image_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map(item => item.image_id);
    } catch (error) {
      logger.error(
        'Failed to get user favorites',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          userId,
        }
      );
      return [];
    }
  }

  /**
   * Get user's favorite image IDs (alias for getUserFavoriteImageIds)
   */
  async getUserFavorites(userId: string): Promise<string[]> {
    return this.getUserFavoriteImageIds(userId);
  }
}
